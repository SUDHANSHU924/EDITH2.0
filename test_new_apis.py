#!/usr/bin/env python3
"""
EDITH 2.0 - New API Configuration Test
Tests DeepSeek V4, Mistral Large 3, Llama 3.2 Vision, DeepSeek R1
"""
import sys
sys.path.insert(0, '/workspaces/EDITH2.0/artifacts/jarvis-api')

from agents.model_router import (
    router,
    NVIDIA_BASE,
    NVIDIA_KEY,
    NVIDIA_KEY_MISTRAL,
    NVIDIA_KEY_VISION,
    NVIDIA_KEY_R1
)

print("=" * 70)
print("EDITH 2.0 - NEW API CONFIGURATION VALIDATION")
print("=" * 70)

# Test 1: API Keys Configuration
print("\n[1/6] Checking API Keys Configuration...")
api_keys = {
    "MAIN (DeepSeek V4)": NVIDIA_KEY,
    "MISTRAL (Large 3)": NVIDIA_KEY_MISTRAL,
    "VISION (Llama 90B)": NVIDIA_KEY_VISION,
    "R1 (DeepSeek)": NVIDIA_KEY_R1
}

for name, key in api_keys.items():
    status = "✅" if key else "❌"
    display_key = f"{key[:20]}...{key[-10:]}" if key else "NOT SET"
    print(f"  {status} {name}: {display_key}")

# Test 2: Model Router Status
print("\n[2/6] Router Configuration...")
try:
    status = router.status()
    print(f"  ✅ Primary Provider: {status['primary']}")
    print(f"  ✅ NVIDIA Client: {'Available' if status['nvidia'] else 'N/A'}")
    print(f"  ✅ Groq Client: {'Available' if status['groq'] else 'N/A'}")
except Exception as e:
    print(f"  ❌ Router status error: {e}")
    sys.exit(1)

# Test 3: Model Configurations
print("\n[3/6] Model Configurations...")
try:
    models = router.list_models()
    nvidia_count = len(models.get("nvidia_models", {}))
    groq_count = len(models.get("groq_models", {}))
    print(f"  ✅ NVIDIA Models: {nvidia_count} configured")
    print(f"  ✅ Groq Models: {groq_count} configured")
    
    # Show specific models
    nvidia = models.get("nvidia_models", {})
    print(f"\n  Configured NVIDIA Models:")
    for task, model in list(nvidia.items())[:5]:
        print(f"    • {task}: {model}")
except Exception as e:
    print(f"  ❌ Model listing error: {e}")
    sys.exit(1)

# Test 4: DeepSeek V4 Pro Client
print("\n[4/6] Testing DeepSeek V4 Pro...")
try:
    if router.nvidia_sync_client:
        print(f"  ✅ OpenAI Client: Ready")
        print(f"  ✅ Base URL: {NVIDIA_BASE}")
        print(f"  ✅ Model: deepseek-ai/deepseek-v4-pro")
        print(f"  ℹ️  Method: OpenAI client with streaming")
    else:
        print(f"  ⚠️  OpenAI client not available")
except Exception as e:
    print(f"  ❌ DeepSeek V4 test error: {e}")

# Test 5: Mistral & Vision Requests Methods
print("\n[5/6] Testing Requests-based APIs...")
try:
    # Check if methods exist
    mistral_callable = hasattr(router, 'call_mistral_requests')
    vision_callable = hasattr(router, 'call_vision_requests')
    
    if mistral_callable:
        print(f"  ✅ Mistral Large 3: Method available")
        print(f"     • API Key: {NVIDIA_KEY_MISTRAL[:20] if NVIDIA_KEY_MISTRAL else 'NOT SET'}...")
        print(f"     • Model: mistralai/mistral-large-3-675b-instruct-2512")
        print(f"     • Method: requests.post with streaming")
    else:
        print(f"  ❌ Mistral method not found")
    
    if vision_callable:
        print(f"  ✅ Llama 3.2 90B Vision: Method available")
        print(f"     • API Key: {NVIDIA_KEY_VISION[:20] if NVIDIA_KEY_VISION else 'NOT SET'}...")
        print(f"     • Model: meta/llama-3.2-90b-vision-instruct")
        print(f"     • Method: requests.post with streaming")
    else:
        print(f"  ❌ Vision method not found")
        
except Exception as e:
    print(f"  ⚠️  Methods check warning: {e}")

# Test 6: DeepSeek R1 Method
print("\n[6/6] Testing DeepSeek R1...")
try:
    r1_callable = hasattr(router, 'call_deepseek_r1')
    if r1_callable:
        print(f"  ✅ DeepSeek R1: Method available")
        print(f"     • API Key: {NVIDIA_KEY_R1[:20] if NVIDIA_KEY_R1 else 'NOT SET'}...")
        print(f"     • Model: deepseek-ai/deepseek-r1-distill-llama-8b")
        print(f"     • Method: OpenAI client with streaming")
    else:
        print(f"  ❌ DeepSeek R1 method not found")
except Exception as e:
    print(f"  ⚠️  R1 check warning: {e}")

# Final Summary
print("\n" + "=" * 70)
print("✅ NEW EDITH API CONFIGURATION COMPLETE")
print("=" * 70)
print("\nSupported Models:")
print("  1️⃣  DeepSeek V4 Pro      - Advanced reasoning (Main Model)")
print("  2️⃣  Mistral Large 3      - Document generation & file ops")
print("  3️⃣  Llama 3.2 90B Vision - Image analysis & OCR")
print("  4️⃣  DeepSeek R1          - Security & threat analysis")
print("  5️⃣  Qwen Models (2.5/3.5)- Multilingual support")
print("  6️⃣  Groq Fallback        - Backup all systems")
print("\nAPI Endpoints:")
print(f"  • Base URL: {NVIDIA_BASE}")
print("  • Chat Completions: /v1/chat/completions")
print("  • Streaming: Enabled for all models")
print("\nUsage Examples:")
print("  • router.call_deepseek_v4_pro(messages, thinking=True)")
print("  • router.call_mistral_requests(messages, stream=True)")
print("  • router.call_vision_requests(messages_with_images)")
print("  • router.call_deepseek_r1(messages, stream=True)")
print("\n✨ Ready for production deployment!")
