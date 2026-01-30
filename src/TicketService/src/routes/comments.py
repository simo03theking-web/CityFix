from fastapi import APIRouter, Depends
from ..database import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/")
async def create_comment(comment_data: dict, db=Depends(get_database)):
    comment_data["created_at"] = datetime.utcnow()
    if comment_data.get("ticket_id"):
        comment_data["ticket_id"] = ObjectId(comment_data["ticket_id"])
    if comment_data.get("user_id"):
        comment_data["user_id"] = ObjectId(comment_data["user_id"])
    result = await db.ticket_comments.insert_one(comment_data)
    return {"id": str(result.inserted_id), "message": "Comment created"}

@router.get("/ticket/{ticket_id}")
async def get_ticket_comments(ticket_id: str, db=Depends(get_database)):
    comments = []
    async for comment in db.ticket_comments.find({"ticket_id": ObjectId(ticket_id)}).sort("created_at", 1):
        comment["id"] = str(comment.pop("_id"))
        comment["ticket_id"] = str(comment["ticket_id"])
        if comment.get("user_id"):
            comment["user_id"] = str(comment["user_id"])
        comments.append(comment)
    return comments
