"""
Orchestrator doesn't use MongoDB directly - it proxies to other services
This file is a placeholder for consistency with other services
"""
import logging

logger = logging.getLogger(__name__)

async def connect_db():
    logger.info("Orchestrator does not use direct database connection")
    pass

async def close_db():
    logger.info("Orchestrator cleanup complete")
    pass

async def get_database():
    return None

async def init_database():
    logger.info("Orchestrator initialized")
    pass
