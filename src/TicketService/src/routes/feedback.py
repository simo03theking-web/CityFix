from fastapi import APIRouter, Depends, HTTPException
from ..database import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/")
async def create_feedback(feedback_data: dict, db=Depends(get_database)):
    feedback_data["created_at"] = datetime.utcnow()
    if feedback_data.get("ticket_id"):
        feedback_data["ticket_id"] = ObjectId(feedback_data["ticket_id"])
    if feedback_data.get("citizen_id"):
        feedback_data["citizen_id"] = ObjectId(feedback_data["citizen_id"])
    
    existing = await db.ticket_feedback.find_one({"ticket_id": feedback_data["ticket_id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Feedback already exists for this ticket")
    
    result = await db.ticket_feedback.insert_one(feedback_data)
    return {"id": str(result.inserted_id), "message": "Feedback created"}

@router.get("/ticket/{ticket_id}")
async def get_ticket_feedback(ticket_id: str, db=Depends(get_database)):
    feedback = await db.ticket_feedback.find_one({"ticket_id": ObjectId(ticket_id)})
    if feedback:
        feedback["id"] = str(feedback.pop("_id"))
        feedback["ticket_id"] = str(feedback["ticket_id"])
        if feedback.get("citizen_id"):
            feedback["citizen_id"] = str(feedback["citizen_id"])
    return feedback
