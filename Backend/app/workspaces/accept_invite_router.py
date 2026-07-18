from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.workspaces.models import Invite, WorkspaceMember

router = APIRouter(prefix="/invites", tags=["invites"])


@router.post("/{token}/accept")
def accept_invite(
    token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invite = db.query(Invite).filter(Invite.token == token).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")
    if invite.accepted:
        raise HTTPException(status_code=400, detail="Invite already used")
    if invite.email.lower() != current_user.email.lower():
        raise HTTPException(status_code=403, detail="This invite was sent to a different email")

    existing = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == invite.workspace_id,
        WorkspaceMember.user_id == current_user.id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You're already a member of this workspace")

    membership = WorkspaceMember(
        workspace_id=invite.workspace_id,
        user_id=current_user.id,
        role=invite.role,
    )
    db.add(membership)
    invite.accepted = True
    db.commit()

    return {"status": "Invite accepted", "workspace_id": invite.workspace_id}