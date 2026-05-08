#!/bin/bash
# Complete NVIDIA NIM + Claude Setup Script

echo "=================================="
echo "NVIDIA NIM + Claude Setup"
echo "=================================="

WORKSPACE="/workspaces/EDITH2.0"
cd "$WORKSPACE"

# Load environment
source artifacts/jarvis-api/.env

echo ""
echo "Step 1: Create cache directory..."
mkdir -p "$LOCAL_NIM_CACHE"
echo "✓ Cache directory: $LOCAL_NIM_CACHE"

echo ""
echo "Step 2: Login to NVIDIA NGC Registry..."
echo "$NGC_API_KEY" | docker login nvcr.io --username '$oauthtoken' --password-stdin
if [ $? -eq 0 ]; then
    echo "✓ Successfully logged in to NGC"
else
    echo "✗ Failed to login to NGC"
    exit 1
fi

echo ""
echo "Step 3: Download model to cache (this may take 10-30 minutes)..."
echo "Running: docker run --rm --gpus all ... download-to-cache"
docker run --rm --gpus all \
  -v "$LOCAL_NIM_CACHE:/opt/nim/.cache" \
  -e NGC_API_KEY \
  -e NIM_MODEL_PROFILE \
  nvcr.io/nim/meta/llama-3.1-405b-instruct:latest download-to-cache --profile $NIM_MODEL_PROFILE

if [ $? -eq 0 ]; then
    echo "✓ Model downloaded successfully"
else
    echo "✗ Model download failed"
    exit 1
fi

echo ""
echo "Step 4: Start NVIDIA NIM server on port 8000..."
echo "This will run in the background. Server logs below:"
echo "---"

docker run --rm --gpus all \
  -v "$LOCAL_NIM_CACHE:/opt/nim/.cache" \
  -e NGC_API_KEY \
  -e NIM_MODEL_PROFILE \
  -p 8000:8000 \
  nvcr.io/nim/meta/llama-3.1-405b-instruct:latest &

NIM_PID=$!
echo "NIM Server PID: $NIM_PID"

echo ""
echo "Waiting for server to start (20 seconds)..."
sleep 20

echo ""
echo "Step 5: Testing connection to NIM server..."
if curl -s http://localhost:8000/v1/health > /dev/null; then
    echo "✓ NIM server is running and responding"
else
    echo "✗ NIM server is not responding yet. May still be initializing..."
fi

echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
echo "NIM Server Details:"
echo "  - Endpoint: http://localhost:8000"
echo "  - Model: meta/llama-3.1-405b-instruct"
echo "  - API Key: not-used"
echo ""
echo "Environment variables are configured in: artifacts/jarvis-api/.env"
echo ""
echo "Test the connection:"
echo "  python3 test_nim_claude.py"
echo ""
echo "Stop the server:"
echo "  kill $NIM_PID"
echo "=================================="
