#!/usr/bin/env python3
"""
EDITH 2.0 Vision API Diagnostic Tool
This script tests your NVIDIA Vision API setup and connectivity
"""

import asyncio
import sys
import requests
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from core.config import settings
from services.nvidia import NvidiaClient


def print_header(text: str):
    """Print a formatted header"""
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")


def print_status(success: bool, message: str):
    """Print a status message with color"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")


def check_env_vars():
    """Check if required environment variables are set"""
    print_header("Environment Variables Check")
    
    api_key = settings.NVIDIA_VISION_API_KEY
    base_url = settings.NVIDIA_BASE_URL
    
    api_key_set = bool(api_key and api_key.strip())
    url_set = bool(base_url and base_url.strip())
    
    print_status(api_key_set, f"NVIDIA_VISION_API_KEY: {'Set' if api_key_set else 'Not set'}")
    print_status(url_set, f"NVIDIA_BASE_URL: {base_url if url_set else 'Not set'}")
    
    if not api_key_set:
        print("\n⚠️  API Key missing. Add to backend/.env:")
        print("   NVIDIA_VISION_API_KEY=nvapi-YOUR_KEY_HERE")
    
    return api_key_set and url_set


def check_network():
    """Check if we can reach NVIDIA API"""
    print_header("Network Connectivity Check")
    
    try:
        response = requests.get(
            "https://integrate.api.nvidia.com/v1",
            timeout=5,
            allow_redirects=False
        )
        # 404 or 405 means server is reachable but endpoint doesn't exist
        reachable = response.status_code in [404, 405, 401, 403]
        print_status(reachable, f"NVIDIA API reachable: {response.status_code}")
        return reachable
    except requests.exceptions.Timeout:
        print_status(False, "NVIDIA API timeout (network slow or API down)")
        return False
    except requests.exceptions.ConnectionError:
        print_status(False, "Cannot reach NVIDIA API (no internet or API down)")
        return False
    except Exception as e:
        print_status(False, f"Network error: {str(e)}")
        return False


def check_api_key_format():
    """Check if API key format is valid"""
    print_header("API Key Format Check")
    
    api_key = settings.NVIDIA_VISION_API_KEY
    
    # NVIDIA API keys start with nvapi-
    valid_format = api_key.startswith("nvapi-") if api_key else False
    print_status(valid_format, "API Key format: nvapi-* pattern")
    
    if not valid_format:
        print("\n⚠️  API key should start with 'nvapi-'")
    
    return valid_format


def check_model_configuration():
    """Check if model is properly configured"""
    print_header("Model Configuration Check")
    
    client = NvidiaClient(
        api_key=settings.NVIDIA_VISION_API_KEY,
        base_url=settings.NVIDIA_BASE_URL
    )
    
    expected_model = "meta/llama-3.2-90b-vision-instruct"
    actual_model = client.vision_model
    
    matches = expected_model == actual_model
    print_status(matches, f"Vision Model: {actual_model}")
    
    if matches:
        print("   Model correctly configured for vision analysis")
    
    return matches


async def check_api_access():
    """Test actual API access with a simple request"""
    print_header("NVIDIA API Access Check")
    
    api_key = settings.NVIDIA_VISION_API_KEY
    base_url = settings.NVIDIA_BASE_URL
    
    if not api_key or not api_key.strip():
        print_status(False, "Cannot test API access without valid API key")
        return False
    
    client = NvidiaClient(api_key=api_key, base_url=base_url)
    
    try:
        # Try a simple text generation request
        print("Attempting to call NVIDIA API with test prompt...")
        response = await client.generate(
            prompt="Say 'Vision API is working' in one word.",
            stream=False
        )
        
        print_status(True, "API call successful!")
        print(f"   Response: {response[:100]}...")
        return True
        
    except requests.exceptions.HTTPError as e:
        if "404" in str(e) or "404" in str(e.response.status_code):
            print_status(False, "API returned 404 - Model may not be enabled for your account")
            print("\n⚠️  Action needed:")
            print("   1. Visit https://build.nvidia.com/meta/llama-3.2-90b-vision-instruct")
            print("   2. Ensure you have access to the model")
            print("   3. Generate a new API key if needed")
            print("   4. Update NVIDIA_VISION_API_KEY in backend/.env")
        else:
            print_status(False, f"API error: {str(e)[:100]}")
        return False
    
    except Exception as e:
        error_msg = str(e)
        print_status(False, f"API connection failed: {error_msg[:100]}")
        
        if "Connection" in error_msg or "Timeout" in error_msg:
            print("\n⚠️  Network issue - check your internet connection")
        
        return False


async def main():
    """Run all diagnostic checks"""
    print("\n")
    print("╔" + "="*58 + "╗")
    print("║" + " "*58 + "║")
    print("║" + "  EDITH 2.0 - NVIDIA Vision API Diagnostic".center(58) + "║")
    print("║" + " "*58 + "║")
    print("╚" + "="*58 + "╝")
    
    checks = {
        "Environment Variables": check_env_vars(),
        "Network Connectivity": check_network(),
        "API Key Format": check_api_key_format(),
        "Model Configuration": check_model_configuration(),
    }
    
    # Run async check
    api_access = await check_api_access()
    checks["NVIDIA API Access"] = api_access
    
    # Summary
    print_header("Diagnostic Summary")
    
    passed = sum(1 for v in checks.values() if v)
    total = len(checks)
    
    print(f"Tests Passed: {passed}/{total}\n")
    
    for check_name, result in checks.items():
        status = "✅" if result else "❌"
        print(f"{status} {check_name}")
    
    if passed == total:
        print("\n🎉 All checks passed! Vision API should be working.")
        return 0
    else:
        print("\n⚠️  Some checks failed. See details above.")
        print("\nCommon solutions:")
        print("1. Get API key: https://build.nvidia.com/meta/llama-3.2-90b-vision-instruct")
        print("2. Update .env: NVIDIA_VISION_API_KEY=nvapi-YOUR_KEY")
        print("3. Restart backend: pkill -f 'python.*main.py'")
        print("4. Check logs: docker logs edith-backend (if using Docker)")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
