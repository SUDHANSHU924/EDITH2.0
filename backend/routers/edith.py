from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import asyncio
import json

router = APIRouter()


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    session_id: str = "default"
    system_id: int = 1


async def stream_stub(messages: List[Message]):
    response = (
        "EDITH 2.0 - Online. Commander recognized. "
        "FastAPI backend connected successfully. "
        "Ready for DeepSeek R1 integration."
    )
    for char in response:
        yield f"data: {json.dumps({'content': char})}\n\n"
        await asyncio.sleep(0.02)
    yield "data: [DONE]\n\n"


@router.post("/chat")
async def chat(request: ChatRequest):
    return StreamingResponse(
        stream_stub(request.messages),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/status")
async def status():
    return {
        "status": "online",
        "model": "DeepSeek R1 (pending API key)",
        "systems_active": 13,
        "systems_locked": 2,
    }
