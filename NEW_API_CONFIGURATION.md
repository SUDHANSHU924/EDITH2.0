# EDITH 2.0 - New API Configuration Guide

## Overview
EDITH 2.0 now supports multiple advanced AI models from NVIDIA's API platform with optimal routing per task type.

## Configured Models

### 1. DeepSeek V4 Pro (Main Model)
**Purpose**: Advanced reasoning, complex queries, general conversation  
**Provider**: NVIDIA NIM  
**Model**: `deepseek-ai/deepseek-v4-pro`  
**API Key**: `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`

**Usage**:
```python
from agents.model_router import router

# OpenAI Client Method (Recommended)
response = router.call_deepseek_v4_pro(
    messages=[{"role": "user", "content": "Your query"}],
    max_tokens=16384,
    temperature=1.0,
    top_p=0.95,
    thinking=False,  # Enable extended thinking for complex reasoning
    stream=True
)

# Or via standard generate method
client, model, provider = router.get_sync_client('core')
response = client.chat.completions.create(
    model=model,
    messages=messages
)
```

**Parameters**:
- `temperature`: 0.0-2.0 (Default: 1.0)
- `top_p`: 0.0-1.0 (Default: 0.95)
- `max_tokens`: Up to 16384
- `thinking`: Boolean to enable extended thinking (inference-time reasoning)

---

### 2. Mistral Large 3 (Document Generation)
**Purpose**: Document generation, file operations, bulk text processing  
**Provider**: NVIDIA NIM  
**Model**: `mistralai/mistral-large-3-675b-instruct-2512`  
**API Key**: `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`

**Usage**:
```python
# Via requests library (streaming)
response = router.call_mistral_requests(
    messages=[{"role": "user", "content": "Generate a report"}],
    max_tokens=2048,
    temperature=0.15,
    top_p=1.0,
    stream=True
)

# Parse streaming response
if response.status_code == 200:
    for line in response.iter_lines():
        if line:
            print(line.decode('utf-8'))
```

**Parameters**:
- `temperature`: 0.0-1.0 (Default: 0.15 - very deterministic)
- `top_p`: 0.0-1.0 (Default: 1.0)
- `max_tokens`: Up to 2048
- `frequency_penalty`: 0.0-2.0
- `presence_penalty`: 0.0-2.0

---

### 3. Llama 3.2 90B Vision (Image Analysis)
**Purpose**: Image analysis, OCR, vision understanding  
**Provider**: NVIDIA NIM  
**Model**: `meta/llama-3.2-90b-vision-instruct`  
**API Key**: `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`

**Usage**:
```python
# Via requests library with image support
import base64

with open('image.jpg', 'rb') as img_file:
    image_data = base64.b64encode(img_file.read()).decode()

response = router.call_vision_requests(
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What's in this image?"},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}
                }
            ]
        }
    ],
    max_tokens=512,
    temperature=1.0,
    stream=True
)
```

**Parameters**:
- `max_tokens`: Up to 512 for Vision
- `temperature`: 0.0-2.0 (Default: 1.0)
- `top_p`: 0.0-1.0 (Default: 1.0)

---

### 4. DeepSeek R1 (Security & Reasoning)
**Purpose**: Security analysis, deep reasoning, threat detection  
**Provider**: NVIDIA NIM  
**Model**: `deepseek-ai/deepseek-r1-distill-llama-8b`  
**API Key**: `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`

**Usage**:
```python
response = router.call_deepseek_r1(
    messages=[{"role": "user", "content": "Analyze security risks"}],
    max_tokens=4096,
    temperature=0.6,
    top_p=0.7,
    stream=True
)

# Process streaming response
for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end='')
```

**Parameters**:
- `temperature`: 0.0-1.0 (Default: 0.6)
- `top_p`: 0.0-1.0 (Default: 0.7)
- `max_tokens`: Up to 4096

---

## Additional Models

### Qwen Models
- **Advanced**: `qwen/qwen3.5-397b-a17b` - Advanced reasoning with thinking
- **Standard**: `qwen/qwen2.5-72b-instruct` - Multilingual support
- **Compact**: `qwen/qwen2.5-32b-instruct` - Efficient processing

### DeepSeek Models
- **Coder V2**: `deepseek-ai/deepseek-coder-v2-236b-instruct` - Code generation
- **V3**: `deepseek-ai/deepseek-v3` - General purpose (fallback)

