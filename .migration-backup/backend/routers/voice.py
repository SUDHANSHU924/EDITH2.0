from fastapi import APIRouter, UploadFile, File
from fastapi.responses import StreamingResponse
from groq import Groq
from dotenv import load_dotenv
from pathlib import Path
import os
import tempfile
import io
import aiofiles

load_dotenv()

router = APIRouter()


@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
):
    """Convert voice to text using Whisper via Groq"""
    groq_key = os.getenv("GROQ_API_KEY", "")

    if not groq_key:
        return {"error": "GROQ_API_KEY not set", "text": ""}

    suffix = Path(audio.filename or "audio").suffix or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp_path = tmp.name

    try:
        content = await audio.read()
        async with aiofiles.open(tmp_path, "wb") as tmp_file:
            await tmp_file.write(content)

        client = Groq(api_key=groq_key)
        with open(tmp_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                file=(audio.filename or f"audio{suffix}", audio_file.read()),
                model="whisper-large-v3",
                language="en",
                response_format="text",
            )

        text = transcription if isinstance(transcription, str) else str(transcription)
        return {
            "text": text,
            "status": "success",
            "model": "whisper-large-v3",
        }
    except Exception as exc:
        return {"error": str(exc), "text": ""}
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


@router.post("/speak")
async def text_to_speech(request: dict):
    """Convert text to speech"""
    text = request.get("text", "")
    if not text:
        return {"error": "No text provided"}

    try:
        from gtts import gTTS

        tts = gTTS(text=text, lang="en", slow=False)
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)

        return StreamingResponse(
            audio_buffer,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=speech.mp3",
            },
        )
    except Exception as exc:
        return {"error": str(exc)}


@router.get("/status")
async def status():
    groq_key = os.getenv("GROQ_API_KEY", "")
    return {
        "status": "online",
        "stt": "whisper-large-v3 via Groq" if groq_key else "needs GROQ_API_KEY",
        "tts": "gTTS",
        "languages": "50+",
        "groq_connected": bool(groq_key),
    }
