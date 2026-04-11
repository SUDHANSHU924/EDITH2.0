from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.websockets import WebSocket
import uvicorn

from core.config import settings
from core.logging import configure_logging
from routers import edith, search, code, vision, voice, memory, hacker, satellite
from ws_handlers.handler import websocket_endpoint

configure_logging()

app = FastAPI(
    title="EDITH API",
    description="E.D.I.T.H - Autonomous Intelligence System",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CLIENT_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(edith.router, prefix="/api/edith")
app.include_router(search.router, prefix="/api/search")
app.include_router(code.router, prefix="/api/code")
app.include_router(vision.router, prefix="/api/vision")
app.include_router(voice.router, prefix="/api/voice")
app.include_router(memory.router, prefix="/api/memory")
app.include_router(hacker.router, prefix="/api/hacker")
app.include_router(satellite.router, prefix="/api/satellite")


@app.websocket("/ws/{session_id}")
async def websocket_route(websocket: WebSocket, session_id: str):
    await websocket_endpoint(websocket, session_id)


@app.get("/health")
async def health():
    return {"status": "EDITH ONLINE", "version": "2.0.0", "systems": 15}


if __name__ == "__main__":
    print(f"EDITH Server running on port {settings.PORT}")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=True,
    )
