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
    
    # Medical records
    await db.db.medical_records.create_index("patient_id")
    await db.db.medical_records.create_index("record_hash", unique=True)
    await db.db.medical_records.create_index([("patient_id", 1), ("created_at", -1)])
    
    # Consent logs
    await db.db.consent_logs.create_index("patient_id")
    await db.db.consent_logs.create_index("doctor_id")
    await db.db.consent_logs.create_index([("patient_id", 1), ("doctor_id", 1)])
    await db.db.consent_logs.create_index("expires_at")
    
    # Access logs
    await db.db.access_logs.create_index([("patient_id", 1), ("accessed_at", -1)])
    await db.db.access_logs.create_index("record_id")

async def close_db():
    """Close database connection"""
    if db.client:
        db.client.close()
        print("🔴 Database connection closed")