from pydantic import BaseModel
from datetime import datetime

class ProjectCreate(BaseModel):
    name: str
    description: str | None = None

class ProjectOut(BaseModel):
    id: int
    workspace_id: int
    name: str
    description: str | None
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True