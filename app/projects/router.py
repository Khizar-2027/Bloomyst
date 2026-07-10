from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.workspaces.dependencies import get_workspace_member
from app.workspaces.models import WorkspaceMember
from app.projects.models import Project
from app.projects.schemas import ProjectCreate, ProjectOut

router = APIRouter(prefix="/workspaces/{workspace_id}/projects", tags=["projects"])


@router.post("/", response_model=ProjectOut, status_code=201)
def create_project(
    workspace_id: int,
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    member: WorkspaceMember = Depends(get_workspace_member),  # any member can create
):
    project = Project(
        workspace_id=workspace_id,
        name=project_in.name,
        description=project_in.description,
        created_by=current_user.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/", response_model=list[ProjectOut])
def list_projects(
    workspace_id: int,
    db: Session = Depends(get_db),
    member: WorkspaceMember = Depends(get_workspace_member),  # must be a member to view
):
    projects = db.query(Project).filter(Project.workspace_id == workspace_id).all()
    return projects