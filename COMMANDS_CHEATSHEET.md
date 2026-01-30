# CityFix Commands Cheatsheet

Quick reference for common CityFix commands.

## 🚀 Quick Start

```bash
# Start everything
make dev-up

# Stop everything
make dev-down

# View logs
make logs
```

## 🐳 Docker Compose

### Start/Stop Services

```bash
# Start all services
docker-compose -f docker-compose.global.yml up -d

# Stop all services
docker-compose -f docker-compose.global.yml down

# Stop and remove volumes (WARNING: deletes data)
docker-compose -f docker-compose.global.yml down -v

# Restart specific service
docker-compose -f docker-compose.global.yml restart auth-service

# Start only specific services
docker-compose -f docker-compose.global.yml up -d mongodb auth-service orchestrator frontend
```

### Logs

```bash
# All logs (follow)
docker-compose -f docker-compose.global.yml logs -f

# Specific service
docker-compose -f docker-compose.global.yml logs -f auth-service

# Last 100 lines
docker-compose -f docker-compose.global.yml logs --tail=100 ticket-service
```

### Status

```bash
# List running services
docker-compose -f docker-compose.global.yml ps

# List all containers
docker ps

# Service stats (CPU, memory)
docker stats
```

## 🔧 Individual Service Development

### Backend Service

```bash
cd src/AuthService
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8001
```

### Frontend

```bash
cd src/CityFixUI
npm install
npm run dev
```

## 🧪 Testing

```bash
# Run all tests
make test

# Backend service tests
cd src/AuthService
pytest
pytest --cov=src --cov-report=html

# Frontend tests
cd src/CityFixUI
npm test
npm run test:coverage
```

## 🎨 Linting & Formatting

```bash
# Lint all
make lint

# Format all
make format

# Python specific
find src -name "*.py" | xargs black
find src -name "*.py" | xargs pylint

# Frontend specific
cd src/CityFixUI
npm run lint
npx prettier --write "src/**/*.{ts,tsx}"
```

## ☸️ Kubernetes

### Deploy

```bash
# Deploy to development
kubectl apply -k kubernetes/overlays/dev

# Deploy to production
kubectl apply -k kubernetes/overlays/prod

# Alternative using Makefile
make k8s-deploy
```

### Status

```bash
# Get all pods
kubectl get pods -n cityfix

# Get all services
kubectl get services -n cityfix

# Get deployments
kubectl get deployments -n cityfix

# Describe pod
kubectl describe pod <pod-name> -n cityfix

# Deployment status
kubectl rollout status deployment/auth-service -n cityfix
```

### Logs

```bash
# Pod logs
kubectl logs <pod-name> -n cityfix

# Follow logs
kubectl logs -f <pod-name> -n cityfix

# Deployment logs
kubectl logs -f deployment/auth-service -n cityfix

# All pods with label
kubectl logs -l app=auth-service -n cityfix
```

### Scale

```bash
# Scale deployment
kubectl scale deployment/ticket-service --replicas=5 -n cityfix

# Autoscale
kubectl autoscale deployment/ticket-service --min=2 --max=10 --cpu-percent=70 -n cityfix
```

### Rollback

```bash
# Rollback deployment
kubectl rollout undo deployment/auth-service -n cityfix

# Rollback all (using Makefile)
make k8s-rollback

# Check rollout history
kubectl rollout history deployment/auth-service -n cityfix
```

### Port Forward

```bash
# Access service locally
kubectl port-forward svc/frontend 8080:80 -n cityfix
kubectl port-forward svc/orchestrator 8007:8007 -n cityfix

# Access pod directly
kubectl port-forward <pod-name> 8001:8001 -n cityfix
```

### Execute Commands in Pod

```bash
# Shell into pod
kubectl exec -it <pod-name> -n cityfix -- /bin/bash

# Run command
kubectl exec <pod-name> -n cityfix -- curl http://localhost:8001/health
```

## 🗄️ MongoDB

### Access MongoDB

```bash
# Via Docker
docker exec -it cityfix-mongodb mongosh -u admin -p CityFixSecure123!

# Via Kubernetes
kubectl exec -it mongodb-0 -n cityfix -- mongosh -u admin -p CityFixSecure123!
```

### Common MongoDB Commands

