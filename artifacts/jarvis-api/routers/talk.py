"""EDITH Talk Router — /api/talk/*
Conversational agent with Groq TTS voice responses.
"""

import asyncio
import base64
import os
import re

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")


# ── TTS helper ────────────────────────────────────────────────────────────────

def _clean_text(text: str) -> str:
    text = re.sub(r'\*{1,2}(.*?)\*{1,2}', r'\1', text)
    text = re.sub(r'#{1,6}\s+', '', text)
    text = re.sub(r'`{1,3}[^`]*`{1,3}', '', text, flags=re.DOTALL)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    text = re.sub(r'^\s*[-*+]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\n+', ' ', text).strip()
    return text[:500]


async def _tts(text: str) -> bytes:
    """Microsoft Edge TTS — free, no API key, natural voice."""
    try:
        import io
        import edge_tts
        communicate = edge_tts.Communicate(_clean_text(text), "en-IN-NeerjaNeural")
        buf = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                buf.write(chunk["data"])
        return buf.getvalue()
    except Exception as e:
        print(f"[TALK TTS] error: {e}")
        return b""


# ── Models ────────────────────────────────────────────────────────────────────

class TalkRequest(BaseModel):
    text: str
    session_id: str = "commander"
    respond_with_voice: bool = True


class GreetRequest(BaseModel):
    session_id: str = "commander"
    respond_with_voice: bool = True


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/status")
async def talk_status():
    groq_ok = bool(GROQ_API_KEY)
    return {
        "status": "online",
        "agent": "EDITHTalkAgent",
        "tts": "edge-tts (en-IN-NeerjaNeural) — Microsoft Edge",
        "stt": "whisper-large-v3 (Groq)" if groq_ok else "unavailable",
        "groq_connected": groq_ok,
        "voice": "en-IN-NeerjaNeural",
    }


@router.post("/chat")
async def talk_chat(req: TalkRequest):
    """Send text, get EDITH reply + optional voice audio."""
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="No text provided")

    from agents.talk_agent import get_session
    agent = get_session(req.session_id)

    voice_mode = req.respond_with_voice
    reply = await asyncio.to_thread(agent.think, req.text, voice_mode)

    response: dict = {
        "reply": reply,
        "session_id": req.session_id,
    }

    if req.respond_with_voice:
        audio_bytes = await _tts(reply)
        response["audio_base64"] = base64.b64encode(audio_bytes).decode() if audio_bytes else ""
        response["has_audio"] = bool(audio_bytes)

    return response


@router.post("/greet")
async def talk_greet(req: GreetRequest):
    """EDITH boot greeting for a new session."""
    from agents.talk_agent import get_session
    agent = get_session(req.session_id)

    greeting = await asyncio.to_thread(agent.greet)

    response: dict = {
        "reply": greeting,
        "session_id": req.session_id,
    }

    if req.respond_with_voice:
        audio_bytes = await _tts(greeting)
        response["audio_base64"] = base64.b64encode(audio_bytes).decode() if audio_bytes else ""
        response["has_audio"] = bool(audio_bytes)

    return response


@router.delete("/history")
async def talk_clear(session_id: str = "commander"):
    from agents.talk_agent import get_session
    agent = get_session(session_id)
    agent.clear()
    return {"status": "cleared", "session_id": session_id}


@router.get("/history")
async def talk_history(session_id: str = "commander"):
    from agents.talk_agent import get_session
    agent = get_session(session_id)
    return {"session_id": session_id, "history": agent.get_history()}
