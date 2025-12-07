# app/api/v1/endpoints/appointments.py
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime, date, time
from bson import ObjectId
from app.models.schemas import (
    AppointmentCreate, AppointmentResponse, AppointmentUpdate,
    AppointmentStatus, UserRole, DoctorAvailabilityCreate,
    DoctorAvailabilityResponse
)
from app.core.security import get_current_active_user, require_role
from app.core.database import get_database

router = APIRouter()

# ============================================================================
# HELPER FUNCTIONS FOR DATE/TIME CONVERSION
# ============================================================================

def prepare_for_db(data_dict: dict) -> dict:
    """Convert date and time objects to ISO strings for MongoDB storage"""
    if isinstance(data_dict.get('date'), date):
        data_dict['date'] = data_dict['date'].isoformat()
    if isinstance(data_dict.get('appointment_date'), date):
        data_dict['appointment_date'] = data_dict['appointment_date'].isoformat()
    if isinstance(data_dict.get('start_time'), time):
        data_dict['start_time'] = data_dict['start_time'].isoformat()
    if isinstance(data_dict.get('end_time'), time):
        data_dict['end_time'] = data_dict['end_time'].isoformat()
    return data_dict

def prepare_for_response(data_dict: dict) -> dict:
    """Convert ISO strings back to date and time objects for API response"""
    if isinstance(data_dict.get('date'), str):
        try:
            data_dict['date'] = date.fromisoformat(data_dict['date'])
        except (ValueError, AttributeError):
            pass
    if isinstance(data_dict.get('appointment_date'), str):
        try:
            data_dict['appointment_date'] = date.fromisoformat(data_dict['appointment_date'])
        except (ValueError, AttributeError):
            pass
    if isinstance(data_dict.get('start_time'), str):
        try:
            data_dict['start_time'] = time.fromisoformat(data_dict['start_time'])
        except (ValueError, AttributeError):
            pass
    if isinstance(data_dict.get('end_time'), str):
        try:
            data_dict['end_time'] = time.fromisoformat(data_dict['end_time'])
        except (ValueError, AttributeError):
            pass
    return data_dict

# ============================================================================
# AVAILABILITY ENDPOINTS
# ============================================================================

