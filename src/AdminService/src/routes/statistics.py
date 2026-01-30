from fastapi import APIRouter, Depends
from ..database import get_database

router = APIRouter()

@router.get("/")
async def get_statistics(db=Depends(get_database)):
    total_municipalities = await db.municipalities.count_documents({})
    total_users = await db.users.count_documents({})
    total_tickets = await db.tickets.count_documents({})
    
    return {
        "total_municipalities": total_municipalities,
        "total_users": total_users,
        "total_tickets": total_tickets
    }
