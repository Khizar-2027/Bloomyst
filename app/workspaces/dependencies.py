from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.workspaces.models import WorkspaceMember

def get_workspace_member(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WorkspaceMember:
    member = (
        db.query(WorkspaceMember)
        .filter(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == current_user.id,
        )
        .first()
    )
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this workspace",
        )
    return member


def require_role(*allowed_roles: str):
    def role_checker(
        member: WorkspaceMember = Depends(get_workspace_member),
    ) -> WorkspaceMember:
        if member.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of these roles: {', '.join(allowed_roles)}",
            )
        return member
    return role_checker