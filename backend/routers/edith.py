from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import asyncio
import json
import os
from core.config import settings

router = APIRouter()


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    session_id: str = "default"
    system_id: int = 1
    department: str = "core"


SYSTEM_PROMPTS = {
    "core": "You are EDITH Core — conversational AI assistant for the E.D.I.T.H system.",
    "planning": "You are EDITH Agent Hub — autonomous planning and reasoning expert.",
    "code": "You are EDITH Code Forge — expert software engineer.",
    "files": "You are EDITH File Vault — document engineering specialist.",
    "search": "You are EDITH Deep Search — real-time research intelligence.",
    "learning": "You are EDITH Self-Learn — knowledge evolution engine.",
    "ml": "You are EDITH Data Lab — ML and AI engineering expert.",
    "iot": "You are EDITH IoT Control — smart home automation expert.",
    "vision": "You are EDITH Vision Lens — multimodal analysis system.",
    "voice": "You are EDITH Voice Ops — speech processing system.",
    "personal": "You are EDITH Personalize — human intelligence layer.",
    "security": "You are EDITH Security Grid — privacy and ethics guardian.",
    "daily": "You are EDITH Daily Ops — everyday task assistant.",
}


async def stream_groq(content: str, department: str):
    """Stream response from Groq API"""
    try:
        from groq import AsyncGroq
        
        if not settings.GROQ_API_KEY:
            raise ValueError("No Groq API key configured")
        
        client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        system_prompt = SYSTEM_PROMPTS.get(department, SYSTEM_PROMPTS["core"])
        
        stream = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": content}
            ],
            stream=True,
            max_tokens=1024
        )
        
        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                token = chunk.choices[0].delta.content
                yield f"data: {json.dumps({'content': token})}\n\n"
                await asyncio.sleep(0)
        
        yield "data: [DONE]\n\n"
    except Exception as e:
        error_msg = f"Groq API Error: {str(e)[:100]}"
        for char in error_msg:
            yield f"data: {json.dumps({'content': char})}\n\n"
            await asyncio.sleep(0.01)
        yield "data: [DONE]\n\n"


async def stream_fallback(content: str, department: str):
    """Fallback mock response if Groq fails"""
    fallbacks = {
        "core": "EDITH Core online. Please add Groq API key for full AI responses.",
        "planning": "Planning system ready. Awaiting AI model configuration.",
        "code": "Code Forge initialized. Ready for code generation.",
        "search": "Search system active. Add TAVILY_API_KEY for real-time search.",
        "security": "Security Grid online. Threat analysis module ready.",
    }
    response = fallbacks.get(department, f"EDITH {department.upper()} system online.")
    
    for char in response:
        yield f"data: {json.dumps({'content': char})}\n\n"
        await asyncio.sleep(0.015)
    yield "data: [DONE]\n\n"


@router.post("/chat")
async def chat(request: ChatRequest):
    last_msg = request.messages[-1].content if request.messages else "Hello"
    
    if settings.GROQ_API_KEY:
        stream_func = stream_groq(last_msg, request.department)
    else:
        stream_func = stream_fallback(last_msg, request.department)
    
    return StreamingResponse(
        stream_func,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*"
        },
    )


@router.get("/status")
async def status():
    return {
        "status": "online",
        "model": "LLaMA 3.3 70B (Groq)" if settings.GROQ_API_KEY else "Fallback Mock",
        "groq_connected": bool(settings.GROQ_API_KEY),
        "systems_active": 13,
        "systems_locked": 2,
    }
