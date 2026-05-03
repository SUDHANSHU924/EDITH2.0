# E.D.I.T.H. 2.0 — Workspace

## Overview

pnpm workspace monorepo using TypeScript + Python. A Jarvis-like autonomous AI assistant with sci-fi HUD frontend, Node.js/Express chat API, and Python FastAPI OS-control + voice backend.

## Artifacts

| Artifact | Kind | Path | Port |
|---|---|---|---|
| `artifacts/edith` | React+Vite frontend | `/` | `$PORT` (dynamic) |
| `artifacts/api-server` | Node.js/Express API | `/api/*` | `8080` |
| `artifacts/jarvis-api` | Python FastAPI agent + voice | `/api/jarvis/*` | `9000` |
| `artifacts/mockup-sandbox` | Vite component preview | `/__mockup` | `8081` |

## Stack

- **Monorepo**: pnpm workspaces
- **Frontend**: React 19 + Vite + Tailwind v4 + Framer Motion + Wouter
- **Node API**: Express 5 + Groq SDK (streaming SSE)
- **Python Agent**: FastAPI + Uvicorn + ReAct loop via Groq HTTP + edge-tts TTS
- **State**: Zustand (chatStore with per-department message slices)
- **TypeScript**: 5.9, **Python**: 3.11

## Key Environment Variables / Secrets

| Key | Where used | Notes |
|---|---|---|
| `GROQ_API_KEY` | api-server + jarvis-api | Chat, agent, Whisper STT, auto self-upgrade |
| `NVIDIA_API_KEY_CORE` | api-server | NVIDIA LLaMA 70B for core module + self-upgrade engine |
| `NVIDIA_API_KEY_*` | api-server | One per department (15 total) |

## Architecture

```
Browser
  └─ React (Vite, port $PORT)
       ├─ /api/orchestrator/ws   → api-server :8080 → jarvis-api :9000  ← MASTER ORCHESTRATOR (WebSocket, streaming)
       ├─ /api/orchestrator/voice  → jarvis-api :9000  (STT→LLM→TTS pipeline)
       ├─ /api/orchestrator/status → jarvis-api :9000  (polls every 6s)
       ├─ /api/desktop/status    → jarvis-api :9000  (desktop agent status, polls every 4s)
       ├─ /api/desktop/command   → jarvis-api :9000  (send action to desktop agent)
       ├─ /api/desktop/ws        → jarvis-api :9000  (desktop agent WebSocket relay)
       ├─ /api/desktop/download-agent → jarvis-api :9000 (downloads edith_desktop_agent.py)
       ├─ /api/edith/chat        → api-server :8080  → NVIDIA/Groq streaming SSE (dept routes)
       ├─ /api/edith/greet       → api-server :8080  → EDITH Jarvis boot greeting
       └─ /api/jarvis/*          → jarvis-api :9000  → Groq ReAct agent
```

## Key Files

- `artifacts/edith/src/App.tsx` — routing, OrbitSidebar, commander layout, AlwaysOnIndicator
- `artifacts/edith/src/components/CommandInput.tsx` — voice mic, auto-speak toggle, camera
- `artifacts/edith/src/components/PeripherySidebar.tsx` — 15 department panels + DesktopAgentPanel
- `artifacts/edith/src/components/AlwaysOnIndicator.tsx` — always-on listening, auto-starts when mic granted
- `artifacts/edith/src/components/DesktopAgentPanel.tsx` — desktop agent status + setup panel (in sidebar)
- `artifacts/edith/src/components/JarvisPanel.tsx` — OS control ReAct UI + self-upgrade panel
- `artifacts/edith/src/hooks/useAlwaysOn.ts` — VAD, echo prevention, sends to /api/orchestrator/voice
- `artifacts/edith/src/lib/actions.ts` — web + desktop action parser/executor
- `artifacts/jarvis-api/routers/desktop.py` — WebSocket relay, /status, /command, /download-agent
- `artifacts/jarvis-api/desktop_agent.py` — downloadable Python desktop control script
- `artifacts/jarvis-api/agents/master_orchestrator.py` — MASTER_PROMPT with WEB + DESKTOP actions

## Always-On Listening

- `AlwaysOnIndicator` auto-starts on mount if mic permission is already `granted`
- Falls back to localStorage preference if Permissions API not available
- Stores preference: `localStorage('edith-always-on')`
- VAD (volume threshold) + echo prevention (suppresses capture during EDITH speech)
- No button press required once enabled

## Desktop Control System

EDITH can control the user's actual machine via a local Python agent:

1. User downloads `edith_desktop_agent.py` from `/api/desktop/download-agent`
2. Runs: `pip install websockets pyautogui pillow && python edith_desktop_agent.py --url wss://URL/api/desktop/ws`
3. Agent connects via WebSocket to backend relay
4. EDITH sends `[ACTION:DESKTOP_OPEN:whatsapp]` etc. → stripped from text, relayed to agent

**Desktop action tags** (in MASTER_PROMPT):
- `[ACTION:DESKTOP_OPEN:app name]` — launch installed app
- `[ACTION:DESKTOP_TYPE:text]` — type into active window
- `[ACTION:DESKTOP_KEYS:ctrl+c]` — keyboard shortcuts
- `[ACTION:DESKTOP_CLICK:x,y]` — mouse click
- `[ACTION:DESKTOP_SCREENSHOT:]` — screenshot
- `[ACTION:DESKTOP_RUN:command]` — shell command
- `[ACTION:DESKTOP_SCROLL:3]` — scroll

**Web action tags** (browser-native, no agent):
- `[ACTION:OPEN_URL:https://...]` — open website
- `[ACTION:WHATSAPP:phone:msg]` — WhatsApp Web
- `[ACTION:TWEET:text]` — Twitter/X compose
- `[ACTION:EMAIL:to:subject:body]`
- `[ACTION:SEARCH:query]`, `[ACTION:YOUTUBE:...]`, `[ACTION:MAPS:...]`, `[ACTION:TRANSLATE:...]`

## Voice Pipeline

- **STT**: `POST /api/orchestrator/voice` — uploads audio → Groq Whisper → LLM → edge-tts TTS
- **Always-On**: VAD-based continuous listening, `useAlwaysOn.ts` hook
- **TTS**: edge-tts via WebSocket `complete` message — single audio path (no double-speak)
- **Fallback**: Browser `SpeechSynthesis` if backend unavailable

## Self-Upgrade System

EDITH automatically upgrades herself **every 15 chat completions**:
1. Tracks call counts per department in `.edith_memory.json`
2. At every 15th call, analyzes usage patterns using NVIDIA LLaMA 70B
3. Generates personality tweak for the most-used department
4. Next chat picks up the improved personality automatically
5. Version bumped (e.g., `2.0.1` → `2.0.2`)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-server run build` — rebuild api-server
- `cd artifacts/jarvis-api && python3 -m uvicorn main:app --reload --port 9000` — run Python agent

## Important Notes

- Zustand chatStore: always select `state.messages` then index by department
- SSE frames from api-server use `{ token: "..." }` format
- NVIDIA API keys return 401 → Groq fallback (`llama-3.3-70b-versatile` + `whisper-large-v3`) works correctly
- gTTS replaced by edge-tts — better quality, no rate limits
- Action tags are stripped from displayed text by `parseAndExecute()` in `useOrchestrator.ts` and `AlwaysOnIndicator.tsx`
- Desktop agent auto-reconnects every 5s if disconnected
