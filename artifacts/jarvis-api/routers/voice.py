"""EDITH Voice Router — Groq Whisper STT + Groq TTS (playai-tts)
Routes: /api/jarvis/voice/transcribe, /api/jarvis/voice/speak, /api/jarvis/voice/status
"""

import asyncio
import io
import os
import re
import tempfile

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel

router = APIRouter()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")


# ── MODELS ───────────────────────────────────────────────────────────────────

class SpeakRequest(BaseModel):
    text: str
    voice: str = "hi-IN-SwaraNeural"


# ── TTS helper (sync, run via to_thread) ─────────────────────────────────────

def _clean_text(text: str) -> str:
    text = re.sub(r'\*{1,2}(.*?)\*{1,2}', r'\1', text)
    text = re.sub(r'#{1,6}\s+', '', text)
    text = re.sub(r'`{1,3}[^`]*`{1,3}', '', text, flags=re.DOTALL)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    text = re.sub(r'^\s*[-*+]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\n+', ' ', text).strip()
    return text[:500]


async def _edge_tts(text: str, voice: str = "hi-IN-SwaraNeural") -> bytes:
    """Microsoft Edge TTS — free, no API key, natural voice."""
    import io
    import edge_tts
    communicate = edge_tts.Communicate(_clean_text(text), voice)
    buf = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            buf.write(chunk["data"])
    return buf.getvalue()


# ── STT: VOICE → TEXT ────────────────────────────────────────────────────────

@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """Convert voice recording to text using Groq Whisper."""
    if not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY not configured")

    ext = "webm"
    if audio.filename:
        parts = audio.filename.rsplit(".", 1)
        if len(parts) == 2:
            ext = parts[1].lower()

    content = await audio.read()
    if not content:
        return {"text": "", "status": "empty_audio"}

    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        import httpx
        with open(tmp_path, "rb") as f:
            audio_bytes = f.read()

        files = {"file": (f"recording.{ext}", audio_bytes, f"audio/{ext}")}
        data = {
            "model": "whisper-large-v3",
            "response_format": "json",
        }
        headers = {"Authorization": f"Bearer {GROQ_API_KEY}"}

        resp = httpx.post(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            headers=headers,
            files=files,
            data=data,
            timeout=30,
        )
        resp.raise_for_status()
        text = resp.json().get("text", "").strip()
        return {"text": text, "status": "success", "model": "whisper-large-v3"}

    except Exception as e:
        return {"text": "", "status": "error", "error": str(e)}

    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass


# ── TTS: TEXT → VOICE ────────────────────────────────────────────────────────

@router.post("/speak")
async def text_to_speech(req: SpeakRequest):
    """Convert text to MP3 audio using Groq TTS (playai-tts / Celeste-PlayAI)."""
    if not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY not configured")
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="No text provided")

    try:
        audio_bytes = await _edge_tts(req.text)
        if not audio_bytes:
            raise HTTPException(status_code=500, detail="TTS returned empty audio")
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=edith.mp3"},
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS error: {e}")


# ── STATUS ───────────────────────────────────────────────────────────────────

@router.get("/status")
async def voice_status():
    return {
        "status": "online",
        "stt": "whisper-large-v3 via Groq" if GROQ_API_KEY else "needs GROQ_API_KEY",
        "tts": "edge-tts (hi-IN-SwaraNeural) — Microsoft Edge",
        "voice": "hi-IN-SwaraNeural",
        "groq_connected": bool(GROQ_API_KEY),
    }
