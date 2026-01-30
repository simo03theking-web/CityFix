"""
Configuration settings for AdminService
"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SERVICE_NAME: str = "AdminService"
    SERVICE_PORT: int = 8002
    ENVIRONMENT: str = "development"
    MONGODB_URL: str = "mongodb://admin:CityFixSecure123!@localhost:27017/cityfix?authSource=admin"
    DATABASE_NAME: str = "cityfix"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
