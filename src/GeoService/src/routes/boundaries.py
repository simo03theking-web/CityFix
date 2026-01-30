from fastapi import APIRouter, Depends, HTTPException
from ..database import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/")
async def create_boundary(boundary_data: dict, db=Depends(get_database)):
    boundary_data["created_at"] = datetime.utcnow()
    if boundary_data.get("municipality_id"):
        boundary_data["municipality_id"] = ObjectId(boundary_data["municipality_id"])
    result = await db.municipality_boundaries.insert_one(boundary_data)
    return {"id": str(result.inserted_id), "message": "Boundary created"}

@router.get("/municipality/{municipality_id}")
async def get_municipality_boundaries(municipality_id: str, db=Depends(get_database)):
    boundary = await db.municipality_boundaries.find_one({"municipality_id": ObjectId(municipality_id)})
    if boundary:
        boundary["id"] = str(boundary.pop("_id"))
        boundary["municipality_id"] = str(boundary["municipality_id"])
    return boundary
