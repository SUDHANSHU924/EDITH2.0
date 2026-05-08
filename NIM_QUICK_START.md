# NVIDIA NIM + Claude Quick Start

## 📋 What We Did

✅ **Added NIM environment variables** to `artifacts/jarvis-api/.env`
✅ **Logged in to NVIDIA NGC Registry** (authentication complete)
✅ **Created setup scripts and guides** for easy deployment
✅ **Created Python client** for integration with Jarvis API

## 🚀 Quick Start (3 Steps)

### Step 1: Download Model (Run Once - Takes 10-30 mins)
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

### Step 2: Start NIM Server (Keep Running)
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

### Step 3: Test Connection
```bash
python3 /workspaces/EDITH2.0/test_nim_claude.py
```

## 📁 Files Created

1. **`artifacts/jarvis-api/.env`** - Updated with NIM variables
2. **`NIM_SETUP_GUIDE.md`** - Complete setup documentation
3. **`setup_nim_claude.sh`** - Automated setup script
4. **`docker-compose.nim.yml`** - Docker Compose config
5. **`test_nim_claude.py`** - Connection test script
6. **`nim_claude_integration.py`** - Python client for integration

## 🔧 Using with Jarvis API

```python
from nim_claude_integration import NIMClaudeClient

client = NIMClaudeClient()
response = client.chat_completion("What can you do?")
print(response)
```

## 🌐 API Endpoints

Once server is running:

```
Health Check:
GET http://localhost:8000/v1/health

Chat Completion:
POST http://localhost:8000/v1/chat/completions
{
  "model": "meta/llama-3.1-405b-instruct",
  "messages": [{"role": "user", "content": "Your prompt"}],
  "max_tokens": 1024
}
```

## 📊 Current Status

- ✅ Docker login: **SUCCESSFUL** 
- ⏳ Model download: **IN PROGRESS** (Terminal 1)
- ⏳ Server startup: **PENDING** (Will run in Terminal 2)
- ⏳ Test: **READY** (Run after server starts)

## 💡 Tips

- Model takes 10-30 minutes to download first time
- Cache is stored in `/tmp/nim-cache` (reused on restarts)
- GPU must be available (checked with `docker run --gpus all`)
- Port 8000 can be changed: `-p YOUR_PORT:8000`
- Server logs will show model loading progress

## 🆘 Troubleshooting

**Server won't start:**
```bash
# Check GPU
docker run --rm --gpus all nvidia/cuda:12.0-runtime-ubuntu22.04 nvidia-smi

# Check Docker login
cat ~/.docker/config.json | grep nvcr.io

# Check cache
ls -lah /tmp/nim-cache/
```

**Connection refused:**
```bash
# Check if server is running
curl http://localhost:8000/v1/health

# Wait longer (model loading takes time)
sleep 60 && curl http://localhost:8000/v1/health
```

## 📚 Next Steps

1. Start the NIM server (Step 2 above)
2. Run test script to verify
3. Integrate client into Jarvis API agents
4. Use Claude for advanced reasoning tasks!
