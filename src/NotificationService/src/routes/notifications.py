from fastapi import APIRouter, Depends, HTTPException
from ..database import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/")
async def create_notification(notification_data: dict, db=Depends(get_database)):
    notification_data["created_at"] = datetime.utcnow()
    notification_data["read"] = False
    if notification_data.get("user_id"):
        notification_data["user_id"] = ObjectId(notification_data["user_id"])
    if notification_data.get("ticket_id"):
        notification_data["ticket_id"] = ObjectId(notification_data["ticket_id"])
    
    result = await db.notifications.insert_one(notification_data)
    return {"id": str(result.inserted_id), "message": "Notification created"}

@router.get("/")
async def get_notifications(user_id: str = None, db=Depends(get_database)):
    query = {}
    if user_id:
        query["user_id"] = ObjectId(user_id)
    
    notifications = []
    async for notif in db.notifications.find(query).sort("created_at", -1).limit(50):
        notif["id"] = str(notif.pop("_id"))
        notif["user_id"] = str(notif["user_id"])
        if notif.get("ticket_id"):
            notif["ticket_id"] = str(notif["ticket_id"])
        notifications.append(notif)
    
    return notifications

@router.put("/{notification_id}/read")
async def mark_notification_read(notification_id: str, db=Depends(get_database)):
    result = await db.notifications.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"read": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@router.delete("/{notification_id}")
async def delete_notification(notification_id: str, db=Depends(get_database)):
    result = await db.notifications.delete_one({"_id": ObjectId(notification_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification deleted"}
