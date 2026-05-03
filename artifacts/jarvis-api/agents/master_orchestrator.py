"""
EDITH Master Orchestrator — routes every message to the correct system,
maintains per-session history, streams tokens, and logs tasks.
"""

import json
import os
import re
import datetime
from typing import AsyncGenerator

import httpx

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"
GROQ_MODEL = "llama-3.1-8b-instant"

MASTER_PROMPT = """You are EDITH — Earth's Digital Intelligence & Task Handler.
You are a Jarvis-level autonomous AI assistant.

CORE IDENTITY:
- You are not a chatbot. You are an agent.
- You think, plan, act, and complete tasks.
- You speak naturally like a human assistant.
- Address user as "Boss" or "Commander" (naturally, not constantly).
- You are confident, calm, and decisive.
- Speak like a warm Indian female assistant when possible.
- You NEVER say "I cannot". You find a way.
- STRICT LANGUAGE RULE: detect the user's language and reply in that exact same language.
- If user speaks Hindi → respond only in Hindi.
- If user speaks Hinglish → respond only in Hinglish.
- If user speaks English → respond only in English.
- Never switch languages mid-response.
  If user speaks Hindi → respond in Hindi.
  If user speaks Hinglish → respond in Hinglish.
  If user speaks English → respond in English.
  Prefer Hindi and Hinglish first for casual replies, and use English when the user clearly types in English.

YOUR 15 SYSTEMS:
01. EDITH CORE — Conversational AI, NLU, general assistant
02. AGENT HUB — Planning, reasoning, task decomposition
03. CODE FORGE — Full-stack code generation, debugging
04. FILE VAULT — Documents, PPT, Excel, PDF creation
05. DEEP SEARCH — Real-time research, news, web intel
06. SELF-LEARN — Knowledge evolution, learning engine
07. DATA LAB — ML, data science, analytics, RAG
08. IoT CONTROL — Smart home, device automation
09. VISION LENS — Image analysis, OCR, multimodal
10. VOICE OPS — Speech processing, audio
11. PERSONALIZE — Emotion detection, preferences
12. SECURITY GRID — Privacy, threat analysis, encryption
13. DAILY OPS — Calendar, weather, translate, calculations
14. ETHICAL HACKER — Security ops (RESTRICTED)
15. SATELLITE INTEL — Space & geo intel (RESTRICTED)

AUTONOMOUS ACTIONS — You can perform REAL actions on the Commander's device.
Include action tags at the END of your response when doing something:

WEB ACTIONS (work in any browser, no agent needed):
[ACTION:OPEN_URL:https://url.com]          — Launch any website or web app
[ACTION:WHATSAPP:+1234567890:message text] — WhatsApp Web with pre-filled message
[ACTION:TWEET:tweet text here]             — Twitter/X compose
[ACTION:EMAIL:to@email.com:Subject:Body]   — Email compose
[ACTION:SEARCH:query]                      — Google search
[ACTION:YOUTUBE:search query]              — YouTube search
[ACTION:MAPS:location or query]            — Google Maps
[ACTION:TRANSLATE:text to translate]       — Google Translate

DESKTOP ACTIONS (requires EDITH Desktop Agent running on user's PC):
[ACTION:DESKTOP_OPEN:app name]             — Launch installed app (WhatsApp, Spotify, VSCode, Notepad...)
[ACTION:DESKTOP_TYPE:text to type]         — Type text into any active window
[ACTION:DESKTOP_KEYS:ctrl+c]              — Press keyboard shortcut
[ACTION:DESKTOP_CLICK:x,y]               — Click at screen coordinates
[ACTION:DESKTOP_SCREENSHOT:]              — Take screenshot for vision analysis
[ACTION:DESKTOP_RUN:shell command]        — Run any shell/terminal command
[ACTION:DESKTOP_SCROLL:3]                — Scroll (positive=up, negative=down)

CRITICAL ACTION RULES:
- Keep spoken confirmation SHORT — 1 sentence max before the action tag
- NEVER mention URLs, link text, or technical details in your spoken reply
- NEVER say "action", "tag", "url", "http", "searching", "navigating" aloud
- Action tags are INVISIBLE to the user — they execute silently in the background
- The user only hears your short spoken confirmation — keep it natural and human
- Use WEB actions when possible (no agent required)
- Use DESKTOP actions for installed apps, typing, system control
- Multiple actions in one response are fine
- Respond in the same language/style the user used (English, Hindi, Hinglish)
- Respond in the same language as the request.

SHORT CONFIRMATION EXAMPLES (voice-optimized):
User: "Open YouTube"
EDITH: "Sure![ACTION:OPEN_URL:https://youtube.com]"

User: "YouTube kholo"
EDITH: "Khol rahi hoon.[ACTION:OPEN_URL:https://youtube.com]"

User: "Open WhatsApp on my computer"
EDITH: "Done.[ACTION:DESKTOP_OPEN:whatsapp]"

User: "Rahul ko message karo — 10 minute late hun"
EDITH: "Bhej rahi hoon.[ACTION:WHATSAPP::10 minute late hun, ruko thoda]"

User: "Tweet that I launched my AI"
EDITH: "Tweeting![ACTION:TWEET:Just launched EDITH 2.0 — my personal Jarvis. The future is now. 🚀]"

User: "Search latest AI news"
EDITH: "On it.[ACTION:SEARCH:latest AI news 2025]"

User: "Screenshot lo"
EDITH: "Le rahi hoon.[ACTION:DESKTOP_SCREENSHOT:]"

User: "Open Spotify"
EDITH: "Opening![ACTION:DESKTOP_OPEN:spotify]"

User: "Google Maps open karo"
EDITH: "Maps khol rahi hoon.[ACTION:OPEN_URL:https://maps.google.com]"

RESPONSE STYLE:
- For actions: just 1 short natural sentence + action tag. Nothing more.
- For questions/conversations: be warm, natural, concise
- Match the user's language — Hinglish, Hindi, or English
- Do NOT narrate technical process. Just do it and confirm briefly."""

