# CityFix - Multi-Tenant Urban Maintenance Platform

![CityFix Logo](https://via.placeholder.com/200x80/4CAF50/FFFFFF?text=CityFix)

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🌟 Overview

CityFix is a comprehensive multi-tenant platform for managing urban maintenance requests. It enables citizens to report issues, municipalities to manage interventions, and operators to execute maintenance tasks efficiently.

### Key Capabilities

- **Citizen Reporting**: GPS-enabled issue reporting with photo uploads
- **Multi-Municipality Support**: Fully tenant-aware architecture
- **Real-time Tracking**: Live ticket status updates and notifications
- **Role-Based Access**: Citizens, Operators, Managers, and Admins
- **Analytics Dashboard**: KPIs, statistics, and performance metrics
- **Scalable Microservices**: Independent, containerized services

## 🏗️ Architecture

CityFix follows a microservices architecture with 7 backend services, a React frontend, and MongoDB database.

```
┌─────────────┐
│   Frontend  │ (React + Vite)
│  (Port 5173)│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Orchestrator│ (API Gateway)
│  (Port 8007)│
└──────┬──────┘
       │
       ├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
       ▼          ▼          ▼          ▼          ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│   Auth   │ │  Admin   │ │  Ticket  │ │  Media   │ │   Geo    │ │  Notif   │ │          │
│ Service  │ │ Service  │ │ Service  │ │ Service  │ │ Service  │ │ Service  │ │          │
│  (8001)  │ │  (8002)  │ │  (8003)  │ │  (8004)  │ │  (8005)  │ │  (8006)  │ │          │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────────┘
     │            │            │            │            │            │
     └────────────┴────────────┴────────────┴────────────┴────────────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │   MongoDB     │
                            │  (Port 27017) │
                            └───────────────┘
```

## ✨ Features

### Citizen Features
- Report maintenance issues with GPS location
- Upload photos of problems
- Track ticket status in real-time
- Provide feedback on completed interventions
- View personal ticket history

### Operator Features
- View assigned tasks
- Update ticket status (pending → in progress → resolved)
- Add notes and completion details
- Mobile-friendly task board

### Manager Features
- Dashboard with KPIs and statistics
- Assign tickets to operators
- Filter and search tickets
- Geographic view of all tickets
- Manage operator roster

### Admin Features
- Create and manage municipalities
- Assign municipality managers
- Define maintenance categories
- Global statistics and analytics

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** + **shadcn/ui** for styling
- **React Router** for navigation
- **TanStack Query** for data fetching
- **Leaflet** for maps
- **Framer Motion** for animations

### Backend
- **Python 3.12** with FastAPI
- **Motor** (async MongoDB driver)
- **Pydantic** for validation
- **JWT** authentication
- **Uvicorn** ASGI server
- **Pytest** for testing

### Database
- **MongoDB 7.0** with replica set support

### Infrastructure
- **Docker** & **Docker Compose**
- **Kubernetes** for orchestration
- **Jenkins** for CI/CD
- **SonarQube** for code quality
- **Nginx** for frontend serving

## 📁 Project Structure

```
CityFix/
├── src/
│   ├── AuthService/          # User authentication (8001)
│   ├── AdminService/         # Municipality management (8002)
│   ├── TicketService/        # Ticket lifecycle (8003)
│   ├── MediaService/         # File uploads (8004)
│   ├── GeoService/           # Geocoding (8005)
│   ├── NotificationService/  # Notifications (8006)
│   ├── Orchestrator/         # API Gateway (8007)
│   └── CityFixUI/            # React frontend (5173)
├── kubernetes/
│   ├── base/                 # Base K8s manifests
│   └── overlays/
│       ├── dev/              # Development overrides
│       └── prod/             # Production overrides
├── local_hooks/              # Git hooks (pre-commit, pre-push)
├── remote_hooks/             # Server-side hooks (post-receive)
├── postman/                  # API test collections
├── scripts/                  # Utility scripts
├── docker-compose.global.yml # All services
├── Jenkinsfile               # CI/CD pipeline
├── Makefile                  # Automation commands
└── README.md                 # This file
```

### Service Structure (Example: AuthService)

```
AuthService/
├── src/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration settings
│   ├── database.py          # MongoDB connection
│   ├── models/              # Pydantic models
│   ├── routes/              # API endpoints
│   ├── services/            # Business logic
│   ├── middleware/          # Auth, logging
│   └── utils/               # Helper functions
├── test/                    # Pytest tests
├── requirements.txt         # Python dependencies
├── Dockerfile               # Production image
├── Dockerfile.dev           # Development image
├── docker-compose.dev.yml   # Dev environment
├── pyproject.toml           # Python tooling config
├── .env.example             # Environment variables template
└── .dockerignore            # Docker ignore rules
```

## 🚀 Getting Started

### Prerequisites

- **Docker** 24.0+
- **Docker Compose** 2.20+
- **Node.js** 20+ (for frontend development)
- **Python** 3.12+ (for backend development)
- **kubectl** (for Kubernetes deployment)
- **make** (optional, for convenience commands)

### Quick Start (Docker Compose)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cityfix.git
   cd cityfix
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start all services**
   ```bash
   make dev-up
   # or
   docker-compose -f docker-compose.global.yml up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Orchestrator API: http://localhost:8007
   - API Docs: http://localhost:8007/docs

5. **Default credentials**
   - Admin: `admin@cityfix.app` / `Admin123!`
   - Citizen: `citizen@test.com` / `Test123!`

### Stop Services

```bash
make dev-down
# or
docker-compose -f docker-compose.global.yml down
```

## 💻 Development

### Install Git Hooks

```bash
make install-hooks
```

This installs:
- `pre-commit`: Runs linting and formatting checks
- `pre-push`: Runs tests before pushing
- `prepare-commit-msg`: Provides commit message template

### Backend Development

#### Run individual service

```bash
cd src/AuthService
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8001
```

#### Run tests

```bash
cd src/AuthService
pytest
pytest --cov=src --cov-report=html
```

#### Lint and format

```bash
make lint
make format
```

### Frontend Development

```bash
cd src/CityFixUI
npm install
npm run dev
```

Frontend runs on http://localhost:5173 with hot reload.

#### Build for production

```bash
npm run build
npm run preview
```

## 🚢 Deployment

### Docker Build

Build all service images:

```bash
make build
```

Build individual service:

```bash
cd src/AuthService
docker build -t cityfix/auth-service:latest .
```

### Kubernetes Deployment

#### Prerequisites

- Kubernetes cluster (minikube, GKE, EKS, AKS)
- kubectl configured
- Docker registry access

#### Deploy to Development

```bash
kubectl apply -k kubernetes/overlays/dev
```

#### Deploy to Production

```bash
kubectl apply -k kubernetes/overlays/prod
```

#### Check deployment status

```bash
kubectl get pods -n cityfix
kubectl rollout status deployment/auth-service -n cityfix
```

#### View logs

```bash
kubectl logs -f deployment/auth-service -n cityfix
```

#### Rollback deployment

```bash
make k8s-rollback
# or
kubectl rollout undo deployment/auth-service -n cityfix
```

## 📚 API Documentation

Each service exposes interactive API documentation via FastAPI:

- **AuthService**: http://localhost:8001/docs
- **AdminService**: http://localhost:8002/docs
- **TicketService**: http://localhost:8003/docs
- **MediaService**: http://localhost:8004/docs
- **GeoService**: http://localhost:8005/docs
- **NotificationService**: http://localhost:8006/docs
- **Orchestrator**: http://localhost:8007/docs

### Key Endpoints

#### Authentication
```
POST   /api/v1/auth/register     - Register new user
POST   /api/v1/auth/login        - Login and get JWT token
GET    /api/v1/auth/verify-token - Verify current token
POST   /api/v1/auth/refresh-token - Refresh JWT token
GET    /api/v1/users/profile     - Get user profile
PUT    /api/v1/users/profile     - Update user profile
```

#### Tickets
```
POST   /api/v1/tickets            - Create new ticket
GET    /api/v1/tickets            - List tickets (filterable)
GET    /api/v1/tickets/:id        - Get ticket details
PUT    /api/v1/tickets/:id        - Update ticket
PUT    /api/v1/tickets/:id/status - Update ticket status
POST   /api/v1/comments           - Add comment to ticket
GET    /api/v1/comments/ticket/:id - Get ticket comments
POST   /api/v1/feedback           - Submit ticket feedback
```

#### Municipalities
```
GET    /api/v1/municipalities     - List municipalities
POST   /api/v1/municipalities     - Create municipality
GET    /api/v1/municipalities/:id - Get municipality
PUT    /api/v1/municipalities/:id - Update municipality
DELETE /api/v1/municipalities/:id - Delete municipality
```

#### Media
```
POST   /api/v1/media/upload       - Upload file
GET    /api/v1/media/files/:id    - Get file metadata
DELETE /api/v1/media/files/:id    - Delete file
```

#### Geo
```
GET    /api/v1/geo/geocode        - Convert address to coordinates
GET    /api/v1/geo/reverse-geocode - Convert coordinates to address
GET    /api/v1/geo/boundaries/municipality/:id - Get municipality boundaries
```

#### Notifications
```
POST   /api/v1/notifications      - Create notification
GET    /api/v1/notifications      - Get user notifications
PUT    /api/v1/notifications/:id/read - Mark as read
DELETE /api/v1/notifications/:id  - Delete notification
```

## 🧪 Testing

### Run all tests

```bash
make test
```

### Backend tests (per service)

```bash
cd src/AuthService
pytest -v
pytest --cov=src --cov-report=html
```

### Frontend tests

```bash
cd src/CityFixUI
npm test
npm run test:coverage
```

### Postman Collections

Import collections from `postman/test/` directory into Postman for manual API testing.

## 🔄 CI/CD Pipeline

The project uses Jenkins for continuous integration and deployment.

### Pipeline Stages

1. **Checkout**: Clone repository
2. **Build**: Build Docker images for all services
3. **Test**: Run unit and integration tests
4. **SonarQube**: Code quality analysis
5. **Quality Gate**: Ensure quality standards
6. **Push**: Push images to Docker registry
7. **Deploy**: Deploy to Kubernetes (dev/prod)
8. **Verify**: Health check deployments

### Trigger Pipeline

Pipeline automatically triggers on:
- Push to `main` branch → Production deployment
- Push to `develop` branch → Development deployment

Manual trigger:
```bash
# Via webhook
curl -X POST "http://jenkins:8080/job/CityFix-Pipeline/buildWithParameters?token=TOKEN&branch=main"
```

### Pipeline Configuration

Edit `Jenkinsfile` to customize:
- Docker registry
- Kubernetes cluster
- SonarQube server
- Notification channels

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB is running
docker ps | grep mongodb

# Check MongoDB logs
docker logs cityfix-mongodb

# Test connection
docker exec -it cityfix-mongodb mongosh -u admin -p CityFixSecure123!
```

### Service Not Starting

```bash
# Check service logs
docker logs cityfix-auth-service

# Restart service
docker-compose -f docker-compose.global.yml restart auth-service

# Check health endpoint
curl http://localhost:8001/health
```

### Frontend Not Loading

```bash
# Check if frontend container is running
docker ps | grep frontend

# Check frontend logs
docker logs cityfix-frontend

# Verify API connection
# Check browser console for CORS or API errors
```

### Port Conflicts

If ports are already in use, edit `docker-compose.global.yml` and change port mappings:

```yaml
services:
  auth-service:
    ports:
      - "8001:8001"  # Change left number to different port
```

### Clean Restart

```bash
# Stop all services
make dev-down

# Remove volumes (WARNING: deletes data)
docker-compose -f docker-compose.global.yml down -v

# Rebuild and start
make build
make dev-up
```

## 🗄️ Database Schema

### Collections

#### users
```javascript
{
  _id: ObjectId,
  email: String,
  password_hash: String,
  role: String, // citizen, operator, manager, admin
  first_name: String,
  last_name: String,
  phone: String,
  municipality_id: ObjectId,
  is_active: Boolean,
  created_at: Date,
  updated_at: Date
}
```

#### tickets
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  status: String, // received, in_progress, resolved
  location: {
    type: "Point",
    coordinates: [lng, lat]
  },
  citizen_id: ObjectId,
  assigned_operator_id: ObjectId,
  municipality_id: ObjectId,
  media_ids: [ObjectId],
  created_at: Date,
  updated_at: Date,
  resolved_at: Date
}
```

#### municipalities
```javascript
{
  _id: ObjectId,
  name: String,
  location: {lat: Number, lng: Number},
  admin_id: ObjectId,
  created_at: Date
}
```

## 📈 Performance

- **Horizontal Scaling**: All services are stateless and scale horizontally
- **Database Indexing**: Indexes on frequently queried fields
- **Caching**: Consider adding Redis for session/cache layer
- **CDN**: Serve static assets via CDN in production
- **Monitoring**: Add Prometheus + Grafana for metrics

## 🔐 Security

- JWT token authentication
- HTTPS in production (configure Ingress with TLS)
- Environment variable secrets (use Kubernetes Secrets)
- CORS configured per service
- Input validation with Pydantic
- SQL injection protection (MongoDB NoSQL)
- Rate limiting (add in production)

## 📝 License

MIT License - see LICENSE file

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

## 📞 Support

- GitHub Issues: https://github.com/yourusername/cityfix/issues
- Documentation: https://docs.cityfix.app
- Email: support@cityfix.app

---

**Built with ❤️ for better cities**
