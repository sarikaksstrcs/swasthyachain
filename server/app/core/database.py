# app/core/database.py
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db = Database()

async def get_database() -> AsyncIOMotorDatabase:
    return db.db

async def init_db():
    """Initialize database connection"""
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db.db = db.client[settings.DATABASE_NAME]
    
    # Create indexes
    await create_indexes()
    
    print(f"✅ Connected to MongoDB: {settings.DATABASE_NAME}")

async def create_indexes():
    """Create database indexes for optimization"""
    # Users collection
    await db.db.users.create_index("email", unique=True)
    await db.db.users.create_index("blockchain_address")
    await db.db.users.create_index("role")
    
    # Medical records
    await db.db.medical_records.create_index("patient_id")
    await db.db.medical_records.create_index("record_hash", unique=True)
    await db.db.medical_records.create_index([("patient_id", 1), ("created_at", -1)])
    await db.db.medical_records.create_index("record_type")
    
    # Consent logs
    await db.db.consent_logs.create_index("patient_id")
    await db.db.consent_logs.create_index("doctor_id")
    await db.db.consent_logs.create_index([("patient_id", 1), ("doctor_id", 1)])
    await db.db.consent_logs.create_index("expires_at")
    await db.db.consent_logs.create_index("status")
    await db.db.consent_logs.create_index([("patient_id", 1), ("status", 1)])
    
    # Access logs
    await db.db.access_logs.create_index([("patient_id", 1), ("accessed_at", -1)])
    await db.db.access_logs.create_index("record_id")
    await db.db.access_logs.create_index("accessor_id")
    
    # Appointments collection (NEW)
    await db.db.appointments.create_index("patient_id")
    await db.db.appointments.create_index("doctor_id")
    await db.db.appointments.create_index("appointment_date")
    await db.db.appointments.create_index("status")
    await db.db.appointments.create_index([("doctor_id", 1), ("appointment_date", 1)])
    await db.db.appointments.create_index([("patient_id", 1), ("status", 1)])
    await db.db.appointments.create_index([("doctor_id", 1), ("status", 1)])
    
    # Doctor availability collection (NEW)
    await db.db.doctor_availability.create_index("doctor_id")
    await db.db.doctor_availability.create_index("date")
    await db.db.doctor_availability.create_index("is_available")
    await db.db.doctor_availability.create_index([("doctor_id", 1), ("date", 1)])
    await db.db.doctor_availability.create_index([("doctor_id", 1), ("date", 1), ("is_available", 1)])
    
    print("✅ Database indexes created successfully")

async def close_db():
    """Close database connection"""
    if db.client:
        db.client.close()
        print("🔴 Database connection closed")