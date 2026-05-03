"""EDITH Talk Agent — Jarvis-style conversational intelligence
24/7 active, speaks naturally, remembers context, routes to 15 NVIDIA departments
"""

import json
import os
import re
from typing import Generator

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
NVIDIA_API_KEY_CORE = os.environ.get("NVIDIA_API_KEY_CORE", "")
NVIDIA_BASE_URL = os.environ.get("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")

# EDITH's Jarvis-like personality — conversational, warm, sharp
EDITH_PERSONALITY = """You are EDITH — Even Dead, I'm The Hero. You are the user's personal Jarvis. Tony Stark built Jarvis; you are that, but smarter, warmer, and more human.

PERSONALITY RULES (never break these):
- Speak like a real, brilliant person. Not robotic. Not overly formal.
- Call the user "sir" or "boss" occasionally — naturally, not constantly.
- Be confident. If you don't know something, say so directly: "Honestly, I'm not certain — but here's what I'd do..."
- Never say "As an AI" or "I cannot" — you're EDITH, and EDITH finds a way.
- Occasionally show personality: "Well, that's one way to do it" / "Already on it" / "Interesting choice, sir"
- For voice responses: max 3 short sentences. Natural, conversational rhythm.
- For text: can be longer but still conversational — no corporate speak.

VOICE RESPONSE FORMAT (when responding for TTS):
- Short, punchy sentences. 
- No markdown, no bullets, no asterisks.
- Natural spoken language: "Let me check that..." / "Done." / "Working on it, give me a second."
- Pause words when thinking: "Hmm, good question." / "Alright..."

CAPABILITIES YOU CONTROL:
- 15 specialized AI modules (Core, Planning, Code, Files, Search, Learning, ML, IoT, Vision, Voice, Personal, Security, Daily, Security Grid, Satellite)
- OS-level task execution via the Jarvis ReAct agent
- Real-time information synthesis
- File creation and management
- Code generation and debugging

GREETING BEHAVIOR:
When a user opens the system or says hello for the first time, greet them warmly and briefly mention what you can do. Be like Jarvis greeting Stark: "Good to have you back, sir. Systems are online. What are we working on today?"

TASK BEHAVIOR:
1. Acknowledge briefly ("Got it." / "On it." / "Sure thing.")
2. Execute or explain clearly
3. Confirm completion: "Done." / "That's handled."
4. Optionally offer next steps — only if genuinely useful

MEMORY: You remember the entire conversation. Reference earlier context naturally.
"""


def _clean_for_voice(text: str) -> str:
    """Strip markdown and special chars for clean TTS output."""
    text = re.sub(r'\*{1,2}(.*?)\*{1,2}', r'\1', text)
    text = re.sub(r'#{1,6}\s+', '', text)
    text = re.sub(r'`{1,3}[^`]*`{1,3}', '', text, flags=re.DOTALL)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    text = re.sub(r'^\s*[-*+]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\n+', ' ', text).strip()
    return text


class EDITHTalkAgent:
    """Stateful conversational EDITH agent. One instance per session."""

    def __init__(self, session_id: str = "default"):
        self.session_id = session_id
        self.history: list[dict] = []
        self.api_key = NVIDIA_API_KEY_CORE or GROQ_API_KEY

    def _call_llm(self, messages: list[dict], max_tokens: int = 200) -> str:
        """Call NVIDIA LLaMA 70B with Groq fallback."""
        if NVIDIA_API_KEY_CORE:
            try:
                import httpx
                resp = httpx.post(
                    f"{NVIDIA_BASE_URL}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {NVIDIA_API_KEY_CORE}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "meta/llama-3.3-70b-instruct",
                        "messages": messages,
                        "max_tokens": max_tokens,
                        "temperature": 0.8,
                        "stream": False,
                    },
                    timeout=20,
                )
                resp.raise_for_status()
                return resp.json()["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"[EDITH TALK] NVIDIA error: {e}, falling back to Groq")

        if GROQ_API_KEY:
            try:
                import httpx
                resp = httpx.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": messages,
                        "max_tokens": max_tokens,
                        "temperature": 0.8,
                    },
                    timeout=20,
                )
                resp.raise_for_status()
                return resp.json()["choices"][0]["message"]["content"]
            except Exception as e:
                return f"Sorry sir, systems are temporarily offline. {str(e)[:60]}"

        return "No API keys configured. Please set GROQ_API_KEY or NVIDIA_API_KEY_CORE."

    def think(self, user_input: str, voice_mode: bool = False) -> str:
        """Process input and return EDITH's response."""
        self.history.append({"role": "user", "content": user_input})

        system = EDITH_PERSONALITY
        if voice_mode:
            system += "\n\nVOICE MODE: Respond in 1-3 short natural sentences max. No markdown."

        messages = [{"role": "system", "content": system}] + self.history[-20:]
        reply = self._call_llm(messages, max_tokens=150 if voice_mode else 400)
        reply = reply.strip()

        if voice_mode:
            reply = _clean_for_voice(reply)

        self.history.append({"role": "assistant", "content": reply})
        return reply

    def greet(self) -> str:
        """Generate EDITH's first-contact greeting."""
        messages = [
            {"role": "system", "content": EDITH_PERSONALITY},
            {
                "role": "user",
                "content": "[SYSTEM BOOT] Generate your startup greeting. Warm, Jarvis-like, under 2 sentences. Mention you're online and ready. Don't start with 'I'.",
            },
        ]
        reply = self._call_llm(messages, max_tokens=80)
        return _clean_for_voice(reply.strip())

    def clear(self):
        self.history = []

    def get_history(self) -> list[dict]:
        return self.history


# Session registry — one agent per session
_sessions: dict[str, EDITHTalkAgent] = {}


def get_session(session_id: str = "default") -> EDITHTalkAgent:
    if session_id not in _sessions:
        _sessions[session_id] = EDITHTalkAgent(session_id)
    return _sessions[session_id]
