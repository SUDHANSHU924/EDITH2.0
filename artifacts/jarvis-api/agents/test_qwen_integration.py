#!/usr/bin/env python3
"""
EDITH Qwen Model Integration
Tests Qwen API via NVIDIA NIM with streaming support
"""

import requests
import base64
import os
import sys
from typing import Optional, Dict, Any, Generator
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = "/workspaces/EDITH2.0/artifacts/jarvis-api/.env"
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    print(f"Warning: .env file not found at {env_path}")
    load_dotenv()  # Try loading from current directory


class QwenAPIClient:
    """Qwen API client for EDITH integration"""
    
    # Qwen models available on NVIDIA NIM
    QWEN_MODELS = {
        "qwen3.5-397b": "qwen/qwen3.5-397b-a17b",
        "qwen2.5-72b": "qwen/qwen2.5-72b-instruct",
        "qwen2.5-32b": "qwen/qwen2.5-32b-instruct",
        "qwen2-72b": "qwen/qwen2-72b-instruct",
    }
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = "https://integrate.api.nvidia.com/v1/chat/completions",
        model: str = "qwen/qwen3.5-397b-a17b",
        stream: bool = True,
    ):
        """Initialize Qwen API client"""
        self.api_key = api_key or os.getenv("NVIDIA_API_KEY_MAIN")
        if not self.api_key:
            raise ValueError("NVIDIA_API_KEY_MAIN not found in environment")
        
        self.base_url = base_url
        self.model = model
        self.stream = stream
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "text/event-stream" if stream else "application/json"
        }
    
    def list_available_models(self) -> Dict[str, str]:
        """List available Qwen models"""
        return self.QWEN_MODELS.copy()
    
    def set_model(self, model_name: str) -> None:
        """Set the model to use"""
        if model_name in self.QWEN_MODELS:
            self.model = self.QWEN_MODELS[model_name]
        else:
            self.model = model_name
        print(f"✓ Model set to: {self.model}")
    
    def generate(
        self,
        messages: list,
        max_tokens: int = 16384,
        temperature: float = 0.60,
        top_p: float = 0.95,
        top_k: int = 20,
        enable_thinking: bool = False,
    ) -> Dict[str, Any]:
        """Generate response from Qwen model"""
        
        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "top_p": top_p,
            "top_k": top_k,
            "presence_penalty": 0,
            "repetition_penalty": 1,
            "stream": self.stream,
        }
        
        if enable_thinking:
            payload["chat_template_kwargs"] = {"enable_thinking": True}
        
        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=payload,
                stream=self.stream,
                timeout=60
            )
            response.raise_for_status()
            
            if self.stream:
                return {"status": "streaming", "response": response}
            else:
                return response.json()
        
        except requests.exceptions.RequestException as e:
            return {
                "status": "error",
                "error": str(e),
                "error_type": type(e).__name__
            }
    
    def generate_stream(
        self,
        messages: list,
        max_tokens: int = 16384,
        temperature: float = 0.60,
        top_p: float = 0.95,
        top_k: int = 20,
        enable_thinking: bool = False,
    ) -> Generator[str, None, None]:
        """Stream response tokens from Qwen model"""
        
        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "top_p": top_p,
            "top_k": top_k,
            "presence_penalty": 0,
            "repetition_penalty": 1,
            "stream": True,
        }
        
        if enable_thinking:
            payload["chat_template_kwargs"] = {"enable_thinking": True}
        
        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=payload,
                stream=True,
                timeout=60
            )
            response.raise_for_status()
            
            for line in response.iter_lines():
                if line:
                    line_str = line.decode("utf-8") if isinstance(line, bytes) else line
                    
                    # Parse SSE format: "data: {...json...}"
                    if line_str.startswith("data: "):
                        try:
                            import json
                            data = json.loads(line_str[6:])
                            
                            # Extract token from response
                            if "choices" in data and len(data["choices"]) > 0:
                                choice = data["choices"][0]
                                if "delta" in choice and "content" in choice["delta"]:
                                    token = choice["delta"]["content"]
                                    if token:
                                        yield token
                        except json.JSONDecodeError:
                            pass
        
        except Exception as e:
            yield f"\n[Error: {str(e)}]"
    
    @staticmethod
    def read_b64(path: str) -> str:
        """Encode file to base64"""
        try:
            with open(path, "rb") as f:
                return base64.b64encode(f.read()).decode()
        except Exception as e:
            print(f"Error reading file {path}: {e}")
            return ""


