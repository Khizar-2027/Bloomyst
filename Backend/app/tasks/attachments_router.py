import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.tasks.models import Task, Attachment
from app.tasks.schemas import AttachmentOut
from app.tasks.router import get_project_and_check_membership

router = APIRouter(prefix="/tasks/{task_id}/attachments", tags=["attachments"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "application/pdf", "text/plain"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def get_task_and_check_membership(task_id: int, db: Session, current_user: User) -> Task:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    get_project_and_check_membership(task.project_id, db, current_user)
    return task


@router.post("/", response_model=AttachmentOut, status_code=201)
async def upload_attachment(
    task_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = get_task_and_check_membership(task_id, db, current_user)

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="File type not allowed")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File must be under 10MB")

    extension = file.filename.split(".")[-1]
    unique_name = f"{uuid.uuid4()}.{extension}"
    filepath = f"uploads/attachments/{unique_name}"

    with open(filepath, "wb") as f:
        f.write(contents)

    attachment = Attachment(
        task_id=task_id,
        filename=file.filename,
        file_url=f"/uploads/attachments/{unique_name}",
        uploaded_by=current_user.id,
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return attachment


@router.get("/", response_model=list[AttachmentOut])
def list_attachments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_task_and_check_membership(task_id, db, current_user)
    return db.query(Attachment).filter(Attachment.task_id == task_id).all()


@router.delete("/{attachment_id}", status_code=204)
def delete_attachment(
    task_id: int,
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_task_and_check_membership(task_id, db, current_user)
    attachment = db.query(Attachment).filter(
        Attachment.id == attachment_id, Attachment.task_id == task_id
    ).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")

    filepath = attachment.file_url.replace("/uploads/", "uploads/")
    if os.path.exists(filepath):
        os.remove(filepath)

    db.delete(attachment)
    db.commit()