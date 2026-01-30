# CityFix Architecture Documentation

## System Overview

CityFix is built as a distributed microservices architecture designed for scalability, maintainability, and multi-tenancy support.

## Architecture Principles

1. **Microservices**: Independent, loosely-coupled services
2. **API Gateway Pattern**: Single entry point via Orchestrator
3. **Database per Service**: Each service owns its data (MongoDB collections)
4. **Event-Driven** (future): Service communication via message bus
5. **Containerization**: All services packaged as Docker containers
6. **Cloud-Native**: Kubernetes-ready for orchestration

## Technology Choices

### Why Python + FastAPI?
- **Async Support**: Native async/await for high concurrency
- **Auto Documentation**: OpenAPI/Swagger out of the box
- **Type Safety**: Pydantic models with validation
- **Performance**: Fast, comparable to Node.js/Go
- **Ecosystem**: Rich libraries (geopy, motor, etc.)

### Why React + TypeScript?
- **Component-Based**: Reusable UI components
- **Type Safety**: Catch errors at compile time
- **Modern Tooling**: Vite for fast dev/build
- **Rich Ecosystem**: shadcn/ui, TanStack Query, Leaflet

### Why MongoDB?
- **Flexible Schema**: Easy evolution of data models
- **Geospatial**: Native support for location queries
- **Document Model**: Natural fit for JSON APIs
- **Scalability**: Horizontal scaling with sharding

### Why Kubernetes?
- **Orchestration**: Automated deployment and scaling
- **Self-Healing**: Automatic restarts and health checks
- **Service Discovery**: Internal DNS and load balancing
- **Rolling Updates**: Zero-downtime deployments

## Service Breakdown

### 1. AuthService (Port 8001)
**Responsibility**: User authentication and authorization

**Key Functions**:
- User registration and login
- JWT token generation and validation
- Password hashing (bcrypt)
- Role-based access control (RBAC)

**Database Collections**:
- `users`: User accounts and profiles

**Dependencies**:
- python-jose (JWT)
- passlib (password hashing)
- motor (MongoDB)

### 2. AdminService (Port 8002)
**Responsibility**: Platform administration and municipality management

**Key Functions**:
- CRUD operations for municipalities
- Maintenance category management
- Global statistics and analytics
- Admin user management

**Database Collections**:
- `municipalities`: Municipality data
- `maintenance_categories`: Issue categories

**Dependencies**:
- Depends on AuthService for authentication

### 3. TicketService (Port 8003)
**Responsibility**: Core ticket lifecycle management

**Key Functions**:
- Create, read, update tickets
- Status transitions (received → in progress → resolved)
- Ticket assignment to operators
- Comments and feedback
- Filtering and search

**Database Collections**:
- `tickets`: Ticket data with geolocation
- `ticket_comments`: Comments on tickets
- `ticket_feedback`: Citizen ratings

**Dependencies**:
- NotificationService for status updates
- MediaService for attached images

### 4. MediaService (Port 8004)
**Responsibility**: File upload and storage

**Key Functions**:
- Image upload with validation
- File type and size checks
- Thumbnail generation (future)
- CDN integration (future)
- File deletion

**Database Collections**:
- `media_files`: File metadata

**Storage**:
- Local filesystem (development)
- S3-compatible storage (production)

**Dependencies**:
- Pillow for image processing

### 5. GeoService (Port 8005)
**Responsibility**: Geolocation and mapping

**Key Functions**:
- Address geocoding (text → coordinates)
- Reverse geocoding (coordinates → address)
- Municipality boundary management
- Distance calculations

**Database Collections**:
- `municipality_boundaries`: GeoJSON polygons

**Dependencies**:
- geopy (Nominatim)
- Future: Private geocoding API

### 6. NotificationService (Port 8006)
**Responsibility**: Multi-channel notifications

**Key Functions**:
- In-app notifications
- Email notifications
- SMS notifications (future)
- Push notifications (future)
- Notification preferences
- WebSocket for real-time updates (future)

**Database Collections**:
- `notifications`: Notification queue
- `notification_preferences`: User preferences

**Dependencies**:
- aiosmtplib for email
- websockets for real-time

### 7. Orchestrator (Port 8007)
**Responsibility**: API Gateway and request routing

**Key Functions**:
- Single entry point for all API requests
- Request routing to appropriate services
- Authentication middleware
- Request/response logging
- Rate limiting (future)
- API versioning

**No Database**: Stateless proxy service

**Dependencies**:
- httpx for proxying requests

### 8. Frontend (Port 5173/80)
**Responsibility**: User interface

**Key Features**:
- Responsive design (mobile, tablet, desktop)
- Interactive map (Leaflet)
- Real-time updates (TanStack Query)
- Photo upload
- GPS location capture
- Role-based views

**Tech Stack**:
- React 18 + TypeScript
- Vite (bundler)
- Tailwind CSS + shadcn/ui
- React Router
- TanStack Query
- Leaflet maps

## Data Flow Examples

### Creating a Ticket

```
Citizen (Frontend)
    ↓ POST /api/v1/tickets
Orchestrator
    ↓ Forwards to TicketService
TicketService
    ↓ Validates data
    ↓ Saves to MongoDB (tickets collection)
    ↓ Triggers notification
    ↓ Returns ticket ID
Orchestrator
    ↓ Returns response
Frontend
    ↓ Shows success message
    ↓ Redirects to ticket details
```

