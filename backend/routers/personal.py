from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
async def status():
    return {"status": "online", "system": "11 - Personalize"}
