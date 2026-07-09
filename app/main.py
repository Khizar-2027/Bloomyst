from fastapi import FastAPI
from app.core.database import engine, Base
from app.users import models as user_models
from app.workspaces import models as workspace_models
from app.auth.router import router as auth_router
from app.workspaces.router import router as workspace_router

app = FastAPI(title="Bloomyst API")

app.include_router(auth_router)
app.include_router(workspace_router)

@app.get("/")
def health_check():
    return {"status": "Bloomyst API is running"}