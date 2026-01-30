from fastapi import APIRouter, Depends, HTTPException, status
from ..database import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_municipality(municipality_data: dict, db=Depends(get_database)):
    municipality_data["created_at"] = datetime.utcnow()
    result = await db.municipalities.insert_one(municipality_data)
    return {"id": str(result.inserted_id), **municipality_data}

@router.get("/")
async def get_municipalities(db=Depends(get_database)):
    municipalities = []
    async for mun in db.municipalities.find():
        mun["id"] = str(mun.pop("_id"))
        municipalities.append(mun)
    return municipalities

@router.get("/{municipality_id}")
async def get_municipality(municipality_id: str, db=Depends(get_database)):
    mun = await db.municipalities.find_one({"_id": ObjectId(municipality_id)})
    if not mun:
        raise HTTPException(status_code=404, detail="Municipality not found")
    mun["id"] = str(mun.pop("_id"))
    return mun

@router.put("/{municipality_id}")
async def update_municipality(municipality_id: str, update_data: dict, db=Depends(get_database)):
    update_data["updated_at"] = datetime.utcnow()
    result = await db.municipalities.update_one(
        {"_id": ObjectId(municipality_id)},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Municipality not found")
    return {"message": "Updated successfully"}

@router.delete("/{municipality_id}")
async def delete_municipality(municipality_id: str, db=Depends(get_database)):
    result = await db.municipalities.delete_one({"_id": ObjectId(municipality_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Municipality not found")
    return {"message": "Deleted successfully"}
