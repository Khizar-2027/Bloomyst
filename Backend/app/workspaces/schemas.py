from pydantic import BaseModel
from datetime import datetime

class WorkspaceCreate(BaseModel):
    name: str

class WorkspaceOut(BaseModel):
    id: int
    name: str
    slug: str
    created_at: datetime

    class Config:
        from_attributes = True

class InviteCreate(BaseModel):
    email: str
    role: str = "member"

class InviteOut(BaseModel):
    id: int
    workspace_id: int
    email: str
    role: str
    accepted: bool
    created_at: datetime

    class Config:
        from_attributes = True