# NVIDIA Vision API Integration Guide

## Overview
EDITH2.0 now features integrated support for NVIDIA's `meta/llama-3.2-90b-vision-instruct` model, enabling advanced image analysis and vision-based processing capabilities.

## Model Details
- **Model**: meta/llama-3.2-90b-vision-instruct
- **API Endpoint**: https://integrate.api.nvidia.com/v1/chat/completions
- **Supported Image Formats**: PNG, JPG, JPEG, WEBP
- **Max Tokens**: 512 (configurable)
- **Temperature**: 0.7 (configurable)

## Setup Instructions

### 1. Install Dependencies
```bash
pip install requests aiohttp
```

If you don't have these installed, add them to `requirements.txt`:
```
requests>=2.31.0
aiohttp>=3.9.0
```

### 2. Configure API Key
Add your NVIDIA API key to the `.env` file in the backend directory:
```env
NVIDIA_VISION_API_KEY=nvapi-YOUR_API_KEY_HERE
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
```

To get an API key:
1. Visit https://build.nvidia.com/meta/llama-3.2-90b-vision-instruct
2. Create or log into your NVIDIA account
3. Generate an API key
4. Add it to your environment variables

### 3. Integration Points

The vision API is integrated through:
- **Service Layer**: `backend/services/nvidia.py` - NvidiaClient class
- **Router**: `backend/routers/vision.py` - FastAPI endpoints
- **Configuration**: `backend/core/config.py` - NVIDIA_VISION_API_KEY setting

## API Endpoints

### POST /vision/analyze
Analyze images with synchronous response.

**Request** (multipart/form-data):
```
files: [image files]
prompt: "Describe what you see" (optional, default: "Describe the image in detail.")
```

**Response**:
```json
{
  "results": [
    {
      "name": "image.jpg",
      "summary": "Description of the image..."
    }
  ]
}
```

### POST /vision/analyze-stream
Streaming version of image analysis for real-time responses.

**Request** (multipart/form-data):
```
files: [image files]
prompt: "What's in this image?" (optional)
```

**Response**:
```json
{
  "results": [
    {
      "name": "image.jpg",
      "summary": "Streamed analysis content..."
    }
  ]
}
```

### POST /vision/chat
General vision chat endpoint with optional image support.

**Request** (application/json):
```json
{
  "message": "Analyze this image",
  "image_data": "base64_encoded_image_string",
  "content_type": "image/jpeg"
}
```

**Response**:
```json
{
  "response": "Analysis result..."
}
```

### GET /vision/status
Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "module": "vision",
  "message": "Ready for integration"
}
```

## Usage Examples

### Python (Direct API Use)
```python
from services.nvidia import NvidiaClient

client = NvidiaClient(
    api_key="your-api-key",
    base_url="https://integrate.api.nvidia.com/v1"
)

# Text generation
response = await client.generate("What is AI?")

# Image analysis
with open("image.jpg", "rb") as f:
    image_data = f.read()
response = await client.analyze_image(
    image_data=image_data,
    prompt="Describe this image",
    content_type="image/jpeg"
)

# Streaming responses
async for chunk in client.generate_stream("Tell me about computer vision"):
    print(chunk, end="", flush=True)
```

### cURL
```bash
# Analyze image
curl -X POST http://localhost:8000/vision/analyze \
  -F "files=@image.jpg" \
  -F "prompt=What color is the main object?"

# Check status
curl http://localhost:8000/vision/status
```

### JavaScript/TypeScript
```typescript
// Analyze image
const formData = new FormData();
formData.append('files', imageFile);
formData.append('prompt', 'Describe the scene');

const response = await fetch('http://localhost:8000/vision/analyze', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.results[0].summary);
```

## Configuration Options

Edit `backend/services/nvidia.py` to customize:

```python
self.vision_model = "meta/llama-3.2-90b-vision-instruct"  # Model to use
self.chat_model = "meta/llama-3.2-90b-vision-instruct"    # Chat model

# In payload:
"max_tokens": 512,           # Response length
"temperature": 0.7,          # Creativity (0-2)
"top_p": 0.9,               # Diversity
"frequency_penalty": 0.0,    # Reduce repetition
"presence_penalty": 0.0      # Topic diversity
```

## Error Handling

### Common Errors

**"NVIDIA_VISION_API_KEY not configured"**
- Solution: Ensure NVIDIA_VISION_API_KEY is set in .env file

**"404 Not found"**
- The API key doesn't have access to this model
- Ensure vision model is enabled on your NVIDIA account
- Visit https://build.nvidia.com/meta/llama-3.2-90b-vision-instruct

**Connection timeout**
- Check your internet connection
- Verify the API endpoint is accessible

## Performance Considerations

1. **Image Size**: Smaller images process faster (~1-2 seconds)
2. **Batch Processing**: Analyze multiple images sequentially for best results
3. **Streaming**: Use streaming endpoints for long responses to reduce perceived latency
4. **Token Limits**: Default 512 tokens; increase for detailed analysis

## Testing

Run the test script to verify setup:
```bash
cd backend
python test_nvidia_vision.py
```

Expected output:
```
============================================================
NVIDIA Vision API Integration Tests
Model: meta/llama-3.2-90b-vision-instruct
============================================================

API Endpoints Available:
POST /vision/analyze - Image analysis (multipart form)
POST /vision/analyze-stream - Streaming image analysis
POST /vision/chat - Vision chat (with optional image)
GET /vision/status - Service status
```

## Troubleshooting

### Test Connection
```python
import requests

response = requests.post(
    "https://integrate.api.nvidia.com/v1/chat/completions",
    headers={"Authorization": f"Bearer {your_api_key}"},
    json={
        "model": "meta/llama-3.2-90b-vision-instruct",
        "messages": [{"role": "user", "content": "Hi"}],
        "max_tokens": 50
    }
)
print(response.status_code, response.json())
```

### Enable Logging
Add to your code:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
```

## Next Steps

1. Test with sample images
2. Integrate vision endpoints into your UI components
3. Add image preprocessing for optimized analysis
4. Implement caching for repeated image analyses
5. Monitor API usage and optimize token consumption

## References

- [NVIDIA Build Documentation](https://build.nvidia.com/)
- [Llama 3.2 Vision Model](https://build.nvidia.com/meta/llama-3.2-90b-vision-instruct)
- [EDITH2.0 Architecture](../zdesign%20assets/EDITH_Architecture.md)
