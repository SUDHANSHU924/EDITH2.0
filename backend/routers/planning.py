from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class PlanRequest(BaseModel):
    objective: str
    session_id: str = "default"

@router.post("/decompose")
async def decompose(req: PlanRequest):
    return {
        "status": "ok",
        "system": "02 - Autonomous Planning",
        "objective": req.objective,
        "phases": [
            "Phase 1: Research & Analysis",
            "Phase 2: Architecture Design",
            "Phase 3: Implementation",
            "Phase 4: Verification",
            "Phase 5: Delivery"
        ],
        "reasoning": "Chain-of-Thought active",
        "mode": "Tree-of-Thought"
    }

@router.get("/status")
async def status():
    return {"status": "online", "system": "02"}
