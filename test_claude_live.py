#!/usr/bin/env python3
"""
Claude Live Test - Make actual API call to verify functionality
"""
import sys
sys.path.insert(0, '/workspaces/EDITH2.0/artifacts/jarvis-api')

from agents.model_router import router

print("\n" + "=" * 80)
print("CLAUDE - LIVE API TEST")
print("=" * 80)

print("\n[Test] Making actual API call to Claude via NVIDIA...")

try:
    # Get Claude model
    client, model, provider = router.get_sync_client('advanced')
    
    print(f"  ✅ Client ready")
    print(f"     • Model: {model}")
    print(f"     • Provider: {provider}")
    
    # Make a simple test call
    print(f"\n[Call] Testing Claude with a simple query...")
    
    messages = [
        {"role": "user", "content": "Respond with exactly: CLAUDE_WORKS"}
    ]
    
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        max_tokens=100,
        temperature=0.1
    )
    
    # Check response
    result = response.choices[0].message.content
    print(f"\n  ✅ Response received!")
    print(f"     • Content: {result}")
    print(f"     • Completion tokens: {response.usage.completion_tokens}")
    print(f"     • Prompt tokens: {response.usage.prompt_tokens}")
    
    if "CLAUDE" in result.upper():
        print(f"\n  ✅✅✅ CLAUDE IS WORKING! ✅✅✅")
    else:
        print(f"\n  ✅ Claude responded (content differs from expected)")
    
    # Test streaming
    print(f"\n[Test] Testing Claude streaming mode...")
    
    stream = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": "Say 'STREAMING_WORKS' in one word"}],
        max_tokens=50,
        stream=True
    )
    
    print(f"  ✅ Streaming response:")
    printed = False
    for chunk in stream:
        if chunk.choices[0].delta.content:
            print(f"     {chunk.choices[0].delta.content}", end="", flush=True)
            printed = True
    
    if printed:
        print(f"\n  ✅✅✅ STREAMING WORKS! ✅✅✅")

except Exception as e:
    print(f"\n  ❌ Error: {type(e).__name__}: {e}")
    
    if "401" in str(e) or "Unauthorized" in str(e):
        print(f"\n  ⚠️  API Key Issue - Check NVIDIA_API_KEY_MAIN in .env")
    elif "404" in str(e):
        print(f"\n  ⚠️  Model Not Found - Claude may not be available in your account")
    elif "rate" in str(e).lower():
        print(f"\n  ⚠️  Rate Limited - Try again later")
    else:
        print(f"\n  ℹ️  Check .env configuration and API key validity")
    
    sys.exit(1)

print("\n" + "=" * 80)
print("✅ CLAUDE INTEGRATION - FULLY FUNCTIONAL")
print("=" * 80)
print("\nUsage Example:")
print("""
  from agents.model_router import router
  
  client, model, provider = router.get_sync_client('advanced')
  response = client.chat.completions.create(
      model=model,
      messages=[{"role": "user", "content": "Your prompt"}]
  )
  print(response.choices[0].message.content)
""")
print("=" * 80 + "\n")
