from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List
import base64
import os
import hashlib
from openai import AsyncOpenAI
from core.config import settings

router = APIRouter()

# Map of image characteristics (fallback for when vision API is unavailable)
async def get_image_metadata(data: bytes, filename: str, content_type: str) -> dict:
    """Extract basic image metadata"""
    size_kb = len(data) / 1024
    hash_val = hashlib.md5(data).hexdigest()[:8]
    
    return {
        "filename": filename,
        "type": content_type.split('/')[-1].upper(),
        "size": f"{size_kb:.1f}KB",
        "hash": hash_val
    }


@router.post("/analyze")
async def analyze(
    files: List[UploadFile] = File(...),
    prompt: str = Form("Describe the image."),
):
    api_key = settings.NVIDIA_VISION_API_KEY
    if not api_key or not api_key.strip():
        raise HTTPException(status_code=400, detail="NVIDIA_VISION_API_KEY not configured")

    base_url = settings.NVIDIA_BASE_URL
    results = []

    for upload in files:
        if not upload.content_type or not upload.content_type.startswith("image/"):
            results.append({
                "name": upload.filename or "unknown",
                "summary": "Unsupported file type. Supported: PNG, JPG, JPEG, WEBP",
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
            client = AsyncOpenAI(base_url=base_url, api_key=api_key)
            response = await client.chat.completions.create(
                model="meta/llama-4-scout-17b-16e-instruct",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt or "Describe the image in detail."},
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
            error_msg = str(exc)
            
            # Handle account/endpoint not enabled
            if "404" in error_msg and "Not found" in error_msg:
                metadata = await get_image_metadata(data, upload.filename or "image", upload.content_type)
                results.append({
                    "name": upload.filename or "image",
                    "summary": f"[VISION SERVICE PENDING ENABLEMENT]\n\nImage received:\n- Name: {metadata['filename']}\n- Type: {metadata['type']}\n- Size: {metadata['size']}\n\nTo enable vision analysis:\n1. Visit https://build.nvidia.com/meta/llama-4-scout-17b-16e-instruct\n2. Ensure your API key has vision model access\n3. Vision models require specific account provisioning\n\nAlternatively, describe what you need extracted from this image and I can help with text-based analysis.",
                })
            else:
                results.append({
                    "name": upload.filename or "image",
                    "summary": f"Vision analysis error: {error_msg[:150]}",
                })

    return {"results": results}


@router.get("/status")
async def status():
    return {"status": "ok", "module": "vision", "message": "Ready for integration"}
