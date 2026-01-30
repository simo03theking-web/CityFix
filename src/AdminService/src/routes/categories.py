from fastapi import APIRouter, Depends
from ..database import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/")
async def create_category(category_data: dict, db=Depends(get_database)):
    category_data["created_at"] = datetime.utcnow()
    result = await db.maintenance_categories.insert_one(category_data)
    return {"id": str(result.inserted_id), **category_data}

@router.get("/")
async def get_categories(db=Depends(get_database)):
    categories = []
    async for cat in db.maintenance_categories.find():
        cat["id"] = str(cat.pop("_id"))
        categories.append(cat)
    return categories
