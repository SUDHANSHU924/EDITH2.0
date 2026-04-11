from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List
import base64
from groq import AsyncGroq
from core.config import settings

router = APIRouter()


@router.post("/analyze")
async def analyze(
    files: List[UploadFile] = File(...),
    prompt: str = Form("Describe the image."),
):
    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=400, detail="GROQ_API_KEY not configured")

    client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    results = []

    for upload in files:
        if not upload.content_type or not upload.content_type.startswith("image/"):
            results.append({
                "name": upload.filename or "unknown",
                "summary": "Unsupported file type.",
            })
            continue

        data = await upload.read()
        if not data:
            results.append({
                "name": upload.filename or "unknown",
                "summary": "Empty image payload.",
            })
            continue

        encoded = base64.b64encode(data).decode("ascii")
        image_url = f"data:{upload.content_type};base64,{encoded}"

        try:
            response = await client.chat.completions.create(
                model=settings.GROQ_VISION_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt or "Describe the image."},
                            {"type": "image_url", "image_url": {"url": image_url}},
                        ],
                    }
                ],
                max_tokens=512,
            )

            summary = ""
            if response.choices and response.choices[0].message:
                summary = response.choices[0].message.content or ""

            results.append({
                "name": upload.filename or "image",
                "summary": summary.strip() or "No response.",
            })
        except Exception as exc:
            results.append({
                "name": upload.filename or "image",
                "summary": f"Vision error: {str(exc)[:120]}",
            })

    return {"results": results}


@router.get("/status")
async def status():
    return {"status": "ok", "module": "vision", "message": "Ready for integration"}
