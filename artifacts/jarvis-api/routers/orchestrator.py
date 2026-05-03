"""
EDITH Orchestrator Router — /api/orchestrator/*
Chat (SSE stream), Voice (STT→LLM→TTS), WebSocket, Status
"""

import asyncio
import base64
import io
import json
import os
import re
import tempfile
import time
from collections import defaultdict

from fastapi import APIRouter, File, HTTPException, UploadFile, WebSocket
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel

router = APIRouter()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

# ── Per-session voice rate limiter ─────────────────────────────────────────────
# Prevents always-on mode from burning Groq quota on ambient noise
_voice_last_call: dict[str, float] = defaultdict(float)
VOICE_COOLDOWN_SECS = 4.0        # min seconds between LLM calls per session
MIN_TRANSCRIPT_WORDS = 3         # ignore transcripts shorter than this


# ── Models ────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    session_id: str = "commander"
    voice_response: bool = False
    language: str = "auto"


# ── TTS helper ────────────────────────────────────────────────────────────────

def _strip_action_tags(text: str) -> str:
    return re.sub(r'\[ACTION:[A-Z_]+:[^\]]*\]', '', text)


def _detect_script(text: str) -> str:
    devanagari = sum(1 for c in text if '\u0900' <= c <= '\u097F')
    return 'hindi' if devanagari > 3 else 'hinglish_or_english'


def _clean_for_tts(text: str) -> str:
    text = _strip_action_tags(text)
    text = re.sub(r'\*{1,2}(.*?)\*{1,2}', r'\1', text)
    text = re.sub(r'#{1,6}\s+', '', text)
    text = re.sub(r'`{1,3}[^`]*`{1,3}', '', text, flags=re.DOTALL)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    text = re.sub(r'https?://\S+', '', text)
    text = re.sub(r'\s{2,}', ' ', text)
    text = re.sub(r'\n+', ' ', text).strip()
    return text[:300]


async def _tts(text: str, lang: str = "auto") -> bytes:
    try:
        import io
        import edge_tts
        clean = _clean_for_tts(text)
        if not clean:
            return b""
        voice = "hi-IN-SwaraNeural"
        communicate = edge_tts.Communicate(clean, voice)
        buf = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                buf.write(chunk["data"])
        return buf.getvalue()
    except Exception as e:
        print(f"[ORC TTS] error: {e}")
        return b""


@router.post("/chat")
async def chat(req: ChatRequest):
    from agents.master_orchestrator import orchestrator
    result = await orchestrator.respond(req.message, req.session_id)
    response: dict = {
        "reply": result["reply"],
        "system": result["system"],
        "routing": result["routing"],
        "task_id": result["task_id"],
    }
    if req.voice_response:
        audio = await _tts(result["reply"])
        response["audio_base64"] = base64.b64encode(audio).decode()
    return response


@router.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    from agents.master_orchestrator import orchestrator

    async def generate():
        async for chunk in orchestrator.stream_response(req.message, req.session_id):
            yield f"data: {json.dumps(chunk)}\n\n"
            await asyncio.sleep(0)

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Access-Control-Allow-Origin": "*"},
    )


@router.post("/voice")
async def voice_pipeline(
    audio: UploadFile = File(...),
    session_id: str = "commander",
    voice_response: bool = True,
):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY not configured")

    content = await audio.read()
    ext = "webm"
    if audio.filename:
        parts = audio.filename.rsplit(".", 1)
        if len(parts) == 2:
            ext = parts[1].lower()

    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        import httpx

        with open(tmp_path, "rb") as f:
            audio_bytes = f.read()
        files = {"file": (f"recording.{ext}", audio_bytes, f"audio/{ext}")}
        # whisper-large-v3-turbo: 8× faster, same accuracy, higher rate limits
        data = {"model": "whisper-large-v3-turbo", "response_format": "json"}
        headers = {"Authorization": f"Bearer {GROQ_API_KEY}"}
        stt_resp = httpx.post(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            headers=headers, files=files, data=data, timeout=30,
        )
        stt_resp.raise_for_status()
        transcript = stt_resp.json().get("text", "").strip()

        # Guard 1: empty transcript
        if not transcript:
            return {"error": "Could not hear you — please try again"}

        # Guard 2: too few words (noise / accidental trigger)
        if len(transcript.split()) < MIN_TRANSCRIPT_WORDS:
            return {"transcript": transcript, "skipped": True,
                    "error": "Too short — speak a full sentence"}

        # Guard 3: per-session cooldown to protect Groq rate limits
        now = time.time()
        since = now - _voice_last_call[session_id]
        if since < VOICE_COOLDOWN_SECS:
            return {"transcript": transcript, "skipped": True,
                    "error": f"Rate limit — wait {VOICE_COOLDOWN_SECS - since:.1f}s"}
        _voice_last_call[session_id] = now

        from agents.master_orchestrator import orchestrator
        result = await orchestrator.respond(transcript, session_id)

        response: dict = {
            "transcript": transcript,
            "reply": result["reply"],
            "system": result["system"],
            "routing": result["routing"],
        }

        if voice_response:
            audio_out = await _tts(result["reply"])
            response["audio_base64"] = base64.b64encode(audio_out).decode()

        return response

    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass


@router.get("/status")
async def status(session_id: str = "commander"):
    from agents.master_orchestrator import orchestrator
    return orchestrator.get_status(session_id)


@router.delete("/history")
async def clear_history(session_id: str = "commander"):
    from agents.master_orchestrator import orchestrator
    orchestrator.clear_history(session_id)
    return {"status": "cleared", "session_id": session_id}


@router.websocket("/ws")
async def orchestrator_ws(ws: WebSocket):
    await ws.accept()
    from agents.master_orchestrator import orchestrator

    session_id = ws.query_params.get("session_id", "commander")

    await ws.send_json({
        "type": "connected",
        "message": "EDITH Master Orchestrator online. All 15 systems initialized.",
        "systems": 15,
    })

    try:
        while True:
            raw = await ws.receive_text()
            data = json.loads(raw)
            msg_type = data.get("type")

            if msg_type == "text":
                text = data.get("text", "").strip()
                if not text:
                    continue

                full_reply = ""
                system_used = "core"
                routing_used = {}

                async for chunk in orchestrator.stream_response(text, session_id):
                    if not chunk["done"]:
                        full_reply += chunk["token"]
                        system_used = chunk["system"]
                        await ws.send_json({
                            "type": "token",
                            "token": chunk["token"],
                            "system": chunk["system"],
                            "routing": chunk.get("routing", {}),
                        })
                    else:
                        system_used = chunk["system"]
                        routing_used = chunk.get("routing", {})
                        if chunk.get("full_response"):
                            full_reply = chunk["full_response"]

                audio_b64 = ""
                if data.get("voice_response", False):
                    audio_bytes = await _tts(full_reply)
                    audio_b64 = base64.b64encode(audio_bytes).decode()

                await ws.send_json({
                    "type": "complete",
                    "text": full_reply,
                    "system": system_used,
                    "routing": routing_used,
                    "audio": audio_b64,
                })

            elif msg_type == "status":
                await ws.send_json({
                    "type": "status",
                    "data": orchestrator.get_status(session_id),
                })

            elif msg_type == "clear":
                orchestrator.clear_history(session_id)
                await ws.send_json({"type": "cleared"})

    except Exception as exc:
        print(f"[WS] session={session_id} closed: {exc}")
