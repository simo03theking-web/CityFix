"""
Database connection and initialization for AuthService
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConnectionFailure
import logging
from .config import settings

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db_instance = Database()

async def connect_db():
    try:
        logger.info(f"Connecting to MongoDB: {settings.MONGODB_URL.split('@')[1] if '@' in settings.MONGODB_URL else 'localhost'}")
        db_instance.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000,
            maxPoolSize=10,
            minPoolSize=1
        )
        await db_instance.client.admin.command('ping')
        db_instance.db = db_instance.client[settings.DATABASE_NAME]
        logger.info("MongoDB connection established successfully")
    except ConnectionFailure as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error connecting to MongoDB: {str(e)}")
        raise

async def close_db():
    if db_instance.client:
        db_instance.client.close()
        logger.info("MongoDB connection closed")

async def get_database() -> AsyncIOMotorDatabase:
    return db_instance.db

async def init_database():
    try:
        db = await get_database()
        
        collections = await db.list_collection_names()
        
        if 'users' not in collections:
            await db.create_collection('users')
            await db.users.create_index("email", unique=True)
            await db.users.create_index("municipality_id")
            await db.users.create_index("role")
            await db.users.create_index("created_at")
            logger.info("Users collection created with indexes")
        
        if settings.ENVIRONMENT == "development":
            await seed_test_data(db)
            
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise

async def seed_test_data(db: AsyncIOMotorDatabase):
    from .services.auth import hash_password
    from datetime import datetime
    
    existing_users = await db.users.count_documents({})
    if existing_users > 0:
        logger.info("Test data already exists, skipping seed")
        return
    
    test_users = [
        {
            "email": "admin@cityfix.app",
            "password_hash": hash_password("Admin123!"),
            "role": "admin",
            "first_name": "Admin",
            "last_name": "User",
            "phone": "+1234567890",
            "municipality_id": None,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "email": "citizen@test.com",
            "password_hash": hash_password("Test123!"),
            "role": "citizen",
            "first_name": "Test",
            "last_name": "Citizen",
            "phone": "+1234567891",
            "municipality_id": None,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await db.users.insert_many(test_users)
    logger.info(f"Seeded {len(test_users)} test users")
