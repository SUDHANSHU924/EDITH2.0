# NVIDIA NIM + Claude Setup Guide

## Overview
This guide explains how to run Claude (via NVIDIA's Llama 3.1 405B) locally using NVIDIA NIM (NVIDIA Inference Microservice).

## Environment Variables Added to `.env`

```bash
# NVIDIA NIM Configuration
NGC_API_KEY=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
NIM_MODEL_PROFILE=nim-llm:latest
NIM_ENDPOINT=localhost
NIM_SERVER_PORT=8000
LOCAL_NIM_CACHE=/tmp/nim-cache

# Claude via NVIDIA NIM
ANTHROPIC_BASE_URL=http://localhost:8000
ANTHROPIC_API_KEY=not-used
ANTHROPIC_CUSTOM_MODEL_OPTION=meta/llama-3.1-405b-instruct
ANTHROPIC_DEFAULT_HAIKU_MODEL=meta/llama-3.1-405b-instruct
ANTHROPIC_DEFAULT_OPUS_MODEL=meta/llama-3.1-405b-instruct
ANTHROPIC_DEFAULT_SONNET_MODEL=meta/llama-3.1-405b-instruct
CLAUDE_CODE_SUBAGENT_MODEL=meta/llama-3.1-405b-instruct
```

## Setup Commands (Already Executed)

### 1. Login to NVIDIA NGC Registry
```bash
echo "$NGC_API_KEY" | docker login nvcr.io --username '$oauthtoken' --password-stdin
```
✓ **Status**: LOGIN SUCCEEDED

### 2. Setup Process (Run in Background)

**Terminal 1 - Download Model to Cache:**
```bash
cd /workspaces/EDITH2.0
source artifacts/jarvis-api/.env
mkdir -p $LOCAL_NIM_CACHE

docker run --rm --gpus all \
  -v "$LOCAL_NIM_CACHE:/opt/nim/.cache" \
  -e NGC_API_KEY \
  -e NIM_MODEL_PROFILE \
  nvcr.io/nim/meta/llama-3.1-405b-instruct:latest download-to-cache --profile $NIM_MODEL_PROFILE
```

**Terminal 2 - Start NIM Server:**
```bash
cd /workspaces/EDITH2.0
source artifacts/jarvis-api/.env

docker run --rm --gpus all \
  -v "$LOCAL_NIM_CACHE:/opt/nim/.cache" \
  -e NGC_API_KEY \
  -e NIM_MODEL_PROFILE \
  -p 8000:8000 \
  nvcr.io/nim/meta/llama-3.1-405b-instruct:latest
```

## Testing Connection

### Run Test Script
```bash
python3 /workspaces/EDITH2.0/test_nim_claude.py
```

This will:
1. ✓ Check NIM server health
2. ✓ List available models
3. ✓ Send a test prompt to Claude

## API Endpoints

Once NIM server is running, these endpoints are available:

### Health Check
```
GET http://localhost:8000/v1/health
```

### List Models
```
GET http://localhost:8000/v1/models
Authorization: Bearer not-used
```

### Chat Completion (Claude)
```
POST http://localhost:8000/v1/chat/completions
Authorization: Bearer not-used
Content-Type: application/json

{
  "model": "meta/llama-3.1-405b-instruct",
  "messages": [
    {"role": "user", "content": "Your prompt here"}
  ],
  "max_tokens": 1024
}
```

## Integration with Jarvis API

Update your Python code to use Claude via NIM:

```python
import os
import requests

NIM_ENDPOINT = os.getenv('ANTHROPIC_BASE_URL', 'http://localhost:8000')
MODEL = os.getenv('ANTHROPIC_CUSTOM_MODEL_OPTION', 'meta/llama-3.1-405b-instruct')

response = requests.post(
    f"{NIM_ENDPOINT}/v1/chat/completions",
    json={
        "model": MODEL,
        "messages": [{"role": "user", "content": "Your prompt"}],
        "max_tokens": 1024
    },
    headers={"Authorization": f"Bearer not-used"}
)

result = response.json()
print(result['choices'][0]['message']['content'])
```

## GPU Requirements

- Requires NVIDIA GPUs with CUDA support
- Recommended: V100, A100, or better for Llama 3.1 405B
- Ensure Docker is configured for GPU access

## Notes

- NGC_API_KEY is stored in `.env` (keep it secure!)
- NIM server runs in a Docker container
- Cache directory: `/tmp/nim-cache` (can be changed)
- Port: 8000 (can be changed with `-p NEW_PORT:8000`)
- Model downloads are stored in cache and reused
