#!/usr/bin/env python3
"""
EDITH 2.0 Agentic Upgrade - Comprehensive Test Suite
Tests model routing, language detection, and tool execution
"""

import asyncio
import sys
import os

# Add agents to path
sys.path.insert(0, '/workspaces/EDITH2.0/artifacts/jarvis-api')

from agents.model_router import router
from agents.agentic_core import edith


def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)


async def test_model_router():
    """Test model routing"""
    print_section("TEST 1: Model Router")
    
    status = router.status()
    print(f"✓ Primary Provider: {status['primary']}")
    print(f"✓ NVIDIA Available: {status['nvidia']}")
    print(f"✓ Groq Available: {status['groq']}")
    
    print(f"\nAvailable Models by System:")
    for system, config in status['models'].items():
        model = config['model']
        print(f"  • {system:15} → {model[:50]}")


async def test_language_detection():
    """Test language detection"""
    print_section("TEST 2: Language Detection")
    
    tests = [
        ("What time is it?", "english"),
        ("क्या समय है?", "hindi"),
        ("Kya time hai?", "hinglish"),
        ("Open YouTube", "english"),
        ("YouTube kholo", "hinglish"),
        ("यूट्यूब खोलो", "hindi"),
    ]
    
    for text, expected_lang in tests:
        detected = edith.detect_language(text)
        status = "✓" if detected == expected_lang else "✗"
        print(f"{status} '{text[:30]:<30}' → {detected:10} (expected: {expected_lang})")


async def test_system_detection():
    """Test task system detection"""
    print_section("TEST 3: System Detection")
    
    tests = [
        ("Write Python function", "code"),
        ("Search latest AI news", "search"),
        ("Plan a project", "planning"),
        ("Create document", "files"),
        ("Analyze this image", "vision"),
        ("Take screenshot", "os_control"),
        ("Hello, how are you?", "core"),
    ]
    
    for text, expected_sys in tests:
        detected = edith.detect_system(text)
        status = "✓" if detected == expected_sys else "✗"
        print(f"{status} '{text[:30]:<30}' → {detected:12} (expected: {expected_sys})")


async def test_agentic_core():
    """Test agentic core processing"""
    print_section("TEST 4: Agentic Core Processing")
    
    test_inputs = [
        "What's 2+2?",
        "YouTube kholo",
        "Tell me about AI",
    ]
    
    for user_input in test_inputs:
        print(f"\n📝 Input: '{user_input}'")
        try:
            result = await edith.process(user_input, session_id="test")
            print(f"   Language: {result.get('language', 'unknown')}")
            print(f"   System: {result.get('system', 'unknown')}")
            print(f"   Tools Executed: {len(result.get('tools_executed', []))}")
            print(f"   Reply: {result.get('reply', 'No reply')[:80]}...")
        except Exception as e:
            print(f"   ✗ Error: {str(e)[:100]}")


def test_agent_status():
    """Test agent status"""
    print_section("TEST 5: Agent Status")
    
    status = edith.get_status()
    print(f"Active System: {status['active_system']}")
    print(f"Current Language: {status['current_language']}")
    print(f"Conversation Turns: {status['conversation_turns']}")
    print(f"Tasks Completed: {status['tasks_completed']}")
    print(f"Available Systems: {', '.join(status['available_systems'])}")


async def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("  EDITH 2.0 ADVANCED AGENTIC UPGRADE - TEST SUITE")
    print("="*60)
    
    try:
        # Test 1: Model Router
        await test_model_router()
        
        # Test 2: Language Detection
        await test_language_detection()
        
        # Test 3: System Detection
        await test_system_detection()
        
        # Test 4: Agentic Core (requires API)
        print_section("TEST 4: Agentic Core Processing")
        print("⚠️  Skipping (requires live API - test manually)")
        
        # Test 5: Agent Status
        test_agent_status()
        
        print_section("TEST SUMMARY")
        print("✅ All tests completed!")
        print("\n📋 Next Steps:")
        print("   1. Start backend: cd artifacts/jarvis-api && python main.py")
        print("   2. Start frontend: cd artifacts/edith && npm run dev")
        print("   3. Test voice commands in browser")
        print("   4. Try multilingual inputs (Hindi/Hinglish/English)")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
