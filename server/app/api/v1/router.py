from fastapi import APIRouter
from app.api.v1.endpoints import auth, medical_records, consent, appoinments, ai

api_router = APIRouter()

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

api_router.include_router(
    medical_records.router,
    prefix="/records",
    tags=["Medical Records"]
)

api_router.include_router(
    consent.router,
    prefix="/consent",
    tags=["Consent Management"]
)

api_router.include_router(
    ai.router,
    prefix="/ai",
    tags=["AI Services"]
)
api_router.include_router(
    appoinments.router,
    prefix="/appointments",
    tags=["appointments"]
)