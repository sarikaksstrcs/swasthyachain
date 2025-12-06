# app/api/v1/endpoints/ai.py
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.schemas import (
    HealthSummaryRequest, HealthSummaryResponse,
    PredictionRequest, PredictionResponse
)
from app.core.security import get_current_active_user
from app.core.database import get_database
from app.services.ai_service import ai_service

router = APIRouter()

@router.post("/summarize", response_model=HealthSummaryResponse)
async def get_health_summary(
    request: HealthSummaryRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """Get AI-powered health summary for a patient"""
    db = await get_database()
    
    # Verify patient exists and user has access
    if str(current_user["_id"]) != request.patient_id:
        # Check if user is doctor with consent
        has_consent = await db.consent_logs.find_one({
            "patient_id": request.patient_id,
            "doctor_id": str(current_user["_id"]),
            "status": "approved"
        })
        if not has_consent:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No access to patient records"
            )
    
    # Get medical records
    records = []
    cursor = db.medical_records.find({"patient_id": request.patient_id})
    async for record in cursor:
        records.append(record)
    
    if not records:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No medical records found"
        )
    
    # Generate summary using AI
    result = await ai_service.summarize_medical_history(records)
    
    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result["error"]
        )
    
    return HealthSummaryResponse(
        summary=result.get("summary", ""),
        key_conditions=result.get("key_conditions", []),
        medications=result.get("medications", []),
        recommendations=result.get("recommendations", []),
        risk_factors=result.get("risk_factors", [])
    )

@router.post("/predict", response_model=PredictionResponse)
async def predict_health_risks(
    request: PredictionRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """Predict health risks using AI"""
    db = await get_database()
    
    # Verify access
    if str(current_user["_id"]) != request.patient_id:
        has_consent = await db.consent_logs.find_one({
            "patient_id": request.patient_id,
            "doctor_id": str(current_user["_id"]),
            "status": "approved"
        })
        if not has_consent:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No access to patient records"
            )
    
    # Get patient data
    patient = await db.users.find_one({"_id": ObjectId(request.patient_id)})
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Get medical records
    records = []
    cursor = db.medical_records.find({"patient_id": request.patient_id})
    async for record in cursor:
        records.append(record)
    
    patient_data = {
        "age": patient.get("age"),
        "gender": patient.get("gender"),
        "medical_history": records
    }
    
    # Generate prediction
    result = await ai_service.predict_disease_risk(patient_data)
    
    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result["error"]
        )
    
    return PredictionResponse(
        prediction_type=request.prediction_type,
        result=result.get("risks", {}),
        confidence=result.get("confidence", 0.0),
        recommendations=result.get("recommendations", [])
    )

@router.get("/recommendations")
async def get_health_recommendations(
    current_user: dict = Depends(get_current_active_user)
):
    """Get personalized health recommendations"""
    db = await get_database()
    
    # Get user profile
    user = await db.users.find_one({"_id": current_user["_id"]})
    
    # Get recent medical records
    records = []
    cursor = db.medical_records.find(
        {"patient_id": str(current_user["_id"])}
    ).sort("created_at", -1).limit(10)
    
    async for record in cursor:
        records.append(record)
    
    patient_profile = {
        "age": user.get("age"),
        "gender": user.get("gender"),
        "recent_records": records
    }
    
    recommendations = await ai_service.generate_health_recommendations(patient_profile)
    
    return {"recommendations": recommendations}