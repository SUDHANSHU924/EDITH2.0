from fastapi import APIRouter

router = APIRouter()


@router.get("/status")
async def status():
    return {"status": "ok", "module": "code", "message": "Ready for integration"}
