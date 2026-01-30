"""
Configuration settings for AuthService
"""
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    SERVICE_NAME: str = "AuthService"
    SERVICE_PORT: int = 8001
    ENVIRONMENT: str = "development"
    
    MONGODB_URL: str = "mongodb://admin:CityFixSecure123!@localhost:27017/cityfix?authSource=admin"
    DATABASE_NAME: str = "cityfix"
    
    JWT_SECRET: str = "your-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440
    
    BCRYPT_ROUNDS: int = 12
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
