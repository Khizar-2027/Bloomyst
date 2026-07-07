from fastapi import FastAPI
from app.core.database import engine, Base
from app.users import models as user_models
from app.auth.router import router as auth_router

app = FastAPI(title="Bloomyst API")

app.include_router(auth_router)

@app.get("/")
def health_check():
    return {"status": "Bloomyst API is running"}