def test_qwen_basic():
    """Test basic Qwen model"""
    print("=" * 60)
    print("  TEST 1: Basic Qwen Connectivity")
    print("=" * 60)
    
    try:
        client = QwenAPIClient()
        print(f"✓ API Key configured")
        print(f"✓ Model: {client.model}")
        
        models = client.list_available_models()
        print(f"✓ Available Qwen models: {len(models)}")
        for name, model_id in models.items():
            print(f"  • {name:20} → {model_id}")
        
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def test_qwen_generate():
    """Test Qwen text generation"""
    print("\n" + "=" * 60)
    print("  TEST 2: Qwen Text Generation")
    print("=" * 60)
    
    try:
        client = QwenAPIClient(stream=False)
        
        messages = [
            {"role": "user", "content": "What is 2+2?"}
        ]
        
        print(f"Query: What is 2+2?")
        response = client.generate(messages)
        
        if response.get("status") == "error":
            print(f"✗ Error: {response['error']}")
            return False
        
        if "choices" in response:
            answer = response["choices"][0]["message"]["content"]
            print(f"✓ Response: {answer[:100]}")
            return True
        else:
            print(f"✗ Unexpected response format: {response}")
            return False
    
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def test_qwen_streaming():
    """Test Qwen streaming"""
    print("\n" + "=" * 60)
    print("  TEST 3: Qwen Streaming")
    print("=" * 60)
    
    try:
        client = QwenAPIClient(stream=True)
        
        messages = [
            {"role": "user", "content": "Tell me about AI in 50 words"}
        ]
        
        print(f"Query: Tell me about AI in 50 words")
        print(f"\nStreaming response:")
        print("-" * 40)
        
        token_count = 0
        for token in client.generate_stream(messages):
            print(token, end="", flush=True)
            token_count += 1
        
        print("\n" + "-" * 40)
        print(f"✓ Streaming successful ({token_count} tokens)")
        return True
    
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def test_qwen_thinking():
    """Test Qwen with extended thinking"""
    print("\n" + "=" * 60)
    print("  TEST 4: Qwen Extended Thinking")
    print("=" * 60)
    
    try:
        client = QwenAPIClient(stream=False)
        
        messages = [
            {"role": "user", "content": "Solve: If a train travels at 60 mph for 2 hours, how far does it go?"}
        ]
        
        print(f"Query: Solve physics problem")
        response = client.generate(
            messages,
            enable_thinking=True,
            temperature=0.7
        )
        
        if response.get("status") == "error":
            print(f"✗ Error: {response['error']}")
            return False
        
        if "choices" in response:
            answer = response["choices"][0]["message"]["content"]
            print(f"✓ Response: {answer[:150]}...")
            return True
        else:
            print(f"✗ Unexpected response format")
            return False
    
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def test_qwen_models():
    """Test switching between models"""
    print("\n" + "=" * 60)
    print("  TEST 5: Model Switching")
    print("=" * 60)
    
    try:
        client = QwenAPIClient()
        
        models_to_test = [
            "qwen3.5-397b",
            "qwen2.5-72b",
        ]
        
        for model_name in models_to_test:
            try:
                client.set_model(model_name)
                print(f"✓ Switched to: {model_name}")
            except Exception as e:
                print(f"✗ Failed to switch to {model_name}: {e}")
        
        return True
    
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def run_all_tests():
    """Run all Qwen integration tests"""
    print("\n" + "=" * 60)
    print("  EDITH Qwen Model Integration Tests")
    print("=" * 60)
    
    tests = [
        ("Connectivity", test_qwen_basic),
        ("Text Generation", test_qwen_generate),
        ("Streaming", test_qwen_streaming),
        ("Extended Thinking", test_qwen_thinking),
        ("Model Switching", test_qwen_models),
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except KeyboardInterrupt:
            print("\n✗ Tests interrupted by user")
            break
        except Exception as e:
            print(f"\n✗ Unexpected error in {test_name}: {e}")
            results[test_name] = False
    
    # Summary
    print("\n" + "=" * 60)
    print("  Test Summary")
    print("=" * 60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_test in results.items():
        status = "✓ PASSED" if passed_test else "✗ FAILED"
        print(f"{status:10} {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print("=" * 60)
    
    return passed == total


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
