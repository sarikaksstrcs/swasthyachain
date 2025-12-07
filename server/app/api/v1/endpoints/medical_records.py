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
    patient_id: Optional[str] = Form(None),  # NEW: Allow doctor to specify patient
    doctor_id: Optional[str] = Form(None),
    hospital_id: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_active_user)
):
    """Upload a new medical record with file - for both patients and doctors"""
    db = await get_database()
    
    # Determine the actual patient ID
    actual_patient_id = None
    
    if current_user["role"] == UserRole.PATIENT.value:
        # Patients can only upload for themselves
        actual_patient_id = str(current_user["_id"])
    elif current_user["role"] == UserRole.DOCTOR.value:
        # Doctors must specify a patient_id
        if not patient_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Doctor must specify patient_id when uploading records"
            )
        
        # Verify the patient exists and has had an appointment with this doctor
        patient = await db.users.find_one({
            "_id": ObjectId(patient_id),
            "role": UserRole.PATIENT.value
        })
        
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
        
        # Verify doctor has treated this patient
        appointment = await db.appointments.find_one({
            "doctor_id": str(current_user["_id"]),
            "patient_id": patient_id
        })
        
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only upload records for patients you have treated"
            )
        
        actual_patient_id = patient_id
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients and doctors can upload medical records"
        )
    
    # Read file content
    file_content = await file.read()
    
    # Calculate record hash
    record_hash = hashlib.sha256(file_content).hexdigest()
    
    # Check if this exact file already exists for this patient
    existing_record = await db.medical_records.find_one({
        "patient_id": actual_patient_id,
        "record_hash": record_hash
    })
    
    if existing_record:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This file has already been uploaded for this patient."
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
        patient_id=actual_patient_id,
        record_hash=record_hash,
        ipfs_hash=ipfs_result["ipfs_hash"],
        metadata={
            "record_type": record_type,
            "title": title,
            "filename": file.filename,
            "uploaded_by": str(current_user["_id"]),
            "uploaded_by_role": current_user["role"]
        }
    )
    
    # Store encrypted file content as base64 in MongoDB
    encrypted_file_base64 = base64.b64encode(encrypted["encrypted_data"].encode()).decode('utf-8')
    
    # Save to database with file content
    record_dict = {
        "record_type": record_type,
        "title": title,
        "description": description or "",
        "patient_id": actual_patient_id,
        "doctor_id": doctor_id or (str(current_user["_id"]) if current_user["role"] == UserRole.DOCTOR.value else ""),
        "hospital_id": hospital_id or "",
        "uploaded_by": str(current_user["_id"]),
        "uploaded_by_role": current_user["role"],
        "ipfs_hash": ipfs_result["ipfs_hash"],
        "encryption_iv": encrypted["iv"],
        "record_hash": record_hash,
        "blockchain_hash": blockchain_tx,
        "encrypted": True,
        "filename": file.filename,
        "file_size": len(file_content),
        "content_type": file.content_type or "application/octet-stream",
        "encrypted_file_data": encrypted_file_base64,
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
        if "encrypted_file_data" in record:
            del record["encrypted_file_data"]
        records.append(MedicalRecordResponse(**record))
    
    return records

@router.get("/patient/{patient_id}", response_model=List[MedicalRecordResponse])
async def get_patient_records(
    patient_id: str,
    current_user: dict = Depends(require_role([UserRole.DOCTOR]))
):
    """Get all medical records for a specific patient (doctor only)"""
    db = await get_database()
    
    # Verify patient exists
    patient = await db.users.find_one({
        "_id": ObjectId(patient_id),
        "role": UserRole.PATIENT.value
    })
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Verify doctor has treated this patient
    appointment = await db.appointments.find_one({
        "doctor_id": str(current_user["_id"]),
        "patient_id": patient_id
    })
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view records for patients you have treated"
        )
    
    records = []
    cursor = db.medical_records.find({
        "patient_id": patient_id,
        "deleted": {"$ne": True}
    }).sort("created_at", -1)
    
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
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
        has_consent = await check_consent(
            db, record["patient_id"], str(current_user["_id"])
        )
        if not has_consent:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No consent to access this record"
            )
        
        await blockchain_service.record_access(
            patient_id=record["patient_id"],
            accessor_id=str(current_user["_id"]),
            record_id=record_id,
            action="view"
        )
    
    record["id"] = str(record.pop("_id"))
    
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
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record not found"
        )
    
    is_patient = str(record["patient_id"]) == str(current_user["_id"])
    
    if not is_patient:
        has_consent = await check_consent(
            db, record["patient_id"], str(current_user["_id"])
        )
        if not has_consent:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No consent to download this record"
            )
        
        await blockchain_service.record_access(
            patient_id=record["patient_id"],
            accessor_id=str(current_user["_id"]),
            record_id=record_id,
            action="download"
        )
    
    if "encrypted_file_data" not in record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File data not found for this record"
        )
    
    try:
        encrypted_file_bytes = base64.b64decode(record["encrypted_file_data"])
        decrypted_content = encryption_service.decrypt_file(
            encrypted_file_bytes.decode('utf-8'),
            record["encryption_iv"]
        )
        
        file_stream = BytesIO(decrypted_content)
        content_type = record.get("content_type", "application/octet-stream")
        filename = record.get("filename", f"record_{record_id}")
        
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
    
    if str(record["patient_id"]) != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this record"
        )
    
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