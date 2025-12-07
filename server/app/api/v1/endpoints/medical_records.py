from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from fastapi.responses import StreamingResponse
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
import base64
from io import BytesIO

router = APIRouter()

@router.post("/upload", response_model=MedicalRecordResponse, status_code=status.HTTP_201_CREATED)
async def upload_medical_record(
    file: UploadFile = File(...),
    record_type: str = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    doctor_id: Optional[str] = Form(None),
    hospital_id: Optional[str] = Form(None),
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
    
    # Store encrypted file content as base64 in MongoDB
    encrypted_file_base64 = base64.b64encode(encrypted["encrypted_data"].encode()).decode('utf-8')
    
    # Save to database with file content
    record_dict = {
        "record_type": record_type,
        "title": title,
        "description": description or "",
        "patient_id": str(current_user["_id"]),
        "doctor_id": doctor_id or "",
        "hospital_id": hospital_id or "",
        "ipfs_hash": ipfs_result["ipfs_hash"],
        "encryption_iv": encrypted["iv"],
        "record_hash": record_hash,
        "blockchain_hash": blockchain_tx,
        "encrypted": True,
        "filename": file.filename,
        "file_size": len(file_content),
        "content_type": file.content_type or "application/octet-stream",
        "encrypted_file_data": encrypted_file_base64,  # Store encrypted file
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    try:
        result = await db.medical_records.insert_one(record_dict)
        created_record = await db.medical_records.find_one({"_id": result.inserted_id})
        created_record["id"] = str(created_record.pop("_id"))
        
        # Remove file data from response
        if "encrypted_file_data" in created_record:
            del created_record["encrypted_file_data"]
        
        return MedicalRecordResponse(**created_record)
    except DuplicateKeyError:
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
        "deleted": {"$ne": True}
    }).sort("created_at", -1)
    
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        # Remove file data from list response
        if "encrypted_file_data" in record:
            del record["encrypted_file_data"]
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
    
    # Remove file data from response
    if "encrypted_file_data" in record:
        del record["encrypted_file_data"]
    
    return MedicalRecordResponse(**record)

@router.get("/{record_id}/download")
async def download_record(
    record_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Download medical record file"""
    db = await get_database()
    
    record = await db.medical_records.find_one({"_id": ObjectId(record_id)})
    print("Record",record)
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
                detail="No consent to download this record"
            )
        
        # Log access
        await blockchain_service.record_access(
            patient_id=record["patient_id"],
            accessor_id=str(current_user["_id"]),
            record_id=record_id,
            action="download"
        )
    
    # Check if file data exists
    if "encrypted_file_data" not in record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File data not found for this record"
        )
    
    try:
        # Decode base64 encrypted file
        encrypted_file_bytes = base64.b64decode(record["encrypted_file_data"])
        
        # Decrypt file
        decrypted_content = encryption_service.decrypt_file(
            encrypted_file_bytes.decode('utf-8'),
            record["encryption_iv"]
        )
        
        # Create file stream
        file_stream = BytesIO(decrypted_content)
        
        # Get content type and filename
        content_type = record.get("content_type", "application/octet-stream")
        filename = record.get("filename", f"record_{record_id}")
        
        # Return streaming response
        return StreamingResponse(
            file_stream,
            media_type=content_type,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except Exception as e:
        print(f"Error decrypting/downloading file: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to decrypt and download file"
        )

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_record(
    record_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Delete medical record (soft delete)"""
    db = await get_database()
    
    record = await db.medical_records.find_one({"_id": ObjectId(record_id)})
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record not found"
        )
    
    # Check ownership - only the patient who owns the record can delete it
    if str(record["patient_id"]) != str(current_user["_id"]):
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