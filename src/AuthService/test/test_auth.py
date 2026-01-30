"""
Tests for AuthService
"""
import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "service" in response.json()

@pytest.mark.asyncio
async def test_register_user():
    response = client.post("/api/v1/auth/register", json={
        "email": "test_user@example.com",
        "password": "TestPassword123!",
        "first_name": "Test",
        "last_name": "User",
        "role": "citizen"
    })
    assert response.status_code in [201, 400]  # 400 if user already exists

@pytest.mark.asyncio
async def test_login():
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@cityfix.app",
        "password": "Admin123!"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
