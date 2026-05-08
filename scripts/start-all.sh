#!/bin/bash
# Start all EDITH 2.0 services: FastAPI backend, Express proxy, and Vite frontend

set -e

WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[EDITH Startup] Starting all services..."

cleanup() {
  echo ""
  echo "[EDITH Startup] Shutting down all services..."
  # Kill all background processes in this process group
  pkill -P $$ || true
  sleep 1
}
trap cleanup SIGINT SIGTERM EXIT

# === SERVICE 1: FastAPI Backend (port 9000) ===
echo "[Service 1/3] Starting FastAPI backend on port 9000..."
cd "$WORKSPACE_DIR/artifacts/jarvis-api"
python3 -m uvicorn main:app --host 0.0.0.0 --port 9000 --reload > /tmp/edith_backend.log 2>&1 &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"

# === SERVICE 2: Express Proxy (port 8080) ===
echo "[Service 2/3] Starting Express proxy on port 8080..."
cd "$WORKSPACE_DIR/artifacts/api-server"
export PORT=8080
export NODE_ENV=development
pnpm run dev > /tmp/edith_proxy.log 2>&1 &
PROXY_PID=$!
echo "  Proxy PID: $PROXY_PID"

# === SERVICE 3: Vite Frontend (port 5173) ===
echo "[Service 3/3] Starting Vite frontend on port 5173..."
cd "$WORKSPACE_DIR/artifacts/edith"
pnpm run dev > /tmp/edith_frontend.log 2>&1 &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID"

# === Health Checks ===
echo ""
echo "[EDITH Startup] Waiting for services to be ready..."
sleep 3

echo ""
echo "========== SERVICE STATUS =========="

if curl -s http://localhost:9000/health > /dev/null 2>&1; then
  echo "✓ FastAPI Backend (port 9000): HEALTHY"
else
  echo "⚠ FastAPI Backend (port 9000): Not responding yet"
fi

if curl -s http://localhost:8080 > /dev/null 2>&1; then
  echo "✓ Express Proxy (port 8080): HEALTHY"
else
  echo "⚠ Express Proxy (port 8080): Not responding yet"
fi

if curl -s http://localhost:5173 > /dev/null 2>&1; then
  echo "✓ Vite Frontend (port 5173): HEALTHY"
else
  echo "⚠ Vite Frontend (port 5173): Not responding yet"
fi

echo ""
echo "========== ACCESS POINTS =========="
echo "Frontend:  http://localhost:5173"
echo "API Proxy: http://localhost:8080/api"
echo "Backend:   http://localhost:9000/api"
echo ""
echo "[EDITH Startup] All services started. Press Ctrl+C to stop."
echo ""

# Wait for all background processes
wait
