# EDITH 2.0 Startup Guide

## System Architecture

EDITH 2.0 runs on three interconnected services:

```
    User Browser
         ↓
    Vite Frontend (port 5173)
         ↓
    Express Proxy (port 8080)
         ↓
    FastAPI Backend (port 9000)
```

## Ports & Services

| Service | Port | Description |
|---------|------|-------------|
| **Vite Frontend** | 5173 | React web UI |
| **Express Proxy** | 8080 | API gateway (routes `/api/*` to FastAPI) |
| **FastAPI Backend** | 9000 | Core AI/talk/orchestrator endpoints |

## Configuration Details

### Key Configuration Points

1. **Frontend API URL** (useAlwaysOn.ts)
   - Default: `http://localhost:8080`
   - Environment Variable: `VITE_API_URL` (if set, overrides default)
   - ⚠️ Fixed in recent update: Was incorrectly set to port 8000

2. **Express Proxy Port**
   - Default: 8080 (from `PORT` environment variable)
   - Can be overridden: `PORT=9000 pnpm run dev`

3. **FastAPI Backend Port**
   - Fixed at port 9000 (hardcoded in Express proxy configuration)

## Quick Start

### Option 1: Start All Services at Once (Recommended)

```bash
cd /workspaces/EDITH2.0
chmod +x scripts/start-all.sh
./scripts/start-all.sh
```

This script will:
- ✅ Start FastAPI backend on port 9000
- ✅ Start Express proxy on port 8080
- ✅ Start Vite frontend on port 5173
- ✅ Run health checks
- ✅ Display access points

**Access EDITH at:** http://localhost:5173

### Option 2: Start Services Individually

#### Terminal 1 - FastAPI Backend
```bash
cd /workspaces/EDITH2.0/artifacts/jarvis-api
python3 -m uvicorn main:app --host 0.0.0.0 --port 9000 --reload
```

#### Terminal 2 - Express Proxy
```bash
cd /workspaces/EDITH2.0/artifacts/api-server
export PORT=8080
export NODE_ENV=development
pnpm run dev
```

#### Terminal 3 - Vite Frontend
```bash
cd /workspaces/EDITH2.0/artifacts/edith
pnpm run dev
```

## Troubleshooting

### Issue: "Cannot GET /api/talk/chat" (404 error)

**Cause:** Express proxy is not running
- Check: Is port 8080 responding? `curl http://localhost:8080`
- Solution: Start Express proxy (see Option 2 above)

### Issue: Audio not playing from "Always On" mode

**Cause:** API URL mismatch
- Check: Is `VITE_API_URL` set incorrectly?
- Solution: Use default (localhost:8080) or ensure proxy is running on that port

### Issue: Backend responses not reaching frontend

**Cause:** Proxy routing issue
- Check: Does `/api/talk/chat` call succeed directly? `curl -X POST http://localhost:9000/api/talk/chat -H "Content-Type: application/json" -d '{"text":"hello"}'`
- Solution: If it works on 9000 but not through proxy on 8080, the Express proxy middleware may need review

### Issue: Port already in use

```bash
# Find process using port 9000
lsof -i :9000

# Kill process (if needed)
kill -9 <PID>
```

## Testing the Configuration

### Test 1: Backend Audio Generation
```bash
curl -X POST http://localhost:9000/api/talk/chat \
  -H "Content-Type: application/json" \
  -d '{"text":"hello","respond_with_voice":true}'
```
Expected: JSON response with `audio_base64` field containing MP3 data

### Test 2: Through Express Proxy
```bash
curl -X POST http://localhost:8080/api/talk/chat \
  -H "Content-Type: application/json" \
  -d '{"text":"hello","respond_with_voice":true}'
```
Expected: Same as Test 1 (proxy forwards correctly)

### Test 3: Frontend Application
- Navigate to http://localhost:5173
- Talk Mode button should be accessible
- Clicking "Boot Greeting" should play audio if backend is working

### Test 4: All Services Health Check
```bash
echo "Backend:" && curl -s http://localhost:9000/health
echo "Proxy:" && curl -s http://localhost:8080 -w "\nStatus: %{http_code}\n"
echo "Frontend:" && curl -s http://localhost:5173 | head -n 5
```

## Log Files

When running services in background:
- Backend: `/tmp/edith_backend.log`
- Proxy: `/tmp/edith_proxy.log`
- Frontend: `/tmp/edith_frontend.log`

View logs:
```bash
tail -f /tmp/edith_backend.log
tail -f /tmp/edith_proxy.log
tail -f /tmp/edith_frontend.log
```

## Common Environment Variables

```bash
# FastAPI
JARVIS_PORT=9000        # Backend port (used by Express proxy)

# Express Proxy
PORT=8080              # Proxy server port
NODE_ENV=development   # For development with hot reload

# Vite Frontend
PORT=5173              # Frontend dev server port
BASE_PATH=/            # Application base path
VITE_API_URL=http://localhost:8080  # Override API endpoint
```

## Development Tips

### Hot Reload
All services support hot reload during development:
- **Backend:** Changes to `.py` files automatically reload
- **Proxy:** Changes to `.ts` files require restart or use `pnpm run dev`
- **Frontend:** Changes to `.tsx` files automatically reload

### Building for Production
```bash
# Build Express proxy
cd artifacts/api-server
pnpm run build

# Build frontend
cd artifacts/edith
pnpm run build
```

## Architecture Notes

### Why Three Services?

1. **Frontend (Vite/React)** - User interface
2. **Express Proxy** - Acts as middleware
   - Simplifies deployment (single reverse-proxy endpoint)
   - Handles CORS issues
   - Routes requests to appropriate backend services
   - Could be replaced with Nginx in production

3. **FastAPI Backend** - Core logic
   - Text-to-speech (edge-tts)
   - Speech-to-text (Groq API)
   - AI responses (LLM integration)
   - Desktop control (WebSocket support)

### Request Flow: `/api/talk/chat`

```
Frontend (5173)
  → fetch("/api/talk/chat")
  → Express Proxy (8080)
    → forwards to http://127.0.0.1:9000/api/talk/chat
  → FastAPI (9000)
    → processes request
    → returns JSON with audio_base64
```

## Next Steps

After startup, test these features:

1. **Talk Mode** - Text input or voice recording
2. **Always On Listening** - Continuous voice detection
3. **Audio Response** - Verify voice synthesis works
4. **Desktop Control** - Test OS integration (if enabled)
5. **Orchestrator** - Multi-agent coordination

---

For issues, check `/tmp/edith_*.log` files or verify ports are responding:
```bash
curl -s http://localhost:9000/health && echo "Backend OK"
curl -s http://localhost:8080 && echo "Proxy OK"
curl -s http://localhost:5173 | head -1 && echo "Frontend OK"
```
