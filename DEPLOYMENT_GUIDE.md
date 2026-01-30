# CityFix Deployment Guide

## Quick Start Guide

### Local Development with Docker Compose

1. **Prerequisites**
   ```bash
   docker --version  # Should be 24.0+
   docker-compose --version  # Should be 2.20+
   ```

2. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd cityfix
   cp .env.example .env
   ```

3. **Start All Services**
   ```bash
   make dev-up
   # Wait 2-3 minutes for all services to start
   ```

4. **Verify Services**
   ```bash
   docker-compose -f docker-compose.global.yml ps
   curl http://localhost:8007/health
   ```

5. **Access Application**
   - Frontend: http://localhost:5173
   - API Gateway: http://localhost:8007/docs
   - Login: admin@cityfix.app / Admin123!

### Individual Service Development

```bash
cd src/AuthService
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8001
```

## Production Deployment

### Kubernetes Deployment

1. **Prerequisites**
   - Kubernetes cluster (1.25+)
   - kubectl configured
   - Docker registry access
   - Kustomize installed

2. **Build and Push Images**
   ```bash
   # Login to Docker registry
   docker login

   # Build all images
   make build

   # Tag images for registry
   docker tag cityfix/auth-service:latest yourregistry/cityfix/auth-service:v1.0.0

   # Push to registry
   make docker-push
   ```

3. **Deploy to Kubernetes**
   ```bash
   # Deploy to production
   kubectl apply -k kubernetes/overlays/prod

   # Check deployment status
   kubectl get pods -n cityfix
   kubectl get services -n cityfix
   ```

4. **Verify Deployment**
   ```bash
   kubectl rollout status deployment/auth-service -n cityfix
   kubectl logs -f deployment/orchestrator -n cityfix
   ```

5. **Access Application**
   ```bash
   kubectl port-forward svc/frontend 8080:80 -n cityfix
   # Open http://localhost:8080
   ```

### CI/CD with Jenkins

1. **Setup Jenkins**
   - Install Jenkins
   - Install plugins: Docker, Kubernetes, SonarQube
   - Configure credentials:
     - Docker Hub
     - Kubernetes config
     - SonarQube token

2. **Create Pipeline**
   - Create new Pipeline job
   - Point to Jenkinsfile in repository
   - Configure webhook for automatic triggers

3. **Configure Webhooks**
   ```bash
   # GitHub webhook URL
   http://jenkins:8080/github-webhook/

   # Manual trigger
   curl -X POST "http://jenkins:8080/job/CityFix-Pipeline/build?token=YOUR_TOKEN"
   ```

## Scaling and High Availability

### Horizontal Pod Autoscaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auth-service-hpa
  namespace: cityfix
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

Apply with:
```bash
kubectl apply -f hpa.yaml
```

### MongoDB Replica Set

For production, use MongoDB Atlas or deploy a replica set:

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongodb
spec:
  replicas: 3
  serviceName: mongodb
  # ... (see kubernetes/base/mongodb-statefulset.yaml)
```

## Monitoring and Logging

### Prometheus + Grafana

1. **Install Prometheus Operator**
   ```bash
   helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring
   ```

2. **Configure ServiceMonitor**
   ```yaml
   apiVersion: monitoring.coreos.com/v1
   kind: ServiceMonitor
   metadata:
     name: cityfix-services
   spec:
     selector:
       matchLabels:
         app: cityfix
     endpoints:
     - port: http
       interval: 30s
   ```

### Centralized Logging (ELK Stack)

```bash
helm install elasticsearch elastic/elasticsearch -n logging
helm install kibana elastic/kibana -n logging
helm install filebeat elastic/filebeat -n logging
```

## Backup and Recovery

### MongoDB Backups

```bash
# Automated backup script
kubectl exec -it mongodb-0 -n cityfix -- \
  mongodump --uri="mongodb://admin:password@localhost:27017/cityfix?authSource=admin" \
  --out=/backup/$(date +%Y%m%d)

# Restore
kubectl exec -it mongodb-0 -n cityfix -- \
  mongorestore --uri="mongodb://admin:password@localhost:27017/cityfix?authSource=admin" \
  /backup/20240130
```

### Kubernetes Backups (Velero)

```bash
velero install --provider aws --bucket cityfix-backups
velero backup create cityfix-backup --include-namespaces cityfix
velero restore create --from-backup cityfix-backup
```

## Security Hardening

1. **Enable TLS/HTTPS**
   ```bash
   kubectl apply -f https-ingress.yaml
   ```

2. **Network Policies**
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: deny-all
   spec:
     podSelector: {}
     policyTypes:
     - Ingress
     - Egress
   ```

3. **Secrets Management**
   - Use Kubernetes Secrets
   - Consider HashiCorp Vault
   - External Secrets Operator

## Troubleshooting

### Common Issues

**Service won't start**
```bash
kubectl describe pod <pod-name> -n cityfix
kubectl logs <pod-name> -n cityfix
```

**Database connection errors**
```bash
kubectl exec -it mongodb-0 -n cityfix -- mongosh
# Check connectivity
```

**Image pull errors**
```bash
kubectl get events -n cityfix
# Check imagePullSecrets
```

## Performance Tuning

### Database Optimization

```javascript
// Create indexes
db.tickets.createIndex({ "location.coordinates": "2dsphere" })
db.tickets.createIndex({ status: 1, created_at: -1 })
db.users.createIndex({ email: 1 }, { unique: true })
```

### Resource Limits

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

## Maintenance

### Rolling Updates

```bash
kubectl set image deployment/auth-service auth-service=cityfix/auth-service:v2.0.0 -n cityfix
kubectl rollout status deployment/auth-service -n cityfix
```

### Database Migrations

```bash
cd src/AuthService
python migrations/migrate_v2.py
```

## Cost Optimization

- Use node affinity for cheaper instances
- Enable cluster autoscaler
- Use spot instances for dev/staging
- Set appropriate resource requests/limits
- Consider serverless options for low-traffic services

## Support

For deployment issues:
- GitHub Issues: https://github.com/yourusername/cityfix/issues
- Email: devops@cityfix.app
- Slack: #cityfix-deployments
