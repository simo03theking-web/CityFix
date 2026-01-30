.PHONY: help install-hooks dev-up dev-down build test lint format docker-push k8s-deploy k8s-rollback logs clean

help:
	@echo "CityFix Multi-Tenant Platform - Makefile Commands"
	@echo ""
	@echo "Development Commands:"
	@echo "  make install-hooks    - Install Git hooks for local development"
	@echo "  make dev-up           - Start all services in development mode"
	@echo "  make dev-down         - Stop all development services"
	@echo "  make logs             - View logs from all services"
	@echo ""
	@echo "Build Commands:"
	@echo "  make build            - Build all Docker images"
	@echo "  make test             - Run all tests across services"
	@echo "  make lint             - Lint all code (Python + TypeScript)"
	@echo "  make format           - Format all code (Black + Prettier)"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make docker-push      - Push Docker images to registry"
	@echo ""
	@echo "Kubernetes Commands:"
	@echo "  make k8s-deploy       - Deploy to Kubernetes cluster"
	@echo "  make k8s-rollback     - Rollback Kubernetes deployment"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make clean            - Clean build artifacts and cache"

install-hooks:
	@echo "Installing Git hooks..."
	@chmod +x local_hooks/*
	@cp local_hooks/pre-commit .git/hooks/pre-commit
	@cp local_hooks/pre-push .git/hooks/pre-push
	@cp local_hooks/prepare-commit-msg .git/hooks/prepare-commit-msg
	@echo "Git hooks installed successfully!"

dev-up:
	@echo "Starting CityFix services in development mode..."
	@docker-compose -f docker-compose.global.yml up -d
	@echo "Services started! Frontend: http://localhost:5173"
	@echo "Orchestrator API: http://localhost:8007"
	@echo "API Docs: http://localhost:8007/docs"

dev-down:
	@echo "Stopping all CityFix services..."
	@docker-compose -f docker-compose.global.yml down

logs:
	@docker-compose -f docker-compose.global.yml logs -f

build:
	@echo "Building all Docker images..."
	@docker-compose -f docker-compose.global.yml build --parallel

test:
	@echo "Running tests for all services..."
	@cd src/AuthService && pytest
	@cd src/AdminService && pytest
	@cd src/TicketService && pytest
	@cd src/MediaService && pytest
	@cd src/GeoService && pytest
	@cd src/NotificationService && pytest
	@cd src/Orchestrator && pytest
	@cd src/CityFixUI && npm test
	@echo "All tests passed!"

lint:
	@echo "Linting Python services..."
	@find src -name "*.py" -not -path "*/venv/*" -not -path "*/.venv/*" | xargs pylint --rcfile=.pylintrc || true
	@echo "Linting TypeScript frontend..."
	@cd src/CityFixUI && npm run lint

format:
	@echo "Formatting Python code..."
	@find src -name "*.py" -not -path "*/venv/*" -not -path "*/.venv/*" | xargs black
	@echo "Formatting TypeScript code..."
	@cd src/CityFixUI && npm run format || npx prettier --write "src/**/*.{ts,tsx}"

docker-push:
	@echo "Pushing Docker images to registry..."
	@docker-compose -f docker-compose.global.yml push

k8s-deploy:
	@echo "Deploying to Kubernetes..."
	@kubectl apply -k kubernetes/overlays/prod
	@echo "Deployment complete!"

k8s-rollback:
	@echo "Rolling back Kubernetes deployment..."
	@kubectl rollout undo deployment/auth-service -n cityfix
	@kubectl rollout undo deployment/admin-service -n cityfix
	@kubectl rollout undo deployment/ticket-service -n cityfix
	@kubectl rollout undo deployment/media-service -n cityfix
	@kubectl rollout undo deployment/geo-service -n cityfix
	@kubectl rollout undo deployment/notification-service -n cityfix
	@kubectl rollout undo deployment/orchestrator -n cityfix
	@kubectl rollout undo deployment/cityfixui -n cityfix
	@echo "Rollback complete!"

clean:
	@echo "Cleaning build artifacts and cache..."
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete
	@cd src/CityFixUI && rm -rf node_modules dist build 2>/dev/null || true
	@echo "Cleanup complete!"
