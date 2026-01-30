# CityFix Quick Start Guide

Get CityFix up and running in 5 minutes!

## 🚀 Prerequisites

- Docker 24.0+ and Docker Compose 2.20+
- 8GB RAM minimum
- 10GB free disk space

## ⚡ Quick Start (Docker Compose)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd cityfix
cp .env.example .env
```

### 2. Start All Services

```bash
make dev-up
```

Or manually:

```bash
docker-compose -f docker-compose.global.yml up -d
```

### 3. Wait for Services

Services take ~2-3 minutes to start. Watch the logs:

```bash
docker-compose -f docker-compose.global.yml logs -f
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:8007
- **API Docs**: http://localhost:8007/docs

### 5. Login

Default credentials:

- **Admin**: `admin@cityfix.app` / `Admin123!`
- **Citizen**: `citizen@test.com` / `Test123!`

## 🧪 Verify Installation

```bash
# Check all services are running
docker-compose -f docker-compose.global.yml ps

# Test API Gateway
curl http://localhost:8007/health

# Test individual service
curl http://localhost:8001/health  # AuthService
```

## 🛠️ Common Commands

```bash
# Stop services
make dev-down

# View logs
make logs

# Restart a service
docker-compose -f docker-compose.global.yml restart auth-service

# Clean restart (WARNING: deletes data)
make dev-down
docker-compose -f docker-compose.global.yml down -v
make dev-up
```

## 📱 First Steps

1. **Register as Citizen**
   - Go to http://localhost:5173
   - Click "Register"
   - Fill form with role "Citizen"

2. **Report an Issue**
   - Login as citizen
   - Click "Report Issue"
   - Use map to select location
   - Upload photo (optional)
   - Submit

3. **View as Manager**
   - Login as admin (admin@cityfix.app)
   - See dashboard with all tickets
   - Assign ticket to operator

## 🐛 Troubleshooting

### Services won't start

```bash
# Check if ports are already in use
netstat -tlnp | grep -E '5173|8001|8002|8003|8004|8005|8006|8007|27017'

# Check Docker status
docker ps
docker-compose -f docker-compose.global.yml ps
```

### MongoDB connection error

```bash
# Restart MongoDB
docker-compose -f docker-compose.global.yml restart mongodb

# Check MongoDB logs
docker logs cityfix-mongodb

# Access MongoDB directly
docker exec -it cityfix-mongodb mongosh -u admin -p CityFixSecure123!
```

### Frontend not loading

```bash
# Check frontend logs
docker logs cityfix-frontend

# Check if Orchestrator is running
curl http://localhost:8007/health

# Clear browser cache
# Open in incognito mode
```

## 📚 Next Steps

- Read [README.md](README.md) for full documentation
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for production deployment
- Review [API Documentation](http://localhost:8007/docs)

## 🎯 Quick Feature Tour

### As Citizen
1. Register account
2. Report maintenance issue
3. Upload photos
4. Track ticket status
5. Provide feedback when resolved

### As Operator
1. Login with operator credentials
2. View assigned tasks
3. Update ticket status
4. Add completion notes

### As Manager
1. Login as admin
2. View all tickets on map
3. Assign tickets to operators
4. View statistics dashboard

### As Admin
1. Create new municipalities
2. Assign municipality managers
3. Define maintenance categories
4. View global analytics

## 📞 Need Help?

- GitHub Issues: https://github.com/yourusername/cityfix/issues
- Documentation: [README.md](README.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)

## 🎉 You're Ready!

The platform is now running. Start reporting issues and managing urban maintenance! 🏙️
