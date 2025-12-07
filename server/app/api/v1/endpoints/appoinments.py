# app/api/v1/endpoints/appointments.py
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.models.schemas import (
    AppointmentCreate, AppointmentResponse, AppointmentUpdate,
    AppointmentStatus, UserRole, DoctorAvailabilityCreate,
    DoctorAvailabilityResponse
)
from app.core.security import get_current_active_user, require_role
from app.core.database import get_database
from datetime import datetime, timedelta, time
from bson import ObjectId

router = APIRouter()

@router.post("/availability", response_model=DoctorAvailabilityResponse, status_code=status.HTTP_201_CREATED)
async def set_availability(
    availability: DoctorAvailabilityCreate,
    current_user: dict = Depends(require_role([UserRole.DOCTOR]))
):
    """Doctor sets their availability slots"""
    db = await get_database()
    
    availability_dict = availability.dict()
    availability_dict.update({
        "doctor_id": str(current_user["_id"]),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
    result = await db.doctor_availability.insert_one(availability_dict)
    created = await db.doctor_availability.find_one({"_id": result.inserted_id})
    created["id"] = str(created.pop("_id"))
    
    return DoctorAvailabilityResponse(**created)

@router.get("/availability/{doctor_id}", response_model=List[DoctorAvailabilityResponse])
async def get_doctor_availability(
    doctor_id: str,
    date_from: str = None,
    date_to: str = None,
    current_user: dict = Depends(get_current_active_user)
):
    """Get doctor's available slots"""
    db = await get_database()
    
    query = {"doctor_id": doctor_id, "is_available": True}
    
    if date_from:
        query["date"] = {"$gte": datetime.fromisoformat(date_from)}
    if date_to:
        if "date" in query:
            query["date"]["$lte"] = datetime.fromisoformat(date_to)
        else:
            query["date"] = {"$lte": datetime.fromisoformat(date_to)}
    
    slots = []
    cursor = db.doctor_availability.find(query).sort("date", 1).sort("start_time", 1)
    
    async for slot in cursor:
        slot["id"] = str(slot.pop("_id"))
        slots.append(DoctorAvailabilityResponse(**slot))
    
    return slots

@router.post("/book", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def book_appointment(
    appointment: AppointmentCreate,
    current_user: dict = Depends(require_role([UserRole.PATIENT]))
):
    """Patient books an appointment with a doctor"""
    db = await get_database()
    
    # Verify doctor exists
    doctor = await db.users.find_one({"_id": ObjectId(appointment.doctor_id)})
    if not doctor or doctor["role"] != UserRole.DOCTOR:
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
    appointment_dict = appointment.dict()
    appointment_dict.update({
        "patient_id": str(current_user["_id"]),
        "patient_name": current_user["full_name"],
        "doctor_name": doctor["full_name"],
        "status": AppointmentStatus.SCHEDULED,
        "appointment_date": slot["date"],
        "start_time": slot["start_time"],
        "end_time": slot["end_time"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
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
    
    created_appointment = await db.appointments.find_one({"_id": result.inserted_id})
    created_appointment["id"] = str(created_appointment.pop("_id"))
    
    return AppointmentResponse(**created_appointment)

@router.get("/my-appointments", response_model=List[AppointmentResponse])
async def get_my_appointments(
    status: str = None,
    current_user: dict = Depends(get_current_active_user)
):
    """Get appointments for current user (patient or doctor)"""
    db = await get_database()
    
    if current_user["role"] == UserRole.PATIENT:
        query = {"patient_id": str(current_user["_id"])}
    elif current_user["role"] == UserRole.DOCTOR:
        query = {"doctor_id": str(current_user["_id"])}
    else:
        return []
    
    if status:
        query["status"] = status
    
    appointments = []
    cursor = db.appointments.find(query).sort("appointment_date", 1).sort("start_time", 1)
    
    async for apt in cursor:
        apt["id"] = str(apt.pop("_id"))
        appointments.append(AppointmentResponse(**apt))
    
    return appointments

@router.get("/appointments/date/{date}", response_model=List[AppointmentResponse])
async def get_appointments_by_date(
    date: str,
    current_user: dict = Depends(require_role([UserRole.DOCTOR]))
):
    """Get all appointments for a doctor on a specific date"""
    db = await get_database()
    
    target_date = datetime.fromisoformat(date)
    
    appointments = []
    cursor = db.appointments.find({
        "doctor_id": str(current_user["_id"]),
        "appointment_date": target_date,
        "status": {"$in": [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]}
    }).sort("start_time", 1)
    
    async for apt in cursor:
        apt["id"] = str(apt.pop("_id"))
        appointments.append(AppointmentResponse(**apt))
    
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
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)
    
    pipeline = [
        {
            "$match": {
                "doctor_id": str(current_user["_id"]),
                "appointment_date": {"$gte": start_date, "$lt": end_date},
                "status": {"$in": [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]}
            }
        },
        {
            "$group": {
                "_id": "$appointment_date",
                "count": {"$sum": 1}
            }
        },
        {
            "$sort": {"_id": 1}
        }
    ]
    
    result = []
    async for doc in db.appointments.aggregate(pipeline):
        result.append({
            "date": doc["_id"].isoformat(),
            "count": doc["count"]
        })
    
    return result

@router.put("/{appointment_id}/status", response_model=AppointmentResponse)
async def update_appointment_status(
    appointment_id: str,
    update: AppointmentUpdate,
    current_user: dict = Depends(get_current_active_user)
):
    """Update appointment status"""
    db = await get_database()
    
    appointment = await db.appointments.find_one({"_id": ObjectId(appointment_id)})
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Verify user is part of the appointment
    if str(appointment["patient_id"]) != str(current_user["_id"]) and \
       str(appointment["doctor_id"]) != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    update_dict = update.dict(exclude_unset=True)
    update_dict["updated_at"] = datetime.utcnow()
    
    # If canceling, make slot available again
    if update.status == AppointmentStatus.CANCELLED:
        await db.doctor_availability.update_one(
            {"_id": ObjectId(appointment["slot_id"])},
            {"$set": {"is_available": True, "updated_at": datetime.utcnow()}}
        )
    
    await db.appointments.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": update_dict}
    )
    
    updated_appointment = await db.appointments.find_one({"_id": ObjectId(appointment_id)})
    updated_appointment["id"] = str(updated_appointment.pop("_id"))
    
    return AppointmentResponse(**updated_appointment)

@router.get("/doctors", response_model=List[dict])
async def list_doctors(
    specialization: str = None,
    current_user: dict = Depends(get_current_active_user)
):
    """List all doctors with optional specialization filter"""
    db = await get_database()
    
    query = {"role": UserRole.DOCTOR, "is_active": True}
    if specialization:
        query["specialization"] = specialization
    
    doctors = []
    cursor = db.users.find(query).sort("full_name", 1)
    
    async for doctor in cursor:
        doctors.append({
            "id": str(doctor["_id"]),
            "full_name": doctor["full_name"],
            "email": doctor["email"],
            "specialization": doctor.get("specialization", "General"),
            "phone": doctor.get("phone")
        })
    
    return doctors