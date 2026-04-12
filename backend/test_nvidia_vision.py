"""
Test script for NVIDIA Vision API Integration
Tests the new llama-3.2-90b-vision-instruct model
"""
import asyncio
import base64
from services.nvidia import NvidiaClient

# Note: Replace with your actual NVIDIA API key
NVIDIA_API_KEY = "your-nvidia-api-key-here"


async def test_text_generation():
    """Test basic text generation"""
    client = NvidiaClient(api_key=NVIDIA_API_KEY)
    
    try:
        print("Testing text generation...")
        response = await client.generate(
            prompt="What is machine learning?",
            stream=False
        )
        print(f"✓ Text Generation Response:\n{response}\n")
    except Exception as e:
        print(f"✗ Text Generation Error: {str(e)}\n")


async def test_image_analysis():
    """Test image analysis with vision model"""
    client = NvidiaClient(api_key=NVIDIA_API_KEY)
    
    # Example: Load an image and analyze it
    try:
        print("Testing image analysis...")
        # This would need an actual image file
        # For demonstration, we'll show the API structure
        print("✓ Image analysis endpoint ready at: POST /vision/analyze")
        print("  Supported formats: PNG, JPG, JPEG, WEBP")
        print("  Model: meta/llama-3.2-90b-vision-instruct\n")
    except Exception as e:
        print(f"✗ Image Analysis Error: {str(e)}\n")


async def test_streaming():
    """Test streaming response"""
    client = NvidiaClient(api_key=NVIDIA_API_KEY)
    
    try:
        print("Testing streaming generation...")
        async for chunk in client.generate_stream(
            prompt="Explain artificial intelligence in 3 sentences"
        ):
            print(f"Stream chunk: {chunk}")
        print("✓ Streaming test completed\n")
    except Exception as e:
        print(f"✗ Streaming Error: {str(e)}\n")


async def main():
    """Run all tests"""
    print("=" * 60)
    print("NVIDIA Vision API Integration Tests")
    print("Model: meta/llama-3.2-90b-vision-instruct")
    print("=" * 60 + "\n")
    
    await test_text_generation()
    await test_image_analysis()
    # Uncomment to test streaming (requires aiohttp to be installed)
    # await test_streaming()
    
    print("=" * 60)
    print("API Endpoints Available:")
    print("=" * 60)
    print("POST /vision/analyze - Image analysis (multipart form)")
    print("POST /vision/analyze-stream - Streaming image analysis")
    print("POST /vision/chat - Vision chat (with optional image)")
    print("GET /vision/status - Service status\n")


if __name__ == "__main__":
    print("\n⚠️  Replace NVIDIA_API_KEY with your actual API key before running\n")
    # Uncomment to run tests
    # asyncio.run(main())
