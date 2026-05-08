#!/usr/bin/env python3
"""
Test available models on NVIDIA API to find Claude alternative
"""
import sys
sys.path.insert(0, '/workspaces/EDITH2.0/artifacts/jarvis-api')

from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv('/workspaces/EDITH2.0/artifacts/jarvis-api/.env')

nvidia_base = os.getenv("NVIDIA_BASE_URL")
nvidia_key = os.getenv("NVIDIA_API_KEY_MAIN")

print("\n" + "=" * 80)
print("CLAUDE ISSUE ANALYSIS - NVIDIA API CHECK")
print("=" * 80)

print("\n[Analysis] Why Claude returned 404...")
print("""
The issue: anthropic/claude-3-5-sonnet is NOT available on NVIDIA's API
  
NVIDIA provides these model families:
  • DeepSeek (V3, V4, R1, Coder, Math)
  • Llama (3.3, 3.2, 3.1 including Vision)
  • Qwen (2.5, 3.5)
  • Mistral
  • And others...

But NOT: Claude (Anthropic only provides via their own API)

Solution Options:
  1. Use actual Anthropic API (requires Anthropic API key)
  2. Use Llama as Claude alternative (works via NVIDIA)
  3. Use DeepSeek V4 as advanced model (already configured)
""")

print("\n[Test] Trying compatible models on NVIDIA...")

client = OpenAI(
    base_url=nvidia_base,
    api_key=nvidia_key,
    timeout=30.0
)

# Test with models that should work
test_models = [
    "deepseek-ai/deepseek-v4-pro",
    "meta/llama-3.3-70b-instruct",
    "meta/llama-3.2-90b-vision-instruct",
    "anthropic/claude-3-5-sonnet"  # This will fail
]

print("\nTesting model availability:")
for model in test_models:
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": "test"}],
            max_tokens=1
        )
        print(f"  ✅ {model}: AVAILABLE")
    except Exception as e:
        if "404" in str(e):
            print(f"  ❌ {model}: NOT FOUND")
        elif "401" in str(e):
            print(f"  ⚠️  {model}: UNAUTHORIZED")
        else:
            print(f"  ⚠️  {model}: {type(e).__name__}")

print("\n" + "=" * 80)
print("SOLUTION: Update Claude Configuration")
print("=" * 80)

print("""
OPTION A: Use DeepSeek V4 as 'advanced' model (RECOMMENDED)
─────────────────────────────────────────────────────────────
  • Supports complex reasoning
  • Supports extended thinking mode
  • Already on NVIDIA
  • No change needed - it's already set as MODEL_MAIN

OPTION B: Use Llama 3.3 as advanced model
─────────────────────────────────────────────────────────────
  • Excellent reasoning capabilities
  • Multilingual support
  • Already on NVIDIA
  • Update: MODEL_CLAUDE=meta/llama-3.3-70b-instruct

OPTION C: Use actual Anthropic API for Claude
───────────────────────────────────────────────
  Requirements:
    1. Get Anthropic API key from https://console.anthropic.com/
    2. Update .env with ANTHROPIC_API_KEY
    3. Create separate client for Anthropic
    4. Update model_router to use Anthropic client for 'advanced' task
    
  Implementation: See example below
""")

print("\n" + "=" * 80)
print("RECOMMENDED FIX")
print("=" * 80)

print("""
Since you already have DeepSeek V4 Pro configured:
  ✅ It supports advanced reasoning
  ✅ It's already on NVIDIA
  ✅ No additional configuration needed
  ✅ Works with OpenAI client
  
ACTION: 
  Simply use router.get_sync_client('advanced') 
  and it will use DeepSeek V4 Pro which is perfect for complex tasks!

Alternative: If you want actual Claude, add Anthropic integration:

# In .env:
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Then in model_router, add:
from anthropic import Anthropic, AsyncAnthropic

# And create a separate method for Claude...
""")

print("=" * 80 + "\n")
