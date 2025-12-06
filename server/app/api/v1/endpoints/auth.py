# app/api/v1/endpoints/auth.py
from fastapi import APIRouter, HTTPException, status, Depends
from app.core.security import get_current_active_user
from app.models.schemas import UserCreate, UserLogin, UserResponse, Token
from app.core.security import (
    get_password_hash, verify_password,
    create_access_token, create_refresh_token
)
from app.core.database import get_database
from datetime import datetime
from bson import ObjectId
import secrets

router = APIRouter()

def generate_blockchain_address() -> str:
    """Generate a mock blockchain address"""
    return f"0x{secrets.token_hex(20)}"

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """Register a new user"""
    db = await get_database()
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user_dict = user.dict()
    user_dict["password"] = get_password_hash(user.password)
    user_dict["blockchain_address"] = generate_blockchain_address()
    user_dict["is_active"] = True
    user_dict["created_at"] = datetime.utcnow()
    user_dict["updated_at"] = datetime.utcnow()
    
    result = await db.users.insert_one(user_dict)
    
    created_user = await db.users.find_one({"_id": result.inserted_id})
    created_user["id"] = str(created_user.pop("_id"))
    
    return UserResponse(**created_user)

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login user and return tokens"""
    db = await get_database()
    
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user["_id"])})
    refresh_token = create_refresh_token(data={"sub": str(user["_id"])})
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_active_user)):
    """Get current user information"""
  
    
    current_user["id"] = str(current_user.pop("_id"))
    return UserResponse(**current_user)