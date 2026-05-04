# EDITH 2.0 Full OS Control Agent — QUICK START GUIDE

## For Developers

### To Start the System:

```bash
# Terminal 1: Start Backend
cd /workspaces/EDITH2.0/artifacts/jarvis-api
python main.py    # Runs on http://localhost:9000

# Terminal 2: Start Frontend  
cd /workspaces/EDITH2.0/artifacts/edith
npm run dev       # Runs on http://localhost:5173
```

### To Test Commands:

```bash
# Basic test
curl -X POST http://localhost:9000/api/orchestrator/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "open youtube", "session_id": "test"}'

# Get system info
curl -X POST http://localhost:9000/api/orchestrator/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "system info", "session_id": "test"}'

# Hindi/Hinglish test
curl -X POST http://localhost:9000/api/orchestrator/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "youtube kholo", "session_id": "test"}'
```

---

## What Works

### ✅ Fully Functional
- Open any app (YouTube, Chrome, VSCode, etc.)
- Search on Google/YouTube/GitHub
- Get system stats (CPU, RAM, Disk)
- List running processes
- Hindi/Hinglish command parsing
- Volume control (on Mac/Linux/Windows)
- Take screenshots (on desktop systems)
- Natural language detection

### ⚠️ Limited (Headless Container)
- Screenshot: Needs X11 display (works on desktop systems)
- Volume: Needs system commands (works on Windows/Mac/Linux locally)
- App launching: Only web apps work in container

---

## Architecture

```
User Input
    ↓
┌─────────────────────────────┐
│  Command Parser (40+ patterns)
└─────────────┬───────────────┘
              ↓
         Is OS Command?
         ↙           ↘
       YES            NO
        ↓              ↓
   ┌─────────┐   ┌──────────┐
   │OS Engine│   │ Groq LLM │
   └────┬────┘   └──────────┘
        ↓              ↓
     Execute      Generate
        ↓              ↓
   ┌──────────────────────┐
   │  Format Response     │
   │  - reply             │
   │  - action (type)     │
   │  - result (data)     │
   │  - screenshot (b64)  │
   └──────────┬───────────┘
              ↓
          API Response
              ↓
         ┌─────────────┐
         │ Frontend    │
         │ - Display   │
         │ - Render    │
         │ - Animate   │
         └─────────────┘
```

---

## Key Files

| Path | Purpose |
|------|---------|
| `agents/os_engine.py` | Core OS control (16 methods) |
| `agents/command_parser.py` | NLP pattern matching (40+ patterns) |
| `agents/master_orchestrator.py` | Route orchestration |
| `routers/orchestrator.py` | API endpoints |
| `src/hooks/useOrchestrator.ts` | Frontend action handling |
| `src/components/MessageBubble.tsx` | Screenshot display |
| `src/types/message.types.ts` | Type definitions |

---

## Supported Commands

### Opening Apps
- "open youtube" → Opens YouTube
- "launch vscode" → Launches VS Code
- "start spotify" → Opens Spotify
- "youtube kholo" (Hindi) → Opens YouTube

### Search
- "search python on youtube"
- "find AI news on google"
- "look up docker tutorials"

### System Control
- "take a screenshot"
- "system info"
- "running apps"
- "set volume to 50"
- "close spotify"

### File Management
- "open folder /home/user/documents"
- "list files in /home/user"

---

## Troubleshooting

### Backend not responding?
```bash
# Check if running
pgrep -f uvicorn

# Check logs
tail -f /tmp/jarvis.log

# Restart
pkill -f uvicorn
cd artifacts/jarvis-api && python main.py
```

### Frontend build issues?
```bash
cd artifacts/edith
npm install
npm run dev
```

### API returning errors?
- Check GROQ_API_KEY is set
- Verify network connectivity
- Check backend logs for details

---

## Performance Notes

- **OS commands**: <50ms (no LLM)
- **LLM commands**: ~1-3s (Groq API)
- **Screenshot**: ~200ms (capture + encode)
- **System info**: <100ms

---

## Future Enhancements

1. Desktop control UI overlays
2. Scheduled task support
3. Custom macro recording
4. Clipboard integration
5. Window management
6. Real-time screen sharing

---

**For issues, check**: `/workspaces/EDITH2.0/IMPLEMENTATION_REPORT.md`
