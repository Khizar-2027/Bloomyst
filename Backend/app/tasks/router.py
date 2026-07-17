from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.workspaces.dependencies import get_workspace_member
from app.workspaces.models import WorkspaceMember
from app.projects.models import Project
from app.tasks.models import Task
from app.tasks.schemas import TaskCreate, TaskUpdate, TaskOut

router = APIRouter(prefix="/projects/{project_id}/tasks", tags=["tasks"])


def get_project_and_check_membership(
    project_id: int,
    db: Session,
    current_user: User,
) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    member = (
        db.query(WorkspaceMember)
        .filter(
            WorkspaceMember.workspace_id == project.workspace_id,
            WorkspaceMember.user_id == current_user.id,
        )
        .first()
    )
    if not member:
        raise HTTPException(status_code=403, detail="You are not a member of this workspace")

    return project


@router.post("/", response_model=TaskOut, status_code=201)
def create_task(
    project_id: int,
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_and_check_membership(project_id, db, current_user)

    task = Task(
        project_id=project_id,
        created_by=current_user.id,
        **task_in.model_dump(),
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/", response_model=list[TaskOut])
def list_tasks(
    project_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_and_check_membership(project_id, db, current_user)
    return (
        db.query(Task)
        .filter(Task.project_id == project_id)
        .order_by(Task.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{task_id}", response_model=TaskOut)
def get_task(
    project_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_and_check_membership(project_id, db, current_user)
    task = db.query(Task).filter(Task.id == task_id, Task.project_id == project_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(
    project_id: int,
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_and_check_membership(project_id, db, current_user)
    task = db.query(Task).filter(Task.id == task_id, Task.project_id == project_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for field, value in task_in.model_dump(exclude_unset=True).items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(
    project_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_project_and_check_membership(project_id, db, current_user)
    task = db.query(Task).filter(Task.id == task_id, Task.project_id == project_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()