#!/bin/bash
# Start the Jarvis Python agent only.
# api-server (port 8080) is managed by its own artifact workflow.
# edith frontend is managed by its own artifact workflow.

set -e

WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cleanup() {
  echo "[start-all] shutting down..."
  kill $(jobs -p) 2>/dev/null || true
}
trap cleanup SIGINT SIGTERM EXIT

# Start Jarvis Python agent on localhost:9000 (127.0.0.1 — not externally reachable)
cd "$WORKSPACE_DIR/artifacts/jarvis-api"
# Bind to 0.0.0.0 so Replit's waitForPort detection can see the port.
# Port 9000 has no externalPort in .replit, so it is never externally routed.
# All jarvis traffic must flow through api-server's proxy (/api/jarvis/*).
exec python3 -m uvicorn main:app --host 0.0.0.0 --port 9000 --reload
