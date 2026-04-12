from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List
import base64
import hashlib
from core.config import settings
from services.nvidia import NvidiaClient

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
    nvidia_client = NvidiaClient(api_key=api_key, base_url=base_url)
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

        try:
            summary = await nvidia_client.analyze_image(
                image_data=data,
                prompt=prompt or "Describe the image in detail.",
                content_type=upload.content_type,
                stream=False
            )

            results.append({
                "name": upload.filename or "image",
                "summary": summary.strip() or "No response.",
            })
        except Exception as exc:
            error_msg = str(exc)
            
            # Handle account/endpoint not enabled
            if "404" in error_msg or "Not found" in error_msg or "Function" in error_msg:
                metadata = await get_image_metadata(data, upload.filename or "image", upload.content_type)
                results.append({
                    "name": upload.filename or "image",
                    "summary": f"[VISION SERVICE PENDING ENABLEMENT]\n\nImage received:\n- Name: {metadata['filename']}\n- Type: {metadata['type']}\n- Size: {metadata['size']}\n\nTo enable vision analysis:\n1. Visit https://build.nvidia.com/meta/llama-3.2-90b-vision-instruct\n2. Log in with your NVIDIA account\n3. Click 'Get API Key' and copy your key\n4. Update NVIDIA_VISION_API_KEY in backend/.env\n5. Restart the backend server\n\nCurrent model: meta/llama-3.2-90b-vision-instruct\nAPI Status: {error_msg[:100]}\n\nAlternatively, describe what you need extracted from this image and I can help with text-based analysis.",
                })
            else:
                results.append({
                    "name": upload.filename or "image",
                    "summary": f"Vision analysis error: {error_msg[:150]}",
                })

    return {"results": results}


@router.post("/analyze-stream")
async def analyze_stream(
    files: List[UploadFile] = File(...),
    prompt: str = Form("Describe the image."),
):
    """Streaming version of image analysis"""
    api_key = settings.NVIDIA_VISION_API_KEY
    if not api_key or not api_key.strip():
        raise HTTPException(status_code=400, detail="NVIDIA_VISION_API_KEY not configured")

    base_url = settings.NVIDIA_BASE_URL
    nvidia_client = NvidiaClient(api_key=api_key, base_url=base_url)
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

        try:
            summary = await nvidia_client.analyze_image(
                image_data=data,
                prompt=prompt or "Describe the image in detail.",
                content_type=upload.content_type,
                stream=True
            )

            results.append({
                "name": upload.filename or "image",
                "summary": summary.strip() or "No response.",
            })
        except Exception as exc:
            error_msg = str(exc)
            results.append({
                "name": upload.filename or "image",
                "summary": f"Vision analysis error: {error_msg[:150]}",
            })

    return {"results": results}


@router.post("/chat")
async def vision_chat(
    message: str,
    image_data: str = None,  # Base64 encoded image
    content_type: str = "image/jpeg",
):
    """Chat with vision model, optionally including an image"""
    api_key = settings.NVIDIA_VISION_API_KEY
    if not api_key or not api_key.strip():
        raise HTTPException(status_code=400, detail="NVIDIA_VISION_API_KEY not configured")

    base_url = settings.NVIDIA_BASE_URL
    nvidia_client = NvidiaClient(api_key=api_key, base_url=base_url)

    try:
        if image_data:
            # Decode base64 image and analyze
            import base64
            image_bytes = base64.b64decode(image_data)
            response = await nvidia_client.analyze_image(
                image_data=image_bytes,
                prompt=message,
                content_type=content_type,
                stream=False
            )
        else:
            # Text-only chat
            response = await nvidia_client.generate(prompt=message, stream=False)

        return {"response": response}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Vision API error: {str(exc)}")


@router.get("/status")
async def status():
    return {"status": "ok", "module": "vision", "message": "Ready for integration"}
