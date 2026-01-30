.PHONY: help dev build lint format test clean

help:
	@echo "CityFixUI Makefile Commands"
	@echo ""
	@echo "  make dev      - Start development server"
	@echo "  make build    - Build for production"
	@echo "  make lint     - Lint code"
	@echo "  make format   - Format code"
	@echo "  make test     - Run tests"
	@echo "  make clean    - Clean build artifacts"

dev:
	npm run dev

build:
	npm run build

lint:
	npm run lint

format:
	npx prettier --write "src/**/*.{ts,tsx,css}"

test:
	npm test

clean:
	rm -rf dist build node_modules
