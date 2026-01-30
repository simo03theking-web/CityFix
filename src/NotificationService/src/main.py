"""
CityFix NotificationService - Notification Management
"""
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import sys

from .config import settings
from .database import connect_db, close_db, init_database
from .routes import notifications, preferences

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.SERVICE_NAME}...")
    await connect_db()
    await init_database()
    logger.info(f"{settings.SERVICE_NAME} started successfully on port {settings.SERVICE_PORT}")
    yield
    logger.info(f"Shutting down {settings.SERVICE_NAME}...")
    await close_db()

app = FastAPI(
    title="CityFix NotificationService",
    description="Notification Management Service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(preferences.router, prefix="/api/v1/preferences", tags=["Preferences"])

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"status": "healthy", "service": settings.SERVICE_NAME, "version": "1.0.0"}

@app.get("/")
async def root():
    return {"service": settings.SERVICE_NAME, "version": "1.0.0", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.SERVICE_PORT, reload=settings.ENVIRONMENT == "development")