### Llama Models
- **Llama 3.3 70B**: `meta/llama-3.3-70b-instruct` - Balanced performance
- **Llama 3.1 405B**: `meta/llama-3.1-405b-instruct` - Powerful reasoning

---

## Model Router API

### Main Methods

#### `get_model(system: str = "core") -> tuple`
Returns `(client, model_name, provider)` for a task type.

```python
client, model, provider = router.get_model('code')
# Returns OpenAI client, model name, and provider
```

#### `get_sync_client(system: str = "core") -> tuple`
Synchronous version of `get_model()`.

#### `generate_sync(messages, system, max_tokens, temperature)`
Synchronous generation using optimal model.

```python
response = router.generate_sync(
    messages=[{"role": "user", "content": "Hello"}],
    system="core",
    max_tokens=1024,
    temperature=0.7
)
```

#### `generate_stream(messages, system, max_tokens)`
Stream tokens from optimal model (async).

```python
async for chunk in router.generate_stream(messages):
    print(chunk, end='')
```

---

## Fallback Strategy

If NVIDIA API fails:
- **Primary**: NVIDIA NIM APIs
- **Secondary**: Groq APIs (llama-3.3-70b-versatile, etc.)
- **Error Handling**: Automatic fallback with logging

```
User Request
    ↓
Check NVIDIA API Key → Available?
    ├─ YES → Use NVIDIA Model
    │   └─ Error? → Try Groq Fallback
    └─ NO → Try Groq Directly
```

---

## Task-based Routing

```
"Write Python code" → CODE model (DeepSeek Coder)
"Search for AI news" → SEARCH model (Llama 3.3)
"Plan a project" → PLANNING model (DeepSeek R1)
"Analyze image" → VISION model (Llama 3.2 90B)
"Generate docs" → FILES model (Mistral Large 3)
"Security check" → SECURITY model (DeepSeek R1)
"Translate text" → MULTILINGUAL model (Qwen)
"General chat" → CORE model (DeepSeek V4)
```

---

## Environment Variables

```bash
# Main Configuration
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_API_KEY_MAIN=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

# Model-specific Keys
NVIDIA_API_KEY_MISTRAL=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
NVIDIA_API_KEY_VISION=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
NVIDIA_API_KEY_R1=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

# Models
MODEL_MAIN=deepseek-ai/deepseek-v4-pro
MODEL_VISION=meta/llama-3.2-90b-vision-instruct
MODEL_MISTRAL=mistralai/mistral-large-3-675b-instruct-2512
MODEL_REASONING=deepseek-ai/deepseek-r1-distill-llama-8b

# Groq Fallback
GROQ_API_KEY=your_groq_api_key
```

---

## Testing

Run the validation test:
```bash
python /workspaces/EDITH2.0/test_new_apis.py
```

Expected output:
```
✅ ALL API CONFIGURATIONS VERIFIED
✅ DeepSeek V4 Pro ready
✅ Mistral Large 3 ready
✅ Llama 3.2 90B Vision ready
✅ DeepSeek R1 ready
```

---

## Performance Considerations

| Model | Latency | Max Tokens | Best For |
|-------|---------|-----------|----------|
| DeepSeek V4 Pro | ~3-5s | 16384 | Complex reasoning |
| Mistral Large 3 | ~2-4s | 2048 | Document generation |
| Llama 3.2 Vision | ~4-6s | 512 | Image analysis |
| DeepSeek R1 | ~2-3s | 4096 | Security analysis |
| Qwen 2.5 72B | ~2-3s | 8192 | Multilingual |

---

## Error Handling

```python
try:
    response = router.call_deepseek_v4_pro(messages)
except Exception as e:
    print(f"❌ DeepSeek V4 error: {e}")
    # Fallback to Groq
    client, model, provider = router.get_sync_client('core')
    response = client.chat.completions.create(
        model=model,
        messages=messages
    )
```

---

## Production Checklist

- [x] All API keys configured
- [x] Model routing implemented
- [x] Fallback strategy working
- [x] Streaming enabled
- [x] Error handling added
- [x] Tests passing
- [ ] Rate limiting configured (optional)
- [ ] Monitoring setup (optional)

---

**Status**: ✅ Production Ready  
**Updated**: May 8, 2026  
**Version**: 2.0 - New API Configuration
