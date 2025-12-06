from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from typing import List, Optional
from app.models.schemas import MedicalRecordResponse, UserRole
from app.core.security import get_current_active_user, require_role
from app.core.database import get_database
from app.services.encryption import encryption_service
from app.services.ipfs import ipfs_service
from app.services.blockchain import blockchain_service
from datetime import datetime
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
import hashlib

router = APIRouter()

@router.post("/upload", response_model=MedicalRecordResponse, status_code=status.HTTP_201_CREATED)
async def upload_medical_record(
    file: UploadFile = File(...),
    record_type: str = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    doctor_id: Optional[str] = Form(None),  # Add this
    hospital_id: Optional[str] = Form(None),  # Add this
    current_user: dict = Depends(get_current_active_user)
):
    """Upload a new medical record with file"""
    db = await get_database()
    
    # Read file content
    file_content = await file.read()
    
    # Calculate record hash first
    record_hash = hashlib.sha256(file_content).hexdigest()
    
    # Check if this exact file already exists for this user
    existing_record = await db.medical_records.find_one({
        "patient_id": str(current_user["_id"]),
        "record_hash": record_hash
    })
    
    if existing_record:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This file has already been uploaded. Duplicate files are not allowed."
        )
    
    # Encrypt file
    encrypted = encryption_service.encrypt_file(file_content)
    
    # Upload to IPFS
    ipfs_result = await ipfs_service.upload_file(
        encrypted["encrypted_data"].encode(),
        file.filename
    )
    
    # Record on blockchain
    blockchain_tx = await blockchain_service.record_medical_data(
        patient_id=str(current_user["_id"]),
        record_hash=record_hash,
        ipfs_hash=ipfs_result["ipfs_hash"],
        metadata={
            "record_type": record_type,
            "title": title,
            "filename": file.filename
        }
    )
    
    # Save to database
    record_dict = {
        "record_type": record_type,
        "title": title,
        "description": description or "",
        "patient_id": str(current_user["_id"]),
        "doctor_id": doctor_id or "",  # Add with default
        "hospital_id": hospital_id or "",
        "ipfs_hash": ipfs_result["ipfs_hash"],
        "encryption_iv": encrypted["iv"],
        "record_hash": record_hash,
        "blockchain_hash": blockchain_tx,
        "encrypted": True,
        "filename": file.filename,
        "file_size": len(file_content),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    try:
        result = await db.medical_records.insert_one(record_dict)
        created_record = await db.medical_records.find_one({"_id": result.inserted_id})
        created_record["id"] = str(created_record.pop("_id"))
        return MedicalRecordResponse(**created_record)
    except DuplicateKeyError:
        # This shouldn't happen due to the check above, but handle it anyway
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This file has already been uploaded."
        )

@router.get("/my-records", response_model=List[MedicalRecordResponse])
async def get_my_records(current_user: dict = Depends(get_current_active_user)):
    """Get all medical records for current user"""
    db = await get_database()
    
    records = []
    cursor = db.medical_records.find({
        "patient_id": str(current_user["_id"]),
        "deleted": {"$ne": True}  # Exclude soft-deleted records
    }).sort("created_at", -1)
    
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        records.append(MedicalRecordResponse(**record))
    
    return records

@router.get("/{record_id}", response_model=MedicalRecordResponse)
async def get_record(
    record_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get specific medical record"""
    db = await get_database()
    
    record = await db.medical_records.find_one({"_id": ObjectId(record_id)})
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record not found"
        )
    
    # Check if user is patient or has consent
    is_patient = str(record["patient_id"]) == str(current_user["_id"])
    
    if not is_patient:
        # Check consent
        has_consent = await check_consent(
            db, record["patient_id"], str(current_user["_id"])
        )
        if not has_consent:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No consent to access this record"
            )
        
        # Log access
        await blockchain_service.record_access(
            patient_id=record["patient_id"],
            accessor_id=str(current_user["_id"]),
            record_id=record_id,
            action="view"
        )
    
    record["id"] = str(record.pop("_id"))
    return MedicalRecordResponse(**record)

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_record(
    record_id: str,
    current_user: dict = Depends(require_role([UserRole.PATIENT, UserRole.ADMIN]))
):
    """Delete medical record (soft delete)"""
    db = await get_database()
    
    record = await db.medical_records.find_one({"_id": ObjectId(record_id)})
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record not found"
        )
    
    # Check ownership
    if str(record["patient_id"]) != str(current_user["_id"]) and current_user["role"] != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this record"
        )
    
    # Soft delete
    await db.medical_records.update_one(
        {"_id": ObjectId(record_id)},
        {"$set": {"deleted": True, "deleted_at": datetime.utcnow()}}
    )

async def check_consent(db, patient_id: str, doctor_id: str) -> bool:
    """Check if doctor has active consent"""
    consent = await db.consent_logs.find_one({
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "status": "approved",
        "expires_at": {"$gt": datetime.utcnow()}
    })
    return consent is not None