dev_up:
	@echo "Starting development configuration for Frontend..."
	docker compose -f docker-compose.dev.yml up --build -d

dev_up_nocache:
	@echo "Starting development configuration for Frontend without cache..."
	docker compose -f docker-compose.dev.yml build --no-cache
	docker compose -f docker-compose.dev.yml up -d


dev_down:
	@echo "Stopping development configuration for Frontend..."
	docker compose -f docker-compose.dev.yml down

dev_logs:
	@echo "Showing logs for development configuration of Frontend..."
	docker compose -f docker-compose.dev.yml logs -f