from fastapi import APIRouter, Depends, HTTPException
from ..database import get_database
from bson import ObjectId
from datetime import datetime
from typing import Optional

router = APIRouter()

@router.post("/")
async def create_ticket(ticket_data: dict, db=Depends(get_database)):
    ticket_data["status"] = "received"
    ticket_data["created_at"] = datetime.utcnow()
    ticket_data["updated_at"] = datetime.utcnow()
    result = await db.tickets.insert_one(ticket_data)
    return {"id": str(result.inserted_id), **ticket_data}

@router.get("/")
async def get_tickets(
    status: Optional[str] = None,
    municipality_id: Optional[str] = None,
    db=Depends(get_database)
):
    query = {}
    if status:
        query["status"] = status
    if municipality_id:
        query["municipality_id"] = ObjectId(municipality_id)
    
    tickets = []
    async for ticket in db.tickets.find(query).sort("created_at", -1):
        ticket["id"] = str(ticket.pop("_id"))
        if ticket.get("municipality_id"):
            ticket["municipality_id"] = str(ticket["municipality_id"])
        if ticket.get("citizen_id"):
            ticket["citizen_id"] = str(ticket["citizen_id"])
        if ticket.get("assigned_operator_id"):
            ticket["assigned_operator_id"] = str(ticket["assigned_operator_id"])
        tickets.append(ticket)
    return tickets

@router.get("/{ticket_id}")
async def get_ticket(ticket_id: str, db=Depends(get_database)):
    ticket = await db.tickets.find_one({"_id": ObjectId(ticket_id)})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket["id"] = str(ticket.pop("_id"))
    if ticket.get("municipality_id"):
        ticket["municipality_id"] = str(ticket["municipality_id"])
    if ticket.get("citizen_id"):
        ticket["citizen_id"] = str(ticket["citizen_id"])
    if ticket.get("assigned_operator_id"):
        ticket["assigned_operator_id"] = str(ticket["assigned_operator_id"])
    return ticket

@router.put("/{ticket_id}")
async def update_ticket(ticket_id: str, update_data: dict, db=Depends(get_database)):
    update_data["updated_at"] = datetime.utcnow()
    result = await db.tickets.update_one(
        {"_id": ObjectId(ticket_id)},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return {"message": "Updated successfully"}

@router.put("/{ticket_id}/status")
async def update_ticket_status(ticket_id: str, status_data: dict, db=Depends(get_database)):
    update_data = {
        "status": status_data.get("status"),
        "updated_at": datetime.utcnow()
    }
    if status_data.get("status") == "resolved":
        update_data["resolved_at"] = datetime.utcnow()
    
    result = await db.tickets.update_one(
        {"_id": ObjectId(ticket_id)},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return {"message": "Status updated successfully"}
