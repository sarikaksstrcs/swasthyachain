# app/models/schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict
from datetime import datetime,date, time
from enum import Enum

# Enums
class UserRole(str, Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    HOSPITAL = "hospital"
    INSURER = "insurer"
    ADMIN = "admin"

class ConsentStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    DENIED = "denied"
    REVOKED = "revoked"
    EXPIRED = "expired"

class AccessType(str, Enum):
    READ = "read"
    WRITE = "write"
    FULL = "full"

class RecordType(str, Enum):
    PRESCRIPTION = "prescription"
    LAB_REPORT = "lab_report"
    IMAGING = "imaging"
    DIAGNOSIS = "diagnosis"
    SURGERY = "surgery"
    VACCINATION = "vaccination"

# User Models
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    blockchain_address: str
    is_active: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

# Medical Record Models
class MedicalRecordCreate(BaseModel):
    record_type: RecordType
    title: str
    description: Optional[str] = None
    doctor_id: Optional[str] = None
    hospital_id: Optional[str] = None
    diagnosis: Optional[str] = None
    medications: Optional[List[str]] = None
    metadata: Optional[Dict] = None

class MedicalRecordResponse(BaseModel):
    id: str
    patient_id: str
    record_type: str  # Changed from RecordType enum to str
    title: str
    description: Optional[str] = None
    ipfs_hash: str
    blockchain_hash: str
    encrypted: bool
    doctor_id: Optional[str] = None
    hospital_id: Optional[str] = None
    filename: Optional[str] = None  # Add this if it's in DB
    file_size: Optional[int] = None  # Add this if it's in DB
    record_hash: Optional[str] = None  # Add this if it's in DB
    encryption_iv: Optional[str] = None  # Add this if it's in DB
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Consent Models
class ConsentRequest(BaseModel):
    doctor_id: str
    patient_email: str
    access_type: AccessType
    duration_hours: int = Field(ge=1, le=720)
    reason: str
    record_ids: Optional[List[str]] = None


class ConsentResponse(BaseModel):
    id: str
    doctor_id: str
    patient_id: str
    patient_email: Optional[str] = None
    access_type: AccessType
    duration_hours: int
    reason: str
    record_ids: Optional[List[str]] = None
    status: ConsentStatus
    blockchain_tx_id: str
    created_at: datetime
    updated_at: datetime
    # Make these optional since they're only set when approved
    granted_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ConsentUpdate(BaseModel):
    status: Optional[ConsentStatus] = None
    granted_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    blockchain_tx_id: Optional[str] = None

# Access Log Models
class AccessLogResponse(BaseModel):
    id: str
    patient_id: str
    accessor_id: str
    accessor_role: UserRole
    record_id: str
    action: str
    is_emergency: bool
    blockchain_tx_id: str
    accessed_at: datetime

# AI Models
class HealthSummaryRequest(BaseModel):
    patient_id: str
    
class HealthSummaryResponse(BaseModel):
    summary: str
    key_conditions: List[str]
    medications: List[str]
    recommendations: List[str]
    risk_factors: List[str]

class PredictionRequest(BaseModel):
    patient_id: str
    prediction_type: str  # "disease_risk", "readmission", etc.

class PredictionResponse(BaseModel):
    prediction_type: str
    result: Dict
    confidence: float
    recommendations: List[str]
# Add these to app/models/schemas.py



class AppointmentStatus(str, Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    NO_SHOW = "no_show"

# Doctor Availability Models
class DoctorAvailabilityCreate(BaseModel):
    date: date
    start_time: time
    end_time: time
    is_available: bool = True

class DoctorAvailabilityResponse(BaseModel):
    id: str
    doctor_id: str
    date: date
    start_time: time
    end_time: time
    is_available: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Appointment Models
class AppointmentCreate(BaseModel):
    doctor_id: str
    slot_id: str
    reason: str
    notes: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: str
    patient_id: str
    patient_name: str
    doctor_id: str
    doctor_name: str
    slot_id: str
    appointment_date: date
    start_time: time
    end_time: time
    reason: str
    notes: Optional[str] = None
    status: AppointmentStatus
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class AppointmentUpdate(BaseModel):
    status: Optional[AppointmentStatus] = None
    notes: Optional[str] = None