### User Login

```
User (Frontend)
    ↓ POST /api/v1/auth/login
Orchestrator
    ↓ Forwards to AuthService
AuthService
    ↓ Validates credentials
    ↓ Generates JWT token
    ↓ Returns token + user data
Frontend
    ↓ Stores token in localStorage
    ↓ Includes token in Authorization header for future requests
```

### Assigning Ticket to Operator

```
Manager (Frontend)
    ↓ PUT /api/v1/tickets/:id (with assigned_operator_id)
Orchestrator
    ↓ Forwards to TicketService
TicketService
    ↓ Updates ticket in MongoDB
    ↓ Calls NotificationService to notify operator
NotificationService
    ↓ Creates notification record
    ↓ Sends email to operator
    ↓ (Future: Sends push notification)
```

## Security Architecture

### Authentication Flow
1. User submits email/password
2. AuthService validates and returns JWT
3. Client stores JWT (localStorage)
4. Client sends JWT in Authorization header: `Bearer <token>`
5. Services validate JWT on each request

### Authorization
- **Role-Based Access Control (RBAC)**
  - `citizen`: Create tickets, view own tickets
  - `operator`: View assigned tickets, update status
  - `manager`: View all tickets, assign operators
  - `admin`: Full system access

### Data Protection
- Passwords hashed with bcrypt (12 rounds)
- JWT secrets stored in environment variables
- HTTPS in production (TLS termination at Ingress)
- Kubernetes Secrets for sensitive data
- No secrets in code or version control

## Scalability Considerations

### Horizontal Scaling
All services are **stateless** and can scale horizontally:

```yaml
# Scale TicketService to 5 replicas
kubectl scale deployment ticket-service --replicas=5 -n cityfix
```

### Database Scaling
- MongoDB supports **sharding** for horizontal scaling
- Read replicas for read-heavy workloads
- Connection pooling in each service

### Caching Strategy (Future)
```
Client → Orchestrator → Redis Cache → Service → Database
                           ↑______________|
```

### Load Balancing
- **Kubernetes Service**: Round-robin by default
- **Ingress**: NGINX for external traffic
- **Future**: Consider service mesh (Istio)

## Monitoring and Observability

### Logging
- Centralized logging via ELK Stack
- Structured JSON logs
- Request ID tracking across services

### Metrics
- Prometheus for metrics collection
- Grafana for visualization
- Key metrics:
  - Request rate
  - Error rate
  - Response time (p50, p95, p99)
  - Resource utilization (CPU, memory)

### Tracing (Future)
- Distributed tracing with Jaeger
- Trace requests across services

### Health Checks
Each service exposes `/health` endpoint:
```json
{
  "status": "healthy",
  "service": "TicketService",
  "version": "1.0.0"
}
```

## Deployment Pipeline

```
Developer
    ↓ git push
GitHub
    ↓ Webhook triggers Jenkins
Jenkins
    ↓ Runs tests
    ↓ SonarQube scan
    ↓ Builds Docker images
    ↓ Pushes to Docker registry
    ↓ Updates Kubernetes manifests
    ↓ Deploys to cluster
Kubernetes
    ↓ Rolling update
    ↓ Health checks
    ↓ Traffic routing
Production
```

## Future Enhancements

### Phase 2
- [ ] WebSocket support for real-time updates
- [ ] Push notifications (FCM/APNs)
- [ ] SMS notifications (Twilio)
- [ ] Advanced search (Elasticsearch)
- [ ] Report generation (PDF exports)

### Phase 3
- [ ] Mobile apps (React Native)
- [ ] Offline support (PWA)
- [ ] Multi-language support (i18n)
- [ ] Analytics dashboard (data visualization)
- [ ] Machine learning (predictive maintenance)

### Phase 4
- [ ] Service mesh (Istio)
- [ ] GraphQL API
- [ ] Event sourcing
- [ ] CQRS pattern
- [ ] Blockchain for transparency (optional)

## Development Guidelines

### Code Organization
```
service/
├── src/
│   ├── main.py          # FastAPI app
│   ├── config.py        # Settings
│   ├── database.py      # DB connection
│   ├── models/          # Pydantic models
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── middleware/      # Auth, logging
│   └── utils/           # Helper functions
└── test/                # Pytest tests
```

### API Design
- RESTful principles
- Consistent error responses
- API versioning (`/api/v1/`)
- OpenAPI documentation

### Testing Strategy
- Unit tests: 80%+ coverage
- Integration tests for critical paths
- E2E tests for user journeys
- Load testing before releases

## Performance Targets

- **Response Time**: p95 < 200ms
- **Availability**: 99.9% uptime
- **Throughput**: 1000 req/sec per service
- **Database**: Query time < 50ms

## Cost Optimization

- **Kubernetes**: Use node affinity for cheaper instances
- **Database**: Connection pooling, query optimization
- **Images**: Multi-stage Docker builds (smaller images)
- **Resources**: Right-size requests/limits
- **Autoscaling**: Scale down during low traffic

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Maintained By**: DevOps Team
