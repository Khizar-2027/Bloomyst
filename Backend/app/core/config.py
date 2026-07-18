from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    smtp_host: str
    smtp_port: int
    smtp_username: str
    smtp_password: str
    frontend_url: str

    class Config:
        env_file = ".env"

settings = Settings()