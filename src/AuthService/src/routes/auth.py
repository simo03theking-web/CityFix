"""
Authentication routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from bson import ObjectId

from ..database import get_database
from ..models.user import UserCreate, UserLogin, Token, UserResponse, TokenData
from ..services.auth import (
    hash_password,
    authenticate_user,
    create_access_token,
    user_to_dict
)
from ..middleware.auth import get_current_user

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db=Depends(get_database)):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user_dict = user_data.model_dump(exclude={"password"})
    user_dict["password_hash"] = hash_password(user_data.password)
    user_dict["is_active"] = True
    user_dict["created_at"] = datetime.utcnow()
    user_dict["updated_at"] = datetime.utcnow()
    
    if user_dict.get("municipality_id"):
        user_dict["municipality_id"] = ObjectId(user_dict["municipality_id"])
    
    result = await db.users.insert_one(user_dict)
    
    created_user = await db.users.find_one({"_id": result.inserted_id})
    
    access_token = create_access_token(
        data={
            "sub": str(created_user["_id"]),
            "email": created_user["email"],
            "role": created_user["role"],
            "municipality_id": str(created_user["municipality_id"]) if created_user.get("municipality_id") else None
        }
    )
    
    user_response = UserResponse(**user_to_dict(created_user))
    
    return Token(access_token=access_token, user=user_response)

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db=Depends(get_database)):
    user = await authenticate_user(db, credentials.email, credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={
            "sub": str(user["_id"]),
            "email": user["email"],
            "role": user["role"],
            "municipality_id": str(user["municipality_id"]) if user.get("municipality_id") else None
        }
    )
    
    user_response = UserResponse(**user_to_dict(user))
    
    return Token(access_token=access_token, user=user_response)

@router.post("/logout")
async def logout(current_user: TokenData = Depends(get_current_user)):
    return {"message": "Successfully logged out"}

@router.get("/verify-token", response_model=UserResponse)
async def verify_token(
    current_user: TokenData = Depends(get_current_user),
    db=Depends(get_database)
):
    user = await db.users.find_one({"_id": ObjectId(current_user.user_id)})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(**user_to_dict(user))

@router.post("/refresh-token", response_model=Token)
async def refresh_token(
    current_user: TokenData = Depends(get_current_user),
    db=Depends(get_database)
):
    user = await db.users.find_one({"_id": ObjectId(current_user.user_id)})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    access_token = create_access_token(
        data={
            "sub": str(user["_id"]),
            "email": user["email"],
            "role": user["role"],
            "municipality_id": str(user["municipality_id"]) if user.get("municipality_id") else None
        }
    )
    
    user_response = UserResponse(**user_to_dict(user))
    
    return Token(access_token=access_token, user=user_response)
