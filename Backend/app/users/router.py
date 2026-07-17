import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from PIL import Image
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.users.schemas import UserOut

router = APIRouter(prefix="/users", tags=["users"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

@router.post("/me/avatar", response_model=UserOut)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):  
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="File must be a JPEG, PNG, or WEBP image")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File must be under 5MB")

    extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{extension}"
    filepath = f"uploads/avatars/{filename}"

    with open(filepath, "wb") as f:
        f.write(contents)

    try:
        img = Image.open(filepath)
        img.verify()
    except Exception:
        os.remove(filepath)
        raise HTTPException(status_code=400, detail="Invalid image file")

    if current_user.avatar_url:
        old_path = current_user.avatar_url.replace("/uploads/", "uploads/")
        if os.path.exists(old_path):
            os.remove(old_path)

    current_user.avatar_url = f"/uploads/avatars/{filename}"
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user