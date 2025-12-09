# app/api/v1/endpoints/consent.py
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.models.schemas import (
    ConsentRequest, ConsentResponse, ConsentUpdate, 
    ConsentStatus, UserRole, MedicalRecordResponse
)
from app.core.security import get_current_active_user, require_role
from app.core.database import get_database
from app.services.blockchain import blockchain_service
from datetime import datetime, timedelta
from bson import ObjectId

router = APIRouter()

@router.post("/request", response_model=ConsentResponse, status_code=status.HTTP_201_CREATED)
async def request_consent(
    consent_req: ConsentRequest,
    current_user: dict = Depends(require_role([UserRole.DOCTOR]))
):
    """Doctor requests consent from patient"""
    db = await get_database()
    
    # Verify doctor exists and matches current user
    if str(current_user["_id"]) != consent_req.doctor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doctor ID must match authenticated user"
        )
    
    # Find patient by email
    patient = await db.users.find_one({"email": consent_req.patient_email})
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found with this email"
        )
    
    if patient["role"] != UserRole.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email does not belong to a patient"
        )
    
    # Create consent request
    consent_dict = consent_req.dict()
    consent_dict.update({
        "patient_id": str(patient["_id"]),  # Use found patient's ID
        "status": ConsentStatus.PENDING,
        "blockchain_tx_id": "",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "granted_at": None,  # Set to None initially
        "expires_at": None   # Set to None initially
    })
    
    result = await db.consent_logs.insert_one(consent_dict)
    
    created_consent = await db.consent_logs.find_one({"_id": result.inserted_id})
    created_consent["id"] = str(created_consent.pop("_id"))
    
    return ConsentResponse(**created_consent)

@router.get("/pending", response_model=List[ConsentResponse])
async def get_pending_consents(
    current_user: dict = Depends(require_role([UserRole.PATIENT]))
):
    """Get all pending consent requests for patient"""
    db = await get_database()
    
    consents = []
    cursor = db.consent_logs.find({
        "patient_id": str(current_user["_id"]),
        "status": ConsentStatus.PENDING
    })
    
    async for consent in cursor:
        consent["id"] = str(consent.pop("_id"))
        consents.append(ConsentResponse(**consent))
    
    return consents

@router.put("/{consent_id}/approve", response_model=ConsentResponse)
async def approve_consent(
    consent_id: str,
    current_user: dict = Depends(require_role([UserRole.PATIENT]))
):
    """Patient approves consent request"""
    db = await get_database()
    
    consent = await db.consent_logs.find_one({"_id": ObjectId(consent_id)})
    
    if not consent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent request not found"
        )
    
    # Verify ownership
    if str(consent["patient_id"]) != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    # Record on blockchain
    blockchain_tx = await blockchain_service.record_consent(
        patient_id=str(current_user["_id"]),
        doctor_id=consent["doctor_id"],
        consent_data={
            "access_type": consent["access_type"],
            "record_ids": consent.get("record_ids"),
            "duration_hours": consent["duration_hours"]
        }
    )
    
    # Update consent
    granted_at = datetime.utcnow()
    expires_at = granted_at + timedelta(hours=consent["duration_hours"])
    
    await db.consent_logs.update_one(
        {"_id": ObjectId(consent_id)},
        {
            "$set": {
                "status": ConsentStatus.APPROVED,
                "granted_at": granted_at,
                "expires_at": expires_at,
                "blockchain_tx_id": blockchain_tx,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    updated_consent = await db.consent_logs.find_one({"_id": ObjectId(consent_id)})
    updated_consent["id"] = str(updated_consent.pop("_id"))
    
    return ConsentResponse(**updated_consent)

@router.put("/{consent_id}/deny", response_model=ConsentResponse)
async def deny_consent(
    consent_id: str,
    current_user: dict = Depends(require_role([UserRole.PATIENT]))
):
    """Patient denies consent request"""
    db = await get_database()
    
    consent = await db.consent_logs.find_one({"_id": ObjectId(consent_id)})
    
    if not consent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent request not found"
        )
    
    if str(consent["patient_id"]) != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    await db.consent_logs.update_one(
        {"_id": ObjectId(consent_id)},
        {
            "$set": {
                "status": ConsentStatus.DENIED,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    updated_consent = await db.consent_logs.find_one({"_id": ObjectId(consent_id)})
    updated_consent["id"] = str(updated_consent.pop("_id"))
    
    return ConsentResponse(**updated_consent)

@router.delete("/{consent_id}/revoke", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_consent(
    consent_id: str,
    current_user: dict = Depends(require_role([UserRole.PATIENT]))
):
    """Patient revokes previously granted consent"""
    db = await get_database()
    
    consent = await db.consent_logs.find_one({"_id": ObjectId(consent_id)})
    
    if not consent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent not found"
        )
    
    if str(consent["patient_id"]) != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    # Record revocation on blockchain
    await blockchain_service.revoke_consent(
        patient_id=str(current_user["_id"]),
        doctor_id=consent["doctor_id"]
    )
    
    await db.consent_logs.update_one(
        {"_id": ObjectId(consent_id)},
        {
            "$set": {
                "status": ConsentStatus.REVOKED,
                "updated_at": datetime.utcnow()
            }
        }
    )

@router.get("/my-consents", response_model=List[ConsentResponse])
async def get_my_consents(
    current_user: dict = Depends(get_current_active_user)
):
    """Get all consents for current user"""
    db = await get_database()
    
    # Different query based on role
    if current_user["role"] == UserRole.PATIENT:
        query = {"patient_id": str(current_user["_id"])}
    elif current_user["role"] == UserRole.DOCTOR:
        query = {"doctor_id": str(current_user["_id"])}
    else:
        return []
    
    consents = []
    cursor = db.consent_logs.find(query).sort("created_at", -1)
    
    async for consent in cursor:
        consent["id"] = str(consent.pop("_id"))
        consents.append(ConsentResponse(**consent))
    
    return consents

@router.get("/patient-records/{doctor_id}", response_model=List[MedicalRecordResponse])
async def get_patient_records_by_doctor(
    doctor_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get all patient records associated with a specific doctor"""
    db = await get_database()
    
    # Verify the requesting user is the doctor or has appropriate permissions
    if current_user["role"] not in [UserRole.DOCTOR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors and admins can access this endpoint"
        )
    
    # If user is a doctor, ensure they're requesting their own records
    if current_user["role"] == UserRole.DOCTOR and str(current_user["_id"]) != doctor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doctors can only access their own patient records"
        )
    
    # Query medical records where doctor_id matches
    records = []
    cursor = db.medical_records.find({
        "doctor_id": doctor_id
    }).sort("created_at", -1)
    
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        records.append(MedicalRecordResponse(**record))
    
    return records