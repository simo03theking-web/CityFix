"""
Configuration settings for Orchestrator
"""
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    SERVICE_NAME: str = "Orchestrator"
    SERVICE_PORT: int = 8007
    ENVIRONMENT: str = "development"
    
    AUTH_SERVICE_URL: str = "http://auth-service:8001"
    ADMIN_SERVICE_URL: str = "http://admin-service:8002"
    TICKET_SERVICE_URL: str = "http://ticket-service:8003"
    MEDIA_SERVICE_URL: str = "http://media-service:8004"
    GEO_SERVICE_URL: str = "http://geo-service:8005"
    NOTIFICATION_SERVICE_URL: str = "http://notification-service:8006"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
