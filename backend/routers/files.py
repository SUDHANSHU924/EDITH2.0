from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class FileRequest(BaseModel):
    type: str
    content: str
    filename: str = "document"

@router.post("/create")
async def create(req: FileRequest):
    return {
        "status": "ok",
        "system": "04 - File Vault",
        "type": req.type,
        "message": f"File {req.filename}.{req.type} ready"
    }

@router.get("/status")
async def status():
    return {"status": "online", "system": "04"}
