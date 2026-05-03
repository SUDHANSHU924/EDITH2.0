from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
async def status():
    return {"status": "online", "system": "06 - Self-Learn"}

@router.post("/update")
async def update():
    return {"status": "ok", "message": "Knowledge updated"}
