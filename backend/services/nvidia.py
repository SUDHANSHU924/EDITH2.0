import requests
import aiohttp
import json
import base64
from typing import Optional, AsyncGenerator


class NvidiaClient:
    def __init__(self, api_key: str, base_url: str = "https://integrate.api.nvidia.com/v1"):
        self.api_key = api_key
        self.base_url = base_url
        self.vision_model = "meta/llama-3.2-90b-vision-instruct"
        self.chat_model = "meta/llama-3.2-90b-vision-instruct"

    def _get_headers(self, stream: bool = False):
        """Generate request headers with proper content type"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "text/event-stream" if stream else "application/json"
        }

    async def generate(self, prompt: str, stream: bool = False) -> str:
        """Generate text response from NVIDIA API"""
        payload = {
            "model": self.chat_model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 512,
            "temperature": 0.7,
            "top_p": 0.9,
            "frequency_penalty": 0.0,
            "presence_penalty": 0.0,
            "stream": stream
        }

        url = f"{self.base_url}/chat/completions"
        headers = self._get_headers(stream=stream)

        if not stream:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        else:
            # For streaming, return empty string if streaming is not directly needed
            response = requests.post(url, headers=headers, json=payload, stream=True)
            response.raise_for_status()
            result = ""
            for line in response.iter_lines():
                if line:
                    data = line.decode("utf-8")
                    if data.startswith("data: "):
                        try:
                            chunk = json.loads(data[6:])
                            if "choices" in chunk and chunk["choices"][0]["delta"]["content"]:
                                result += chunk["choices"][0]["delta"]["content"]
                        except json.JSONDecodeError:
                            pass
            return result

    async def analyze_image(self, image_data: bytes, prompt: str, content_type: str = "image/jpeg", stream: bool = False) -> str:
        """Analyze image using NVIDIA vision model"""
        # Encode image to base64
        encoded_image = base64.b64encode(image_data).decode("utf-8")
        image_url = f"data:{content_type};base64,{encoded_image}"

        payload = {
            "model": self.vision_model,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt or "Describe the image in detail."},
                        {"type": "image_url", "image_url": {"url": image_url}}
                    ]
                }
            ],
            "max_tokens": 512,
            "temperature": 0.7,
            "top_p": 0.9,
            "frequency_penalty": 0.0,
            "presence_penalty": 0.0,
            "stream": stream
        }

        url = f"{self.base_url}/chat/completions"
        headers = self._get_headers(stream=stream)

        if not stream:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        else:
            response = requests.post(url, headers=headers, json=payload, stream=True)
            response.raise_for_status()
            result = ""
            for line in response.iter_lines():
                if line:
                    data = line.decode("utf-8")
                    if data.startswith("data: "):
                        try:
                            chunk = json.loads(data[6:])
                            if "choices" in chunk and chunk["choices"][0].get("delta", {}).get("content"):
                                result += chunk["choices"][0]["delta"]["content"]
                        except json.JSONDecodeError:
                            pass
            return result

    async def generate_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        """Generate streaming text response from NVIDIA API"""
        payload = {
            "model": self.chat_model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 512,
            "temperature": 0.7,
            "top_p": 0.9,
            "frequency_penalty": 0.0,
            "presence_penalty": 0.0,
            "stream": True
        }

        url = f"{self.base_url}/chat/completions"
        headers = self._get_headers(stream=True)

        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=payload) as response:
                response.raise_for_status()
                async for line in response.content:
                    if line:
                        data = line.decode("utf-8")
                        if data.startswith("data: "):
                            try:
                                chunk = json.loads(data[6:])
                                if "choices" in chunk and chunk["choices"][0].get("delta", {}).get("content"):
                                    yield chunk["choices"][0]["delta"]["content"]
                            except json.JSONDecodeError:
                                pass
