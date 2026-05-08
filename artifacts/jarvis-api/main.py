import os
import env_loader
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.jarvis import router as jarvis_router
from routers.voice import router as voice_router
from routers.orchestrator import router as orchestrator_router
from routers.talk import router as talk_router
from routers.desktop import router as desktop_router

app = FastAPI(
    title="E.D.I.T.H. Jarvis API",
    description="Autonomous OS Control Agent — ReAct Loop Engine",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jarvis_router, prefix="/api/jarvis", tags=["jarvis"])
app.include_router(voice_router, prefix="/api/jarvis/voice", tags=["voice"])
app.include_router(orchestrator_router, prefix="/api/orchestrator", tags=["orchestrator"])
app.include_router(talk_router, prefix="/api/talk", tags=["Talk Mode"])
app.include_router(desktop_router, prefix="/api/desktop", tags=["Desktop Control"])


@app.get("/")
async def root():
    return {"status": "ok", "service": "E.D.I.T.H. Jarvis API", "version": "2.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
