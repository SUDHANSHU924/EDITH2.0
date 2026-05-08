#!/usr/bin/env python3
"""
Test script to access Claude via NVIDIA NIM
"""
import os
import time
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/workspaces/EDITH2.0/artifacts/jarvis-api/.env')

# Configuration from .env
NIM_ENDPOINT = os.getenv('ANTHROPIC_BASE_URL', 'http://localhost:8000')
NIM_API_KEY = os.getenv('ANTHROPIC_API_KEY', 'not-used')
MODEL = os.getenv('ANTHROPIC_CUSTOM_MODEL_OPTION', 'meta/llama-3.1-405b-instruct')

print(f"NIM Endpoint: {NIM_ENDPOINT}")
print(f"Model: {MODEL}")
print(f"Testing connection to NVIDIA NIM server...\n")

# Test 1: Check server health
try:
    response = requests.get(f"{NIM_ENDPOINT}/v1/health")
    print(f"✓ Server Health: {response.status_code}")
    print(f"  Response: {response.json()}\n")
except Exception as e:
    print(f"✗ Server Health Check Failed: {e}\n")
    print("Waiting for server to start...")
    exit(1)

# Test 2: List available models
try:
    response = requests.get(f"{NIM_ENDPOINT}/v1/models", headers={"Authorization": f"Bearer {NIM_API_KEY}"})
    print(f"✓ Available Models: {response.status_code}")
    models = response.json()
    print(f"  Models: {models}\n")
except Exception as e:
    print(f"✗ List Models Failed: {e}\n")

# Test 3: Send a test prompt to Claude via NIM
try:
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "user", "content": "Say hello and confirm you are Claude running via NVIDIA NIM."}
        ],
        "max_tokens": 100
    }
    
    response = requests.post(
        f"{NIM_ENDPOINT}/v1/chat/completions",
        json=payload,
        headers={"Authorization": f"Bearer {NIM_API_KEY}"}
    )
    
    print(f"✓ Chat Completion: {response.status_code}")
    result = response.json()
    if 'choices' in result:
        print(f"  Response: {result['choices'][0]['message']['content']}\n")
    else:
        print(f"  Response: {result}\n")
        
except Exception as e:
    print(f"✗ Chat Completion Failed: {e}\n")

print("✓ NVIDIA NIM + Claude Test Complete!")
