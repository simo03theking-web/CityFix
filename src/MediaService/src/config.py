"""
Configuration settings for MediaService
"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SERVICE_NAME: str = "MediaService"
    SERVICE_PORT: int = 8004
    ENVIRONMENT: str = "development"
    MONGODB_URL: str = "mongodb://admin:CityFixSecure123!@localhost:27017/cityfix?authSource=admin"
    DATABASE_NAME: str = "cityfix"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
