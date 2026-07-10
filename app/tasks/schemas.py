from pydantic import BaseModel
from datetime import datetime

class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    status: str = "todo"
    priority: str = "medium"
    assignee_id: int | None = None
    due_date: datetime | None = None

class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    priority: str | None = None
    assignee_id: int | None = None
    due_date: datetime | None = None

class TaskOut(BaseModel):
    id: int
    project_id: int
    title: str
    description: str | None
    status: str
    priority: str
    assignee_id: int | None
    due_date: datetime | None
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True