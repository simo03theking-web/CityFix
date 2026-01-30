from fastapi import APIRouter, Depends, HTTPException
from ..database import get_database
from bson import ObjectId

router = APIRouter()

@router.get("/{user_id}")
async def get_preferences(user_id: str, db=Depends(get_database)):
    prefs = await db.notification_preferences.find_one({"user_id": ObjectId(user_id)})
    if not prefs:
        return {
            "email_enabled": True,
            "sms_enabled": False,
            "push_enabled": True,
            "in_app_enabled": True
        }
    
    prefs["id"] = str(prefs.pop("_id"))
    prefs["user_id"] = str(prefs["user_id"])
    return prefs

@router.put("/{user_id}")
async def update_preferences(user_id: str, preferences_data: dict, db=Depends(get_database)):
    preferences_data["user_id"] = ObjectId(user_id)
    
    result = await db.notification_preferences.update_one(
        {"user_id": ObjectId(user_id)},
        {"$set": preferences_data},
        upsert=True
    )
    
    return {"message": "Preferences updated successfully"}