@router.post("/availability", response_model=DoctorAvailabilityResponse, status_code=status.HTTP_201_CREATED)
async def set_availability(
    availability: DoctorAvailabilityCreate,
    current_user: dict = Depends(require_role([UserRole.DOCTOR]))
):
    """Doctor sets their availability slots"""
    db = await get_database()
    
    # Convert to dict and prepare for MongoDB
    availability_dict = availability.dict()
    availability_dict = prepare_for_db(availability_dict)
    
    # Add metadata
    availability_dict.update({
        "doctor_id": str(current_user["_id"]),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
    # Check for overlapping slots
    existing_slot = await db.doctor_availability.find_one({
        "doctor_id": availability_dict["doctor_id"],
        "date": availability_dict["date"],
        "is_available": True,
        "$or": [
            {
                "start_time": {"$lt": availability_dict["end_time"]},
                "end_time": {"$gt": availability_dict["start_time"]}
            }
        ]
    })
    
    if existing_slot:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This time slot overlaps with an existing availability slot"
        )
    
    # Insert into database
    result = await db.doctor_availability.insert_one(availability_dict)
    created = await db.doctor_availability.find_one({"_id": result.inserted_id})
    
    # Prepare for response
    created["id"] = str(created.pop("_id"))
    created = prepare_for_response(created)
    
    return DoctorAvailabilityResponse(**created)

@router.get("/availability/{doctor_id}", response_model=List[DoctorAvailabilityResponse])
async def get_doctor_availability(
    doctor_id: str,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user: dict = Depends(get_current_active_user)
):
    """Get doctor's available slots"""
    db = await get_database()
    
    # Build query
    query = {
        "doctor_id": doctor_id,
        "is_available": True
    }
    
    # Add date range filter if provided
    if date_from or date_to:
        date_filter = {}
        if date_from:
            date_filter["$gte"] = date_from
        if date_to:
            date_filter["$lte"] = date_to
        query["date"] = date_filter
    
    # Get availability slots
    slots = []
    cursor = db.doctor_availability.find(query).sort("date", 1).sort("start_time", 1)
    
    async for slot in cursor:
        slot["id"] = str(slot.pop("_id"))
        slot = prepare_for_response(slot)
        slots.append(DoctorAvailabilityResponse(**slot))
    
    return slots

# ============================================================================
# DOCTOR LIST ENDPOINT
# ============================================================================

@router.get("/doctors", response_model=List[dict])
async def list_doctors(
    specialization: Optional[str] = None,
    current_user: dict = Depends(get_current_active_user)
):
    """List all doctors with optional specialization filter"""
    db = await get_database()
    
    query = {"role": UserRole.DOCTOR.value, "is_active": True}
    if specialization:
        query["specialization"] = specialization
    
    doctors = []
    cursor = db.users.find(query).sort("full_name", 1)
    
    async for doctor in cursor:
        doctors.append({
            "id": str(doctor["_id"]),
            "full_name": doctor["full_name"],
            "email": doctor["email"],
            "specialization": doctor.get("specialization", "General Practitioner"),
            "phone": doctor.get("phone")
        })
    
    return doctors

# ============================================================================
# APPOINTMENT BOOKING ENDPOINTS
# ============================================================================

@router.post("/book", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def book_appointment(
    appointment: AppointmentCreate,
    current_user: dict = Depends(require_role([UserRole.PATIENT]))
):
    """Patient books an appointment with a doctor"""
    db = await get_database()
    
    # Verify doctor exists
    doctor = await db.users.find_one({"_id": ObjectId(appointment.doctor_id)})
    if not doctor or doctor["role"] != UserRole.DOCTOR.value:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    # Check if slot is available
    slot = await db.doctor_availability.find_one({
        "_id": ObjectId(appointment.slot_id),
        "doctor_id": appointment.doctor_id,
        "is_available": True
    })
    
    if not slot:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slot is not available"
        )
    
    # Create appointment
    appointment_dict = {
        "patient_id": str(current_user["_id"]),
        "patient_name": current_user["full_name"],
        "doctor_id": appointment.doctor_id,
        "doctor_name": doctor["full_name"],
        "slot_id": appointment.slot_id,
        "appointment_date": slot["date"],  # Already ISO string from DB
        "start_time": slot["start_time"],  # Already ISO string from DB
        "end_time": slot["end_time"],  # Already ISO string from DB
        "reason": appointment.reason,
        "notes": appointment.notes,
        "status": AppointmentStatus.SCHEDULED.value,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.appointments.insert_one(appointment_dict)
    
    # Mark slot as unavailable
    await db.doctor_availability.update_one(
        {"_id": ObjectId(appointment.slot_id)},
        {"$set": {"is_available": False, "updated_at": datetime.utcnow()}}
    )
    
    # Add patient to doctor's patient list if not already there
    await db.users.update_one(
        {"_id": ObjectId(appointment.doctor_id)},
        {"$addToSet": {"patient_list": str(current_user["_id"])}}
    )
    
    # Get created appointment
    created_appointment = await db.appointments.find_one({"_id": result.inserted_id})
    created_appointment["id"] = str(created_appointment.pop("_id"))
    created_appointment = prepare_for_response(created_appointment)
    
    return AppointmentResponse(**created_appointment)

# ============================================================================
# APPOINTMENT RETRIEVAL ENDPOINTS
# ============================================================================

@router.get("/my-appointments", response_model=List[AppointmentResponse])
async def get_my_appointments(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_active_user)
):
    """Get appointments for current user (patient or doctor)"""
    db = await get_database()
    
    # Build query based on user role
    if current_user["role"] == UserRole.PATIENT.value:
        query = {"patient_id": str(current_user["_id"])}
    elif current_user["role"] == UserRole.DOCTOR.value:
        query = {"doctor_id": str(current_user["_id"])}
    else:
        return []
    print("QUERY:", query,status)
    # Add status filter if provided
    if status:
        query["status"] = status
    
    # Get appointments
    appointments = []
    cursor = db.appointments.find(query).sort("appointment_date", -1).sort("start_time", 1)
    
    async for apt in cursor:
        apt["id"] = str(apt.pop("_id"))
        apt = prepare_for_response(apt)
        appointments.append(AppointmentResponse(**apt))
    
    return appointments

@router.get("/appointments/date/{date_str}")
async def get_appointments_by_date(
    date_str: str,
    current_user: dict = Depends(require_role([UserRole.DOCTOR]))
):
    """Get all appointments for a doctor on a specific date"""
    db = await get_database()
    
    appointments = []
    cursor = db.appointments.find({
        "doctor_id": str(current_user["_id"]),
        "appointment_date": date_str
    }).sort("start_time", 1)
    
    async for apt in cursor:
        apt["id"] = str(apt.pop("_id"))
        apt = prepare_for_response(apt)
        appointments.append(apt)
    
    return appointments

@router.get("/appointments/month/{year}/{month}")
async def get_appointments_summary(
    year: int,
    month: int,
    current_user: dict = Depends(require_role([UserRole.DOCTOR]))
):
    """Get appointment count summary for each day in a month"""
    db = await get_database()
    
    # Create date range for the month
    from calendar import monthrange
    _, last_day = monthrange(year, month)
    
    start_date = f"{year}-{month:02d}-01"
    end_date = f"{year}-{month:02d}-{last_day}"
    
    # Aggregate appointments by date
    pipeline = [
        {
            "$match": {
                "doctor_id": str(current_user["_id"]),
                "appointment_date": {"$gte": start_date, "$lte": end_date}
            }
        },
        {
            "$group": {
                "_id": "$appointment_date",
                "count": {"$sum": 1}
            }
        },
        {
            "$project": {
                "date": "$_id",
                "count": 1,
                "_id": 0
            }
        },
        {
            "$sort": {"date": 1}
        }
    ]
    
    result = []
    async for doc in db.appointments.aggregate(pipeline):
        result.append(doc)
    
    return result

# ============================================================================
# APPOINTMENT UPDATE ENDPOINTS
# ============================================================================

@router.put("/{appointment_id}/status", response_model=AppointmentResponse)
async def update_appointment_status(
    appointment_id: str,
    update: AppointmentUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    """Update appointment status"""
    db = await get_database()
    
    # Get appointment
    appointment = await db.appointments.find_one({"_id": ObjectId(appointment_id)})
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Verify authorization
    user_id = str(current_user["_id"])
    if appointment["patient_id"] != user_id and appointment["doctor_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this appointment"
        )
    
    # Prepare update
    update_dict = {k: v for k, v in update.dict(exclude_unset=True).items() if v is not None}
    if "status" in update_dict:
        # Convert enum to value if needed
        if isinstance(update_dict["status"], AppointmentStatus):
            update_dict["status"] = update_dict["status"].value
    update_dict["updated_at"] = datetime.utcnow()
    
    # Update appointment
    await db.appointments.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": update_dict}
    )
    
    # If cancelled, make slot available again
    if update.status == AppointmentStatus.CANCELLED:
        await db.doctor_availability.update_one(
            {"_id": ObjectId(appointment["slot_id"])},
            {"$set": {"is_available": True, "updated_at": datetime.utcnow()}}
        )
    
    # Get updated appointment
    updated_appointment = await db.appointments.find_one({"_id": ObjectId(appointment_id)})
    updated_appointment["id"] = str(updated_appointment.pop("_id"))
    updated_appointment = prepare_for_response(updated_appointment)
    
    return AppointmentResponse(**updated_appointment)