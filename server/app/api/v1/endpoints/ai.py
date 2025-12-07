# app/api/v1/endpoints/ai.py
from fastapi import APIRouter, HTTPException, status, Depends
from app.models.schemas import (
    HealthSummaryRequest, HealthSummaryResponse,
    PredictionRequest, PredictionResponse, UserRole
)
from app.core.security import get_current_active_user
from app.core.database import get_database
from app.services.ai_service import ai_service
from bson import ObjectId
from datetime import datetime

router = APIRouter()

# ============================================================================
# AUTHORIZATION HELPER
# ============================================================================

async def verify_patient_access(patient_id: str, current_user: dict, db):
    """
    Verify that the current user has access to the patient's data.
    - Patients can access their own data
    - Doctors can access data of patients they have appointments with
    - Admins can access all data
    """
    current_user_id = str(current_user["_id"])
    
    # If accessing own data
    if current_user_id == patient_id:
        return True
    
    # If admin, allow access
    if current_user.get("role") == UserRole.ADMIN.value:
        return True
    
    # If doctor, check if they have appointments with this patient
    if current_user.get("role") == UserRole.DOCTOR.value:
        appointment = await db.appointments.find_one({
            "doctor_id": current_user_id,
            "patient_id": patient_id
        })
        
        if appointment:
            return True
        
        # Also check for active consent (backward compatibility)
        has_consent = await db.consent_logs.find_one({
            "patient_id": patient_id,
            "doctor_id": current_user_id,
            "status": "approved"
        })
        
        if has_consent:
            return True
    
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to access this patient's data"
    )

# ============================================================================
# HEALTH SUMMARY ENDPOINT
# ============================================================================

@router.post("/health-summary", response_model=HealthSummaryResponse)
async def get_health_summary(
    request: HealthSummaryRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """Get AI-powered health summary for a patient"""
    db = await get_database()
    
    # Verify access to patient data
    await verify_patient_access(request.patient_id, current_user, db)
    
    # Verify patient exists
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
    
    if not records:
        # Return empty summary instead of error
        return HealthSummaryResponse(
            summary="No medical records available for analysis.",
            key_conditions=[],
            medications=[],
            recommendations=["Upload medical records to get personalized health insights"],
            risk_factors=[]
        )
    
    print(f"Generating health summary for patient {request.patient_id} with {len(records)} records")
    
    # Generate summary using AI
    result = await ai_service.summarize_medical_history(records)
    
    # Check for errors
    if "error" in result:
        print(f"AI Service Error: {result['error']}")
        # Return a safe default response
        return HealthSummaryResponse(
            summary=f"Unable to generate summary: {result['error']}",
            key_conditions=[],
            medications=[],
            recommendations=["Please try again later"],
            risk_factors=[]
        )
    
    # Validate and ensure all fields are proper types
    try:
        return HealthSummaryResponse(
            summary=str(result.get("summary", "No summary available")),
            key_conditions=result.get("key_conditions", []) if isinstance(result.get("key_conditions"), list) else [],
            medications=result.get("medications", []) if isinstance(result.get("medications"), list) else [],
            recommendations=result.get("recommendations", []) if isinstance(result.get("recommendations"), list) else [],
            risk_factors=result.get("risk_factors", []) if isinstance(result.get("risk_factors"), list) else []
        )
    except Exception as e:
        print(f"Error creating response: {e}")
        print(f"Result was: {result}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error formatting AI response: {str(e)}"
        )

# ============================================================================
# LEGACY ENDPOINT (for backward compatibility)
# ============================================================================

@router.post("/summarize", response_model=HealthSummaryResponse)
async def get_health_summary_legacy(
    request: HealthSummaryRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """Legacy endpoint - redirects to /health-summary"""
    return await get_health_summary(request, current_user)

# ============================================================================
# PREDICTION ENDPOINT
# ============================================================================

@router.post("/predict", response_model=PredictionResponse)
async def predict_health_risks(
    request: PredictionRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """Predict health risks using AI"""
    db = await get_database()
    
    # Verify access to patient data
    await verify_patient_access(request.patient_id, current_user, db)
    
    # Get patient data
    print("Fetching patient data for prediction:", request.patient_id)
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
        "age": patient.get("age", "Unknown"),
        "gender": patient.get("gender", "Unknown"),
        "medical_history": records
    }
    
    # Generate prediction
    result = await ai_service.predict_disease_risk(patient_data)
    print("Prediction Result:", result)
    
    if "error" in result:
        print(f"AI Prediction Error: {result['error']}")
        # Return safe default
        return PredictionResponse(
            prediction_type=request.prediction_type,
            result={},
            confidence=0.0,
            recommendations=[f"Unable to generate prediction: {result['error']}"]
        )
    
    try:
        return PredictionResponse(
            prediction_type=request.prediction_type,
            result=result.get("risks", {}),
            confidence=float(result.get("confidence", 0.0)),
            recommendations=result.get("recommendations", []) if isinstance(result.get("recommendations"), list) else []
        )
    except Exception as e:
        print(f"Error creating prediction response: {e}")
        print(f"Result was: {result}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error formatting prediction response: {str(e)}"
        )

# ============================================================================
# RECOMMENDATIONS ENDPOINT
# ============================================================================

@router.get("/recommendations/{patient_id}")
async def get_health_recommendations_by_patient(
    patient_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get personalized health recommendations for a specific patient"""
    db = await get_database()
    
    # Verify access to patient data
    await verify_patient_access(patient_id, current_user, db)
    
    # Get user profile
    user = await db.users.find_one({"_id": ObjectId(patient_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # Get recent medical records
    records = []
    cursor = db.medical_records.find(
        {"patient_id": patient_id}
    ).sort("created_at", -1).limit(10)

    async for record in cursor:
        # Sanitize record for JSON serialization
        record["_id"] = str(record["_id"])
        record["patient_id"] = str(record["patient_id"])

        # Convert datetime to str
        if "created_at" in record and isinstance(record["created_at"], datetime):
            record["created_at"] = record["created_at"].isoformat()

        if "updated_at" in record and isinstance(record["updated_at"], datetime):
            record["updated_at"] = record["updated_at"].isoformat()

        records.append(record)

    # Build patient profile
    patient_profile = {
        "id": patient_id,
        "age": user.get("age", "Unknown"),
        "gender": user.get("gender", "Unknown"),
        "recent_records": records
    }
    
    print("Generating health recommendations for patient:", patient_profile)
    
    try:
        recommendations = await ai_service.generate_health_recommendations(patient_profile)
        
        # Ensure recommendations is a list
        if not isinstance(recommendations, list):
            recommendations = [str(recommendations)]
        
        return {"recommendations": recommendations}
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        return {
            "recommendations": [
                "Stay hydrated and maintain a balanced diet",
                "Get regular exercise - at least 30 minutes daily",
                "Ensure adequate sleep (7-9 hours per night)",
                "Schedule regular health check-ups",
                "Manage stress through relaxation techniques"
            ]
        }

@router.get("/recommendations")
async def get_health_recommendations(
    current_user: dict = Depends(get_current_active_user)
):
    """Get personalized health recommendations for current user"""
    # Redirect to patient-specific endpoint
    return await get_health_recommendations_by_patient(
        str(current_user["_id"]), 
        current_user
    )