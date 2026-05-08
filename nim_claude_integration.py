#!/usr/bin/env python3
"""
NVIDIA NIM Integration Guide & Examples
Complete guide for accessing Claude via NVIDIA NIM in your EDITH project
"""

import os
import json
import requests
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/workspaces/EDITH2.0/artifacts/jarvis-api/.env')

class NIMClaudeClient:
    """Client for accessing Claude via NVIDIA NIM"""
    
    def __init__(self):
        self.endpoint = os.getenv('ANTHROPIC_BASE_URL', 'http://localhost:8000')
        self.api_key = os.getenv('ANTHROPIC_API_KEY', 'not-used')
        self.model = os.getenv('ANTHROPIC_CUSTOM_MODEL_OPTION', 'meta/llama-3.1-405b-instruct')
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def check_health(self) -> bool:
        """Check if NIM server is running"""
        try:
            response = requests.get(f"{self.endpoint}/v1/health", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def list_models(self) -> list:
        """List available models on NIM server"""
        try:
            response = requests.get(
                f"{self.endpoint}/v1/models",
                headers=self.headers,
                timeout=10
            )
            return response.json()
        except Exception as e:
            print(f"Error listing models: {e}")
            return []
    
    def chat_completion(self, message: str, max_tokens: int = 1024) -> Optional[str]:
        """Send a message to Claude via NIM and get response"""
        try:
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "user", "content": message}
                ],
                "max_tokens": max_tokens,
                "temperature": 0.7
            }
            
            response = requests.post(
                f"{self.endpoint}/v1/chat/completions",
                json=payload,
                headers=self.headers,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content']
            else:
                print(f"Error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"Error in chat completion: {e}")
            return None
    
    def chat_completion_streaming(self, message: str, max_tokens: int = 1024):
        """Stream response from Claude via NIM"""
        try:
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "user", "content": message}
                ],
                "max_tokens": max_tokens,
                "stream": True
            }
            
            response = requests.post(
                f"{self.endpoint}/v1/chat/completions",
                json=payload,
                headers=self.headers,
                stream=True,
                timeout=60
            )
            
            for line in response.iter_lines():
                if line:
                    line = line.decode('utf-8')
                    if line.startswith('data: '):
                        data = line[6:]
                        if data != '[DONE]':
                            try:
                                chunk = json.loads(data)
                                if 'choices' in chunk:
                                    delta = chunk['choices'][0].get('delta', {})
                                    content = delta.get('content', '')
                                    if content:
                                        yield content
                            except:
                                pass
                                
        except Exception as e:
            print(f"Error in streaming: {e}")


# Example Usage
if __name__ == "__main__":
    print("=" * 60)
    print("NVIDIA NIM + Claude Integration Examples")
    print("=" * 60)
    
    # Initialize client
    client = NIMClaudeClient()
    print(f"\nConfiguration:")
    print(f"  Endpoint: {client.endpoint}")
    print(f"  Model: {client.model}")
    
    # Check health
    print(f"\nChecking NIM server health...")
    if client.check_health():
        print("  ✓ Server is running")
    else:
        print("  ✗ Server is not responding")
        print("  Please start the NIM server:")
        print("    docker run --rm --gpus all -v /tmp/nim-cache:/opt/nim/.cache -e NGC_API_KEY -p 8000:8000 nvcr.io/nim/meta/llama-3.1-405b-instruct:latest")
        exit(1)
    
    # List models
    print(f"\nAvailable models:")
    models = client.list_models()
    for model in models.get('data', []):
        print(f"  - {model.get('id')}")
    
    # Test chat
    print(f"\nTesting chat completion...")
    response = client.chat_completion("Say hello and confirm you are Claude running via NVIDIA NIM.")
    if response:
        print(f"  Response: {response}")
    
    # Test streaming
    print(f"\nTesting streaming response...")
    print("  Response (streaming): ", end="", flush=True)
    for chunk in client.chat_completion_streaming("Write a short haiku about AI."):
        print(chunk, end="", flush=True)
    print()
    
    print("\n" + "=" * 60)
    print("Integration examples complete!")
    print("=" * 60)


# INTEGRATION GUIDE FOR JARVIS API
"""
To integrate with your Jarvis API, use this pattern:

1. In your agent/router:
```python
from pathlib import Path
import sys

# Add the workspace to path
sys.path.insert(0, '/workspaces/EDITH2.0')

from test_nim_claude import NIMClaudeClient

# Initialize
client = NIMClaudeClient()

# Use in your agent
async def process_with_claude(user_input: str):
    # Check if server is available
    if not client.check_health():
        return {"error": "NIM server not available"}
    
    # Get response from Claude
    response = client.chat_completion(user_input)
    return {"response": response}
```

2. Environment variables are automatically loaded from:
   artifacts/jarvis-api/.env

3. No additional setup needed - the client handles everything!

4. For production:
   - Use docker-compose.nim.yml to manage the NIM container
   - Add error handling and retry logic
   - Consider rate limiting and queue management
"""
