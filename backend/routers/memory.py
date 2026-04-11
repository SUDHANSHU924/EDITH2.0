from fastapi import APIRouter

router = APIRouter()


@router.get("/status")
async def status():
    return {"status": "ok", "module": "memory", "message": "Ready for integration"}
