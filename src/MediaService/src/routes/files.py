from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from ..database import get_database
from bson import ObjectId
from datetime import datetime
import os
import uuid
from pathlib import Path

router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/app/uploads")
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    ticket_id: str = None,
    user_id: str = None,
    db=Depends(get_database)
):
    if not allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
    
    file_ext = file.filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    with open(file_path, 'wb') as f:
        f.write(contents)
    
    media_doc = {
        "filename": file.filename,
        "stored_filename": unique_filename,
        "mime_type": file.content_type,
        "size": len(contents),
        "ticket_id": ObjectId(ticket_id) if ticket_id else None,
        "uploaded_by": ObjectId(user_id) if user_id else None,
        "upload_date": datetime.utcnow(),
        "path": file_path
    }
    
    result = await db.media_files.insert_one(media_doc)
    
    return {
        "id": str(result.inserted_id),
        "filename": unique_filename,
        "url": f"/uploads/{unique_filename}"
    }

@router.get("/files/{file_id}")
async def get_file_metadata(file_id: str, db=Depends(get_database)):
    file_doc = await db.media_files.find_one({"_id": ObjectId(file_id)})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_doc["id"] = str(file_doc.pop("_id"))
    if file_doc.get("ticket_id"):
        file_doc["ticket_id"] = str(file_doc["ticket_id"])
    if file_doc.get("uploaded_by"):
        file_doc["uploaded_by"] = str(file_doc["uploaded_by"])
    
    return file_doc

@router.delete("/files/{file_id}")
async def delete_file(file_id: str, db=Depends(get_database)):
    file_doc = await db.media_files.find_one({"_id": ObjectId(file_id)})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    if os.path.exists(file_doc["path"]):
        os.remove(file_doc["path"])
    
    await db.media_files.delete_one({"_id": ObjectId(file_id)})
    
    return {"message": "File deleted successfully"}
