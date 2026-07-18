from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.core.email import send_email
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.workspaces.dependencies import require_role
from app.workspaces.models import Workspace, WorkspaceMember, Invite
from app.workspaces.schemas import InviteCreate, InviteOut

router = APIRouter(prefix="/workspaces/{workspace_id}/invites", tags=["invites"])


@router.post("/", response_model=InviteOut, status_code=201)
def create_invite(
    workspace_id: int,
    invite_in: InviteCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    member: WorkspaceMember = Depends(require_role("owner", "admin")),
):
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id).first()

    invite = Invite(
        workspace_id=workspace_id,
        email=invite_in.email,
        role=invite_in.role,
        invited_by=current_user.id,
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)

    accept_url = f"{settings.frontend_url}/invites/{invite.token}/accept"
    html_body = f"""
        <h2>You've been invited to join {workspace.name} on Bloomyst</h2>
        <p>{current_user.email} invited you to join their workspace as a {invite.role}.</p>
        <p><a href="{accept_url}">Click here to accept the invite</a></p>
    """
    background_tasks.add_task(
        send_email,
        to_email=invite.email,
        subject=f"You're invited to join {workspace.name} on Bloomyst",
        html_body=html_body,
    )

    return invite


@router.get("/", response_model=list[InviteOut])
def list_invites(
    workspace_id: int,
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(require_role("owner", "admin")),
):
    return db.query(Invite).filter(Invite.workspace_id == workspace_id).all()