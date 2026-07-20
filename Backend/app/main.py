from fastapi import FastAPI
from app.core.database import engine, Base
from app.users import models as user_models
from app.workspaces import models as workspace_models
from app.projects import models as project_models
from app.tasks import models as task_models
from app.auth.router import router as auth_router
from app.workspaces.router import router as workspace_router
from app.projects.router import router as project_router    
from app.tasks.router import router as task_router
from app.users.router import router as user_router
from app.tasks.attachments_router import router as attachment_router
from app.workspaces.invites_router import router as invite_router
from app.workspaces.accept_invite_router import router as accept_invite_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Bloomyst API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://your-app-name.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os

os.makedirs("uploads/avatars", exist_ok=True)
os.makedirs("uploads/attachments", exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


app.include_router(auth_router)
app.include_router(user_router)
app.include_router(workspace_router)
app.include_router(project_router)
app.include_router(task_router)
app.include_router(attachment_router)
app.include_router(invite_router)
app.include_router(accept_invite_router)

@app.get("/")
def health_check():
    return {"status": "Bloomyst API is running"}