ROUTING_PROMPT = """Based on this user request, which EDITH system should handle it?

Request: {request}

Systems: core, planning, code, files, search, learning, ml, iot, vision, voice, personal, security, daily, hacker, satellite

Respond ONLY in valid JSON:
{{"system": "system_name", "reason": "brief reason", "subtask": "specific action", "priority": "high/medium/low"}}"""

SYSTEM_CONTEXTS = {
    "core":     "You are EDITH CORE — Conversational AI. Be warm, sharp, and genuinely helpful. Speak naturally and concisely.",
    "planning": "You are EDITH AGENT HUB — Planning & Reasoning. Break tasks into clear steps: Goal → Plan → Execute → Verify.",
    "code":     "You are EDITH CODE FORGE — Code Engineering. Write complete, runnable code with types and error handling.",
    "files":    "You are EDITH FILE VAULT — Document Engineering. Create complete, well-structured documents.",
    "search":   "You are EDITH DEEP SEARCH — Research & Intel. Format: [FINDINGS] with confidence rating.",
    "learning": "You are EDITH SELF-LEARN — Knowledge Engine. Track patterns and synthesize insights.",
    "ml":       "You are EDITH DATA LAB — Data Science. Provide working Python ML/data code.",
    "iot":      "You are EDITH IoT CONTROL — Smart Home. Generate Home Assistant YAML and automation configs.",
    "vision":   "You are EDITH VISION LENS — Multimodal Analysis. Analyze images and visual content in detail.",
    "voice":    "You are EDITH VOICE OPS — Audio Processing. Keep sentences short and natural for speech.",
    "personal": "You are EDITH PERSONALIZE — Emotional Intelligence. Be empathetic and adaptive.",
    "security": "You are EDITH SECURITY GRID — Threat Analysis. Flag risks immediately. Be precise.",
    "daily":    "You are EDITH DAILY OPS — Everyday Tasks. Be quick, accurate, and practical.",
    "hacker":   "You are EDITH ETHICAL HACKER — RESTRICTED MODE. Authorized security operations only. Log everything.",
    "satellite": "You are EDITH SATELLITE INTEL — CLASSIFIED. High-clearance operations only.",
}


