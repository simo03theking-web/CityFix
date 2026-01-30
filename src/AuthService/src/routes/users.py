"""
User management routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from bson import ObjectId

from ..database import get_database
from ..models.user import UserResponse, UserUpdate, TokenData
from ..middleware.auth import get_current_user
from ..services.auth import user_to_dict

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
async def get_profile(
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

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: TokenData = Depends(get_current_user),
    db=Depends(get_database)
):
    update_data = user_update.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    update_data["updated_at"] = datetime.utcnow()
    
    if update_data.get("municipality_id"):
        update_data["municipality_id"] = ObjectId(update_data["municipality_id"])
    
    result = await db.users.update_one(
        {"_id": ObjectId(current_user.user_id)},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or no changes made"
        )
    
    updated_user = await db.users.find_one({"_id": ObjectId(current_user.user_id)})
    
    return UserResponse(**user_to_dict(updated_user))

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: TokenData = Depends(get_current_user),
    db=Depends(get_database)
):
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(**user_to_dict(user))
