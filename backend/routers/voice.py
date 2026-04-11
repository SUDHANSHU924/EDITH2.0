from fastapi import APIRouter

router = APIRouter()


@router.get("/status")
async def status():
    return {"status": "ok", "module": "voice", "message": "Ready for integration"}
