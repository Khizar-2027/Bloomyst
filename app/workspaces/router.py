import re
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.workspaces.models import Workspace, WorkspaceMember
from app.workspaces.schemas import WorkspaceCreate, WorkspaceOut

router = APIRouter(prefix="/workspaces", tags=["workspaces"])

def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


@router.post("/", response_model=WorkspaceOut, status_code=201)
def create_workspace(
    workspace_in: WorkspaceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workspace = Workspace(name=workspace_in.name, slug=slugify(workspace_in.name))
    db.add(workspace)
    db.commit()
    db.refresh(workspace)

    membership = WorkspaceMember(
        workspace_id=workspace.id,
        user_id=current_user.id,
        role="owner",
    )
    db.add(membership)
    db.commit()

    return workspace


@router.get("/", response_model=list[WorkspaceOut])
def list_my_workspaces(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workspaces = (
        db.query(Workspace)
        .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
        .filter(WorkspaceMember.user_id == current_user.id)
        .all()
    )
    return workspaces