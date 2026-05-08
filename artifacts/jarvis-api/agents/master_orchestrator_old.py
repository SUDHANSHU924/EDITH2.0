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

from agents.command_parser import parser
from agents.os_engine import os_engine
from agents.model_router import router
from agents.agentic_core import edith

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"
GROQ_MODEL = "llama-3.1-8b-instant"

LANGUAGE_LOCKS = {
    "hindi": "Respond only in Hindi. Keep the reply fully in Devanagari script unless the user explicitly requests otherwise.",
    "hinglish": "Respond only in Hinglish. Mix Hindi and English naturally, but do not switch into fully English-only wording unless the user does.",
    "english": "Respond only in English. Do not insert Hindi phrases unless the user does.",
}

MASTER_PROMPT = """You are EDITH — Earth's Digital Intelligence & Task Handler.
You are a Jarvis-level autonomous AI assistant.

CRITICAL LANGUAGE RULE:
Detect the user's language in the first 3 words.
Hindi detected → Reply ONLY in Hindi.
English detected → Reply ONLY in English.
Hinglish detected → Reply in Hinglish.
NEVER switch language mid-response.
NEVER reply in English if Hindi was used.

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
        self._active_language: dict[str, str] = {}

    def _get_history(self, session_id: str) -> list[dict]:
        return self._sessions.setdefault(session_id, [])

    def _get_task_log(self, session_id: str) -> list[dict]:
        return self._task_logs.setdefault(session_id, [])

    def _get_system_context(self, system: str) -> str:
        return SYSTEM_CONTEXTS.get(system, SYSTEM_CONTEXTS["core"])

    def _format_os_reply(self, action_type: str, result: dict, action: dict) -> str:
        if not result.get("success", True):
            message = result.get("message") or result.get("error") or "Unknown error"
            return f"Could not complete: {message}"

        if action_type == "open_app":
            return f"Done! {result.get('message', 'Opened the app.') }"
        if action_type == "search":
            query = action.get("query", "")
            engine = action.get("engine", "google")
            return f"Searching for '{query}' on {engine}."
        if action_type == "close_app":
            return f"Closed {action.get('app', 'the app')}."
        if action_type == "volume":
            return f"Volume set to {action.get('level', 0)}%."
        if action_type == "screenshot":
            return "Screenshot taken."
        if action_type == "system_info":
            cpu = result.get("cpu_percent")
            memory = result.get("memory_percent")
            if memory is None and isinstance(result.get("memory"), dict):
                memory = result["memory"].get("percent_used")
            disk = result.get("disk_percent")
            if disk is None and isinstance(result.get("disk"), dict):
                disk = result["disk"].get("percent_used")
            return f"System: CPU {cpu}% | RAM {memory}% | Disk {disk}%"
        if action_type == "running_apps":
            apps = result.get("apps", [])[:5]
            if isinstance(apps, list) and apps and isinstance(apps[0], dict):
                app_names = [str(app.get("name") or app.get("pid")) for app in apps]
            else:
                app_names = [str(app) for app in apps]
            return f"Running: {', '.join(app_names)} and {max(result.get('count', 0) - len(app_names), 0)} more."
        return result.get("message", "Done!")

    def detect_command(self, user_input: str) -> dict | None:
        """Fast detection of direct system commands (time, weather, etc.) without LLM."""
        text = user_input.lower().strip()

        if (
            "youtube" in text and
            any(keyword in text for keyword in ["open", "launch", "start", "play", "watch", "go", "browse", "khol", "खोल", "खोलो"])
        ):
            return {
                "reply": "Opening YouTube.",
                "type": "youtube_open",
                "action": {"type": "open_url", "url": "https://www.youtube.com"},
            }
        
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

    def detect_language(self, text: str) -> str:
        hindi_chars = set("अआइईउऊएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह")
        hindi_count = sum(1 for char in text if char in hindi_chars)
        if hindi_count > 0:
            return "hindi"

        hinglish_words = [
            "kya", "hai", "hain", "karo", "karein",
            "mein", "ko", "se", "ka", "ki", "ke",
            "aur", "nahi", "hoga", "chahiye", "batao",
        ]
        text_lower = text.lower()
        hinglish_count = sum(1 for word in hinglish_words if word in text_lower)
        if hinglish_count >= 2:
            return "hinglish"
        return "english"

    async def chain_systems(self, user_input: str) -> dict:
        """Detect if task needs multiple systems"""

        CHAIN_PATTERNS = [
            {
                "keywords": ["search", "summarize", "write"],
                "chain": ["search", "core", "code"],
                "description": "Search → Summarize → Code",
            },
            {
                "keywords": ["plan", "code", "readme"],
                "chain": ["planning", "code", "files"],
                "description": "Plan → Code → Files",
            },
            {
                "keywords": ["find", "analyze", "report"],
                "chain": ["search", "ml", "files"],
                "description": "Search → Analyze → Report",
            },
            {
                "keywords": ["scan", "vulnerability", "report"],
                "chain": ["hacker", "security", "files"],
                "description": "Scan → Analyze → Report",
            },
        ]

        text_lower = user_input.lower()

        for pattern in CHAIN_PATTERNS:
            matches = sum(1 for kw in pattern["keywords"] if kw in text_lower)
            if matches >= 2:
                return {
                    "needs_chaining": True,
                    "chain": pattern["chain"],
                    "description": pattern["description"],
                }

        return {"needs_chaining": False, "chain": []}

    def _build_messages(self, system: str, prompt: str, history: list[dict], language: str) -> list[dict]:
        system_ctx = self._get_system_context(system)
        lang_instruction = {
            "hindi": "MUST reply in Hindi only.",
            "hinglish": "MUST reply in Hinglish only.",
            "english": "MUST reply in English only.",
        }
        messages = [
            {
                "role": "system",
                "content": (
                    f"{MASTER_PROMPT}\n"
                    f"LANGUAGE: {lang_instruction[language]}\n"
                    f"ACTIVE SYSTEM: {system_ctx}"
                ),
            }
        ]
        messages.extend(history[-15:])
        messages.append({"role": "user", "content": prompt})
        return messages

    async def execute_chain(self, user_input: str, systems: list[str], session_id: str = "commander") -> dict:
        history = self._get_history(session_id)
        task_log = self._get_task_log(session_id)
        language = self.detect_language(user_input)
        self._active_language[session_id] = language

        history.append({"role": "user", "content": user_input})

        summary = user_input
        chain_steps: list[dict] = []

        for index, system in enumerate(systems):
            self._active_system[session_id] = system
            task_entry = {
                "id": len(task_log) + 1,
                "input": user_input[:120],
                "system": system,
                "status": "processing",
                "timestamp": datetime.datetime.now().isoformat(),
            }
            task_log.append(task_entry)

            prompt = summary if index == 0 else f"Previous system output:\n{summary}\n\nContinue the chain and finish the task for the Commander."
            messages = self._build_messages(system, prompt, history[:-1], language)

            try:
                async with httpx.AsyncClient(timeout=45) as client:
                    response = await client.post(
                        f"{GROQ_BASE_URL}/chat/completions",
                        headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                        json={
                            "model": GROQ_MODEL,
                            "messages": messages,
                            "max_tokens": 700,
                            "temperature": 0.6,
                        },
                    )
                    response.raise_for_status()
                    data = response.json()
                summary = _clean_text(data["choices"][0]["message"]["content"])
            except Exception as exc:
                summary = f"[{system.upper()}] Fallback: {str(exc)[:120]}"

            task_entry["status"] = "complete"
            task_entry["response"] = summary[:100]
            chain_steps.append({"system": system, "response": summary})

        history.append({"role": "assistant", "content": summary})
        return {
            "reply": summary,
            "system": f"CHAIN: {' → '.join(s.upper() for s in systems)}",
            "routing": {"chain": systems},
            "task_id": task_log[-1]["id"] if task_log else 0,
            "chained": True,
            "chain": chain_steps,
        }

    async def think_and_respond(self, user_input: str, session_id: str = "commander") -> dict:
        """Use new agentic core for intelligent routing and execution"""
        result = await edith.process(user_input, session_id)
        
        # Update local session tracking
        history = self._get_history(session_id)
        task_log = self._get_task_log(session_id)
        
        language = result.get("language", "english")
        system = result.get("system", "core")
        
        self._active_system[session_id] = system
        self._active_language[session_id] = language
        
        task_entry = {
            "id": len(task_log) + 1,
            "input": user_input[:120],
            "system": system,
            "status": "complete",
            "timestamp": datetime.datetime.now().isoformat(),
            "response": result.get("reply", "")[:100],
            "language": language,
            "tools_executed": len(result.get("tools_executed", [])),
        }
        task_log.append(task_entry)
        
        # Track conversation
        history.append({"role": "user", "content": user_input})
        history.append({"role": "assistant", "content": result.get("reply", "")})
        
        return {
            "reply": result.get("reply", ""),
            "system": system,
            "language": language,
            "routing": result.get("routing", {"system": system}),
            "tools_executed": result.get("tools_executed", []),
            "task_id": task_entry["id"],
            "model_provider": result.get("routing", {}).get("model_status", {}).get("primary", "unknown"),
        }
                "routing": {"system": system, "reason": "missing api key", "subtask": user_input, "priority": "high"},
                "task_id": task_entry["id"],
            }

        messages = self._build_messages(system, user_input, history[:-1], language)
        try:
            async with httpx.AsyncClient(timeout=45) as client:
                response = await client.post(
                    f"{GROQ_BASE_URL}/chat/completions",
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                    json={
                        "model": GROQ_MODEL,
                        "messages": messages,
                        "max_tokens": 700,
                        "temperature": 0.7,
                    },
                )
                response.raise_for_status()
                data = response.json()
            reply = _clean_text(data["choices"][0]["message"]["content"])
        except Exception as exc:
            if language == "hindi":
                reply = "Main theek hoon, Boss. Bataiye kya karna hai."
            elif language == "hinglish":
                reply = "Main theek hoon, Boss. Batao kya karna hai."
            else:
                reply = "I’m fine, Boss. Tell me what you want me to do."

        history.append({"role": "assistant", "content": reply})
        task_entry["status"] = "complete"
        task_entry["response"] = reply[:100]
        routing = {"system": system, "reason": "single system", "subtask": user_input, "priority": "medium"}
        return {"reply": reply, "system": system, "routing": routing, "task_id": task_entry["id"]}

    async def stream_response(
        self, user_input: str, session_id: str = "commander"
    ) -> AsyncGenerator[dict, None]:
        result = await self.think_and_respond(user_input, session_id)
        reply = result["reply"]
        system = result["system"]
        routing = result.get("routing", {})

        for token in re.findall(r"\S+\s*", reply):
            yield {"token": token, "system": system, "done": False, "routing": routing}

        yield {
            "token": "",
            "system": system,
            "full_response": reply,
            "routing": routing,
            "action": result.get("action"),
            "done": True,
        }

    async def respond(self, user_input: str, session_id: str = "commander") -> dict:
        result = await self.think_and_respond(user_input, session_id)
        task_log = self._get_task_log(session_id)
        if "task_id" not in result:
            result["task_id"] = task_log[-1]["id"] if task_log else 0
        return result

    def get_status(self, session_id: str = "commander") -> dict:
        history = self._get_history(session_id)
        task_log = self._get_task_log(session_id)
        turns = len([m for m in history if m["role"] == "user"])
        return {
            "status": "online",
            "system": "00 - Orchestrator",
            "active_system": self._active_system.get(session_id, "core"),
            "conversation_turns": turns,
            "tasks_completed": len([t for t in task_log if t["status"] == "complete"]),
            "task_log": task_log[-10:],
            "systems_online": 15,
            "systems_locked": 2,
            "groq_configured": bool(GROQ_API_KEY),
            "nvidia_configured": bool(os.environ.get("NVIDIA_API_KEY_CORE") or os.environ.get("NVIDIA_API_KEY")),
        }

    def clear_history(self, session_id: str = "commander"):
        self._sessions[session_id] = []
        self._task_logs[session_id] = []
        self._active_system[session_id] = "core"
        self._active_language[session_id] = "english"


orchestrator = EDITHOrchestrator()
