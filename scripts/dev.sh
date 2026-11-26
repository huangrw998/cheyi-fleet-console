#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
trap 'kill 0' EXIT INT TERM

( cd backend && PORT=8090 go run ./cmd/server ) &
( cd frontend && npm run dev ) &

wait