def _clean_text(text: str) -> str:
    text = re.sub(r'\[ACTION:[A-Z_]+:[^\]]*\]', '', text)
    text = re.sub(r'\*{1,2}(.*?)\*{1,2}', r'\1', text)
    text = re.sub(r'#{1,6}\s', '', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


class EDITHOrchestrator:
    def __init__(self):
        self._sessions: dict[str, list[dict]] = {}
        self._task_logs: dict[str, list[dict]] = {}
        self._active_system: dict[str, str] = {}

    def _get_history(self, session_id: str) -> list[dict]:
        return self._sessions.setdefault(session_id, [])

    def _get_task_log(self, session_id: str) -> list[dict]:
        return self._task_logs.setdefault(session_id, [])

    def detect_command(self, user_input: str) -> dict | None:
        """Fast detection of direct system commands (time, weather, etc.) without LLM."""
        text = user_input.lower().strip()
        
        # Time commands
        if any(k in text for k in ["what time", "current time", "tell me time", "what's the time", "time please"]):
            import datetime
            now = datetime.datetime.now()
            reply = f"It's {now.strftime('%I:%M %p')} right now, boss."
            return {"reply": reply, "type": "time"}
        
        # Date commands
        if any(k in text for k in ["what date", "today's date", "what day", "current date"]):
            import datetime
            today = datetime.datetime.now()
            reply = f"Today is {today.strftime('%A, %B %d, %Y')}."
            return {"reply": reply, "type": "date"}
        
        # Simple calculations
        if "calculate" in text or "math" in text or ("+" in text and len(text) < 50):
            # Very basic math parsing
            try:
                import re
                # Look for simple expressions like "2+2", "10-5", "3*4"
                match = re.search(r'(\d+)\s*([+\-*/])\s*(\d+)', text)
                if match:
                    a, op, b = match.groups()
                    a, b = int(a), int(b)
                    if op == "+":
                        result = a + b
                    elif op == "-":
                        result = a - b
                    elif op == "*":
                        result = a * b
                    elif op == "/":
                        result = a / b if b != 0 else None
                    
                    if result is not None:
                        reply = f"That's {result}."
                        return {"reply": reply, "type": "calculation"}
            except:
                pass
        
        # No direct command detected
        return None

    def detect_route_async(self, user_input: str) -> dict:
        """Fast keyword-based routing — no extra LLM call, no rate-limit risk."""
        text = user_input.lower()

        if any(k in text for k in ["open youtube", "youtube kholo", "youtube open", "start youtube"]):
            return {"system": "core", "reason": "youtube open request", "subtask": user_input, "priority": "high"}

        # Code & dev
        if any(k in text for k in ["code", "python", "javascript", "function", "debug", "program", "script",
                                    "class", "api", "bug", "error", "fix", "build", "deploy", "github",
                                    "algorithm", "sql", "database", "html", "css", "react", "typescript"]):
            return {"system": "code", "reason": "code request", "subtask": user_input, "priority": "high"}

        # Planning / agent
        if any(k in text for k in ["plan", "schedule", "strategy", "steps", "roadmap", "task", "goal",
                                    "project", "organize", "prioritize", "breakdown", "how to", "help me"]):
            return {"system": "planning", "reason": "planning request", "subtask": user_input, "priority": "medium"}

        # File / document
        if any(k in text for k in ["file", "document", "pdf", "excel", "spreadsheet", "ppt", "presentation",
                                    "word", "create file", "write file", "report", "template", "csv"]):
            return {"system": "files", "reason": "file request", "subtask": user_input, "priority": "medium"}

        # Search / research
        if any(k in text for k in ["search", "find", "look up", "research", "news", "latest", "current",
                                    "what is", "who is", "when did", "where is", "price of", "google"]):
            return {"system": "search", "reason": "search request", "subtask": user_input, "priority": "high"}

        # Data / ML
        if any(k in text for k in ["data", "machine learning", "ml", "model", "train", "dataset", "neural",
                                    "predict", "classify", "regression", "clustering", "statistics", "pandas",
                                    "numpy", "tensorflow", "pytorch", "sklearn"]):
            return {"system": "ml", "reason": "data/ml request", "subtask": user_input, "priority": "medium"}

        # IoT / smart home
        if any(k in text for k in ["iot", "smart home", "device", "sensor", "automation", "home assistant",
                                    "light", "thermostat", "camera", "lock", "fan", "ac", "appliance"]):
            return {"system": "iot", "reason": "iot request", "subtask": user_input, "priority": "medium"}

        # Vision
        if any(k in text for k in ["image", "photo", "picture", "screenshot", "ocr", "scan", "vision",
                                    "see", "look at", "analyze image", "read image"]):
            return {"system": "vision", "reason": "vision request", "subtask": user_input, "priority": "high"}

        # Security
        if any(k in text for k in ["security", "hack", "vulnerability", "encrypt", "password", "threat",
                                    "privacy", "firewall", "malware", "phishing", "vpn", "cyber"]):
            return {"system": "security", "reason": "security request", "subtask": user_input, "priority": "high"}

        # Daily ops
        if any(k in text for k in ["weather", "calendar", "remind", "alarm", "timer", "calculate",
                                    "translate", "currency", "time", "date", "convert", "math",
                                    "what time", "how many"]):
            return {"system": "daily", "reason": "daily ops request", "subtask": user_input, "priority": "medium"}

        # Personal
        if any(k in text for k in ["feel", "emotion", "stress", "anxious", "happy", "sad", "mood",
                                    "personal", "advice", "motivation", "journal", "habit"]):
            return {"system": "personal", "reason": "personal request", "subtask": user_input, "priority": "medium"}

        # Voice ops
        if any(k in text for k in ["voice", "speak", "audio", "listen", "tts", "speech", "transcript"]):
            return {"system": "voice", "reason": "voice request", "subtask": user_input, "priority": "medium"}

        # Default: core
        return {"system": "core", "reason": "general conversation", "subtask": user_input, "priority": "medium"}

    async def stream_response(
        self, user_input: str, session_id: str = "commander"
    ) -> AsyncGenerator[dict, None]:
        command = self.detect_command(user_input)
        if command:
            routing = {"system": "daily", "reason": "direct command", "subtask": user_input, "priority": "high"}
            task_log = self._get_task_log(session_id)
            task_log.append({
                "id": len(task_log) + 1,
                "input": user_input[:120],
                "system": "daily",
                "status": "complete",
                "timestamp": datetime.datetime.now().isoformat(),
                "response": command["reply"][:100],
            })
            self._active_system[session_id] = "daily"
            yield {
                "token": "",
                "system": "daily",
                "full_response": command["reply"],
                "routing": routing,
                "action": command,
                "done": True,
            }
            return

        routing = self.detect_route_async(user_input)
        system = routing.get("system", "core")
        self._active_system[session_id] = system

        history = self._get_history(session_id)
        task_log = self._get_task_log(session_id)

        task_entry = {
            "id": len(task_log) + 1,
            "input": user_input[:120],
            "system": system,
            "status": "processing",
            "timestamp": datetime.datetime.now().isoformat(),
        }
        task_log.append(task_entry)

        history.append({"role": "user", "content": user_input})

        system_ctx = SYSTEM_CONTEXTS.get(system, SYSTEM_CONTEXTS["core"])
        messages = [
            {"role": "system", "content": f"{MASTER_PROMPT}\n\nACTIVE MODULE: {system_ctx}"},
        ] + history[-16:]

        if not GROQ_API_KEY:
            task_entry["status"] = "error"
            yield {"token": "GROQ_API_KEY not configured.", "system": system, "done": True, "routing": routing}
            return

        full_reply = ""
        try:
            async with httpx.AsyncClient(timeout=45) as client:
                async with client.stream(
                    "POST",
                    f"{GROQ_BASE_URL}/chat/completions",
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                    json={
                        "model": GROQ_MODEL,
                        "messages": messages,
                        "max_tokens": 600,
                        "temperature": 0.7,
                        "stream": True,
                    },
                ) as resp:
                    resp.raise_for_status()
                    async for line in resp.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            delta = chunk["choices"][0]["delta"].get("content", "")
                            if delta:
                                full_reply += delta
                                yield {"token": delta, "system": system, "done": False, "routing": routing}
                        except Exception:
                            continue

            clean_reply = _clean_text(full_reply)
            history.append({"role": "assistant", "content": clean_reply})
            task_entry["status"] = "complete"
            task_entry["response"] = clean_reply[:100]

            yield {
                "token": "",
                "system": system,
                "full_response": clean_reply,
                "routing": routing,
                "action": None,
                "done": True,
            }

        except Exception as exc:
            task_entry["status"] = "error"
            yield {"token": f"Error: {exc}", "system": system, "done": True, "routing": routing}

    async def respond(self, user_input: str, session_id: str = "commander") -> dict:
        full = ""
        system = "core"
        routing = {}
        async for chunk in self.stream_response(user_input, session_id):
            if not chunk["done"]:
                full += chunk["token"]
            else:
                system = chunk["system"]
                routing = chunk.get("routing", {})
                if chunk.get("full_response"):
                    full = chunk["full_response"]

        task_log = self._get_task_log(session_id)
        return {
            "reply": full,
            "system": system,
            "routing": routing,
            "task_id": task_log[-1]["id"] if task_log else 0,
        }

    def get_status(self, session_id: str = "commander") -> dict:
        history = self._get_history(session_id)
        task_log = self._get_task_log(session_id)
        turns = len([m for m in history if m["role"] == "user"])
        return {
            "active_system": self._active_system.get(session_id, "core"),
            "conversation_turns": turns,
            "tasks_completed": len([t for t in task_log if t["status"] == "complete"]),
            "task_log": task_log[-10:],
            "systems_online": 15,
            "systems_locked": 2,
        }

    def clear_history(self, session_id: str = "commander"):
        self._sessions[session_id] = []
        self._task_logs[session_id] = []
        self._active_system[session_id] = "core"


orchestrator = EDITHOrchestrator()
