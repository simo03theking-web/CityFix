"""
CityFix Orchestrator - API Gateway and Service Orchestration
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import sys
import httpx

from .config import settings

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="CityFix Orchestrator",
    description="API Gateway and Service Orchestration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SERVICE_URLS = {
    "auth": getattr(settings, 'AUTH_SERVICE_URL', 'http://auth-service:8001'),
    "admin": getattr(settings, 'ADMIN_SERVICE_URL', 'http://admin-service:8002'),
    "ticket": getattr(settings, 'TICKET_SERVICE_URL', 'http://ticket-service:8003'),
    "media": getattr(settings, 'MEDIA_SERVICE_URL', 'http://media-service:8004'),
    "geo": getattr(settings, 'GEO_SERVICE_URL', 'http://geo-service:8005'),
    "notification": getattr(settings, 'NOTIFICATION_SERVICE_URL', 'http://notification-service:8006'),
}

async def proxy_request(service_url: str, path: str, request: Request):
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            headers = dict(request.headers)
            headers.pop('host', None)
            
            url = f"{service_url}{path}"
            
            if request.method == "GET":
                response = await client.get(url, headers=headers, params=request.query_params)
            elif request.method == "POST":
                body = await request.body()
                response = await client.post(url, headers=headers, content=body)
            elif request.method == "PUT":
                body = await request.body()
                response = await client.put(url, headers=headers, content=body)
            elif request.method == "DELETE":
                response = await client.delete(url, headers=headers)
            else:
                return JSONResponse(status_code=405, content={"detail": "Method not allowed"})
            
            return JSONResponse(
                status_code=response.status_code,
                content=response.json() if response.headers.get('content-type', '').startswith('application/json') else {},
                headers=dict(response.headers)
            )
    except httpx.TimeoutException:
        logger.error(f"Timeout calling {service_url}{path}")
        return JSONResponse(status_code=504, content={"detail": "Gateway timeout"})
    except Exception as e:
        logger.error(f"Error proxying to {service_url}{path}: {str(e)}")
        return JSONResponse(status_code=502, content={"detail": "Bad gateway"})

@app.api_route("/api/v1/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_auth(path: str, request: Request):
    return await proxy_request(SERVICE_URLS["auth"], f"/api/v1/auth/{path}", request)

@app.api_route("/api/v1/municipalities/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_municipalities(path: str, request: Request):
    return await proxy_request(SERVICE_URLS["admin"], f"/api/v1/municipalities/{path}", request)

@app.api_route("/api/v1/categories/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_categories(path: str, request: Request):
    return await proxy_request(SERVICE_URLS["admin"], f"/api/v1/categories/{path}", request)

@app.api_route("/api/v1/statistics/{path:path}", methods=["GET", "POST"])
async def proxy_statistics(path: str, request: Request):
    return await proxy_request(SERVICE_URLS["admin"], f"/api/v1/statistics/{path}", request)

@app.api_route("/api/v1/tickets/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_tickets(path: str, request: Request):
    return await proxy_request(SERVICE_URLS["ticket"], f"/api/v1/tickets/{path}", request)

@app.api_route("/api/v1/comments/{path:path}", methods=["GET", "POST"])
async def proxy_comments(path: str, request: Request):
    return await proxy_request(SERVICE_URLS["ticket"], f"/api/v1/comments/{path}", request)

@app.api_route("/api/v1/feedback/{path:path}", methods=["GET", "POST"])
async def proxy_feedback(path: str, request: Request):
    return await proxy_request(SERVICE_URLS["ticket"], f"/api/v1/feedback/{path}", request)

@app.api_route("/api/v1/media/{path:path}", methods=["GET", "POST", "DELETE"])
async def proxy_media(path: str, request: Request):
    return await proxy_request(SERVICE_URLS["media"], f"/api/v1/media/{path}", request)

@app.api_route("/api/v1/geo/{path:path}", methods=["GET", "POST"])
async def proxy_geo(path: str, request: Request):
    return await proxy_request(SERVICE_URLS["geo"], f"/api/v1/geo/{path}", request)

@app.api_route("/api/v1/notifications/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_notifications(path: str, request: Request):
    return await proxy_request(SERVICE_URLS["notification"], f"/api/v1/notifications/{path}", request)

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    health_status = {"status": "healthy", "service": "Orchestrator", "services": {}}
    
    for name, url in SERVICE_URLS.items():
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{url}/health")
                health_status["services"][name] = "healthy" if response.status_code == 200 else "unhealthy"
        except:
            health_status["services"][name] = "unhealthy"
    
    all_healthy = all(status == "healthy" for status in health_status["services"].values())
    return health_status if all_healthy else JSONResponse(status_code=503, content=health_status)

@app.get("/")
async def root():
    return {"service": "Orchestrator", "version": "1.0.0", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.SERVICE_PORT, reload=settings.ENVIRONMENT == "development")
