SHELL := /bin/bash

.PHONY: start start-prod dev backend frontend build test reset-db

start:
	./start.sh

start-prod:
	./start.sh --prod

dev:
	./scripts/dev.sh

backend:
	cd backend && PORT=8090 go run ./cmd/server

frontend:
	cd frontend && npm run dev

build:
	cd frontend && npm run build
	rm -rf backend/internal/web/dist
	mkdir -p backend/internal/web/dist
	cp -r frontend/dist/. backend/internal/web/dist/
	cd backend && go build -tags prod -o cheyi-server ./cmd/server

test:
	cd backend && go test ./...
	cd frontend && npm test

reset-db:
	rm -f backend/data/cheyi.db backend/data/cheyi.db-shm backend/data/cheyi.db-wal