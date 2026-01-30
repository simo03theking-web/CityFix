"""
Configuration settings for NotificationService
"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SERVICE_NAME: str = "NotificationService"
    SERVICE_PORT: int = 8006
    ENVIRONMENT: str = "development"
    MONGODB_URL: str = "mongodb://admin:CityFixSecure123!@localhost:27017/cityfix?authSource=admin"
    DATABASE_NAME: str = "cityfix"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