```javascript
// Show databases
show dbs

// Use CityFix database
use cityfix

// Show collections
show collections

// Count tickets
db.tickets.countDocuments()

// Find users
db.users.find()

// Find tickets by status
db.tickets.find({status: "received"})

// Create index
db.tickets.createIndex({status: 1, created_at: -1})
```

### Backup/Restore

```bash
# Backup
docker exec cityfix-mongodb mongodump --uri="mongodb://admin:CityFixSecure123!@localhost:27017/cityfix?authSource=admin" --out=/backup

# Restore
docker exec cityfix-mongodb mongorestore --uri="mongodb://admin:CityFixSecure123!@localhost:27017/cityfix?authSource=admin" /backup/cityfix
```

## 🔍 Debugging

### Check Service Health

```bash
# AuthService
curl http://localhost:8001/health

# All services via Orchestrator
curl http://localhost:8007/health

# Kubernetes health
kubectl get pods -n cityfix | grep -v Running
```

### API Testing

```bash
# Login
curl -X POST http://localhost:8007/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cityfix.app","password":"Admin123!"}'

# Get tickets (with token)
curl http://localhost:8007/api/v1/tickets \
  -H "Authorization: Bearer <your-token>"

# Create ticket
curl -X POST http://localhost:8007/api/v1/tickets \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test","category":"street","location":{"lat":40.8,"lng":14.2}}'
```

### View API Documentation

```bash
# Open in browser
open http://localhost:8007/docs  # Orchestrator (aggregated)
open http://localhost:8001/docs  # AuthService
open http://localhost:8003/docs  # TicketService
```

## 🛠️ Development

### Git Hooks

```bash
# Install hooks
make install-hooks

# Manually run pre-commit
.git/hooks/pre-commit

# Skip hooks (not recommended)
git commit --no-verify
```

### Build Docker Images

```bash
# Build all
make build

# Build specific service
cd src/AuthService
docker build -t cityfix/auth-service:latest .

# Build with tag
docker build -t cityfix/auth-service:v1.0.1 .
```

### Push to Registry

```bash
# Login to Docker Hub
docker login

# Tag image
docker tag cityfix/auth-service:latest yourusername/cityfix-auth:v1.0.0

# Push
docker push yourusername/cityfix-auth:v1.0.0

# Push all (using Makefile)
make docker-push
```

## 🧹 Cleanup

```bash
# Clean project
make clean

# Remove unused Docker images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything (WARNING: destructive)
docker system prune -a --volumes

# Remove specific service data
docker-compose -f docker-compose.global.yml rm -f -s -v auth-service
```

## 📊 Monitoring

### Resource Usage

```bash
# Docker stats
docker stats

# Kubernetes resource usage
kubectl top nodes
kubectl top pods -n cityfix

# Detailed pod resource usage
kubectl describe pod <pod-name> -n cityfix | grep -A 5 "Limits\|Requests"
```

### Events

```bash
# Kubernetes events
kubectl get events -n cityfix --sort-by='.lastTimestamp'

# Watch events
kubectl get events -n cityfix --watch
```

## 🔐 Security

### View Secrets

```bash
# Kubernetes secrets
kubectl get secrets -n cityfix

# Decode secret
kubectl get secret mongodb-secret -n cityfix -o jsonpath='{.data.password}' | base64 -d
```

### Update Secrets

```bash
# Create/update secret
kubectl create secret generic jwt-secret \
  --from-literal=secret=new-secret-value \
  --dry-run=client -o yaml | kubectl apply -n cityfix -f -
```

## 📦 Postman

```bash
# Import collections
# File → Import → postman/test/CityFix-Test.postman_collection.json

# Run collection with Newman
npm install -g newman
newman run postman/test/CityFix-Test.postman_collection.json
```

## 🆘 Emergency Commands

```bash
# Restart everything
make dev-down && make dev-up

# Force recreate containers
docker-compose -f docker-compose.global.yml up -d --force-recreate

# Check network
docker network ls
docker network inspect cityfix-global-network

# Kill all CityFix containers
docker ps | grep cityfix | awk '{print $1}' | xargs docker kill

# Emergency Kubernetes rollback
kubectl rollout undo deployment/auth-service -n cityfix --to-revision=1
```

---

**Pro Tip**: Create aliases for frequently used commands:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias cfix-up='cd ~/cityfix && make dev-up'
alias cfix-down='cd ~/cityfix && make dev-down'
alias cfix-logs='cd ~/cityfix && make logs'
alias cfix-test='cd ~/cityfix && make test'
```
