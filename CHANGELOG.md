# Changelog

All notable changes to CityFix will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- WebSocket support for real-time updates
- Push notifications (FCM/APNs)
- SMS notifications via Twilio
- Advanced search with Elasticsearch
- PDF report generation
- Mobile app (React Native)

## [1.0.0] - 2026-01-30

### Added

#### Backend Services
- **AuthService** (Port 8001): User authentication and authorization
  - JWT-based authentication
  - User registration and login
  - Role-based access control (citizen, operator, manager, admin)
  - Password hashing with bcrypt
  - Profile management endpoints

- **AdminService** (Port 8002): Municipality and platform administration
  - CRUD operations for municipalities
  - Maintenance category management
  - Global statistics and analytics
  - Multi-tenant support

- **TicketService** (Port 8003): Ticket lifecycle management
  - Create, read, update, delete tickets
  - Status transitions (received → in progress → resolved)
  - Ticket assignment to operators
  - Comments system
  - Citizen feedback and ratings
  - Geospatial queries

- **MediaService** (Port 8004): File upload and storage
  - Image upload with validation
  - File type and size restrictions
  - Local storage support
  - Metadata management

- **GeoService** (Port 8005): Geolocation services
  - Address geocoding (Nominatim)
  - Reverse geocoding
  - Municipality boundary management
  - Distance calculations

- **NotificationService** (Port 8006): Notification management
  - In-app notifications
  - Email notifications (SMTP)
  - Notification preferences
  - Notification history

- **Orchestrator** (Port 8007): API Gateway
  - Single entry point for all services
  - Request routing and proxying
  - Centralized health checking
  - Request/response logging

#### Frontend
- **CityFixUI** (Port 5173): React web application
  - Responsive design (mobile, tablet, desktop)
  - Interactive map with Leaflet
  - GPS-based location capture
  - Photo upload functionality
  - User authentication flows
  - Role-specific dashboards:
    - Citizen dashboard (report, track tickets)
    - Operator dashboard (task management)
    - Manager dashboard (assignment, analytics)
    - Admin dashboard (municipality management)
  - Real-time ticket status updates
  - Dark mode support
  - Accessibility features

#### Infrastructure
- **Docker**: Containerization for all services
  - Production Dockerfiles (multi-stage builds)
  - Development Dockerfiles (hot reload)
  - Docker Compose for local development
  - Network isolation

- **Kubernetes**: Orchestration and deployment
  - Base manifests for all services
  - Development and production overlays
  - StatefulSet for MongoDB
  - Ingress configuration
  - Resource limits and requests
  - Health checks and probes
  - Horizontal scaling support

- **CI/CD**: Jenkins pipeline
  - Automated builds on push
  - Unit and integration tests
  - SonarQube code quality analysis
  - Docker image building and pushing
  - Kubernetes deployment
  - Rollback on failure

- **Git Hooks**: Development workflow
  - Pre-commit: Linting and formatting
  - Pre-push: Test execution
  - Prepare-commit-msg: Conventional commits template
  - Post-receive: CI/CD trigger

#### Database
- **MongoDB** 7.0 with collections:
  - `users`: User accounts
  - `municipalities`: Municipality data
  - `maintenance_categories`: Issue categories
  - `tickets`: Maintenance tickets
  - `ticket_comments`: Ticket comments
  - `ticket_feedback`: Citizen feedback
  - `media_files`: File metadata
  - `municipality_boundaries`: Geographic boundaries
  - `notifications`: Notification queue
  - `notification_preferences`: User preferences

#### Documentation
- **README.md**: Comprehensive project overview
- **ARCHITECTURE.md**: System architecture documentation
- **DEPLOYMENT_GUIDE.md**: Deployment instructions
- **CONTRIBUTING.md**: Contribution guidelines
- **CHANGELOG.md**: Version history (this file)

#### Testing
- Pytest framework for backend tests
- Vitest for frontend tests
- Test examples for AuthService
- Postman collections for API testing

#### DevOps
- Makefile for automation
- Environment variable templates (.env.example)
- .dockerignore for optimized builds
- .gitignore for version control
- Pylintrc for Python linting

### Features by Role

#### Citizen
- Register and login
- Report maintenance issues with GPS location
- Upload photos of problems
- Track ticket status
- View ticket history
- Provide feedback on resolved tickets

#### Operator
- View assigned tasks
- Update ticket status
- Add completion notes
- Access ticket details and photos
- Filter tickets by status

#### Manager
- Dashboard with KPIs
- Assign tickets to operators
- View all tickets for municipality
- Geographic ticket map view
- Manage operator roster
- Filter and search tickets

#### Admin
- Create and manage municipalities
- Assign municipality managers
- Define maintenance categories
- View global statistics
- Manage system configuration

### Technical Highlights
- **Async Python**: FastAPI with motor for high concurrency
- **Type Safety**: Pydantic models and TypeScript
- **API Documentation**: Auto-generated with OpenAPI/Swagger
- **Scalability**: Stateless services, horizontal scaling
- **Security**: JWT authentication, RBAC, bcrypt hashing
- **Observability**: Health checks, logging, structured errors
- **Cloud-Native**: Kubernetes-ready, 12-factor app principles

### Dependencies

#### Backend
- FastAPI 0.109.0
- uvicorn 0.27.0
- motor 3.3.2
- pymongo 4.6.1
- pydantic 2.5.3
- python-jose 3.3.0
- passlib 1.7.4
- geopy 2.4.1
- Pillow 10.2.0
- aiosmtplib 3.0.1

#### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- Leaflet
- Framer Motion

### Infrastructure
- Docker 24.0+
- Kubernetes 1.25+
- MongoDB 7.0
- Jenkins (latest)
- SonarQube (latest)

## [0.1.0] - 2025-12-01

### Added
- Initial project setup
- Basic React frontend scaffolding
- Project structure planning

---

**Note**: This is the first production release of CityFix. Future versions will follow semantic versioning.

[Unreleased]: https://github.com/yourusername/cityfix/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/cityfix/releases/tag/v1.0.0
[0.1.0]: https://github.com/yourusername/cityfix/releases/tag/v0.1.0
