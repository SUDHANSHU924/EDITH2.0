"""
Model Router - Intelligent model selection per task
Supports NVIDIA NIM API + DeepSeek V3/V4 + Mistral + Vision + Groq fallback
"""

import os
import requests
from openai import AsyncOpenAI, OpenAI
from groq import AsyncGroq, Groq
from dotenv import load_dotenv

load_dotenv()

# Primary: NVIDIA NIM + DeepSeek
NVIDIA_KEY = os.getenv("NVIDIA_API_KEY_MAIN", "")
NVIDIA_BASE = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")

# Fallback: Groq
GROQ_KEY = os.getenv("GROQ_API_KEY", "")

# Model-specific API Keys
NVIDIA_KEY_MISTRAL = os.getenv("NVIDIA_API_KEY_MISTRAL", "")
NVIDIA_KEY_VISION = os.getenv("NVIDIA_API_KEY_VISION", "")
NVIDIA_KEY_R1 = os.getenv("NVIDIA_API_KEY_R1", "")

# Model Configuration - Smart Selection
MODEL_CONFIG = {
    "core": {
        "nvidia": os.getenv("MODEL_MAIN", "deepseek-ai/deepseek-v3"),
        "groq": "llama-3.3-70b-versatile",
        "description": "Main conversational AI"
    },
    "planning": {
        "nvidia": os.getenv("MODEL_REASONING", "deepseek-ai/deepseek-r1-distill-llama-8b"),
        "groq": "deepseek-r1-distill-llama-70b",
        "description": "Deep reasoning + planning"
    },
    "code": {
        "nvidia": os.getenv("MODEL_CODE", "deepseek-ai/deepseek-coder-v2-236b-instruct"),
        "groq": "deepseek-r1-distill-llama-70b",
        "description": "Code generation + debugging"
    },
    "search": {
        "nvidia": os.getenv("MODEL_FAST", "meta/llama-3.3-70b-instruct"),
        "groq": "llama-3.1-70b-versatile",
        "description": "Web research + analysis"
    },
    "vision": {
        "nvidia": os.getenv("MODEL_VISION", "meta/llama-3.2-90b-vision-instruct"),
        "groq": "llama-3.2-90b-vision-preview",
        "description": "Image analysis + OCR",
        "api_key": NVIDIA_KEY_VISION,
        "method": "requests"
    },
    "multilingual": {
        "nvidia": os.getenv("MODEL_MULTILINGUAL", "qwen/qwen2.5-72b-instruct"),
        "groq": "llama-3.3-70b-versatile",
        "description": "50+ languages support"
    },
    "advanced": {
        "nvidia": os.getenv("MODEL_CLAUDE", "deepseek-ai/deepseek-v4-pro"),
        "groq": "llama-3.3-70b-versatile",
        "description": "Complex reasoning tasks"
    },
    "files": {
        "nvidia": os.getenv("MODEL_FILE_GEN", "mistralai/mistral-large-3-675b-instruct-2512"),
        "groq": "llama-3.3-70b-versatile",
        "description": "Document generation",
        "api_key": NVIDIA_KEY_MISTRAL,
        "method": "requests"
    },
    "security": {
        "nvidia": "deepseek-ai/deepseek-r1-distill-llama-8b",
        "groq": "deepseek-r1-distill-llama-70b",
        "description": "Security & threat analysis",
        "api_key": NVIDIA_KEY_R1
    },
    "daily": {
        "nvidia": "meta/llama-3.3-70b-instruct",
        "groq": "llama-3.3-70b-versatile",
        "description": "General tasks"
    },
    "qwen": {
        "nvidia": os.getenv("MODEL_QWEN_ADVANCED", "qwen/qwen3.5-397b-a17b"),
        "groq": "llama-3.3-70b-versatile",
        "description": "Qwen advanced reasoning with thinking"
    },
    "qwen_standard": {
        "nvidia": os.getenv("MODEL_QWEN_STANDARD", "qwen/qwen2.5-72b-instruct"),
        "groq": "llama-3.3-70b-versatile",
        "description": "Qwen standard multilingual"
    },
    "qwen_compact": {
        "nvidia": os.getenv("MODEL_QWEN_COMPACT", "qwen/qwen2.5-32b-instruct"),
        "groq": "llama-3.3-70b-versatile",
        "description": "Qwen compact efficient model"
    }
}


class ModelRouter:
    """Route requests to optimal models based on task type"""

    def __init__(self):
        self.nvidia_client = None
        self.nvidia_sync_client = None
        self.groq_client = None
        self.groq_sync_client = None
        self._setup_clients()

    def _setup_clients(self):
        """Initialize API clients"""
        if NVIDIA_KEY:
            try:
                self.nvidia_client = AsyncOpenAI(
                    base_url=NVIDIA_BASE,
                    api_key=NVIDIA_KEY,
                    timeout=60.0
                )
                self.nvidia_sync_client = OpenAI(
                    base_url=NVIDIA_BASE,
                    api_key=NVIDIA_KEY,
                    timeout=60.0
                )
            except Exception as e:
                print(f"⚠️ NVIDIA client init failed: {e}")

        if GROQ_KEY:
            try:
                self.groq_client = AsyncGroq(
                    api_key=GROQ_KEY,
                    timeout=60.0
                )
                self.groq_sync_client = Groq(
                    api_key=GROQ_KEY,
                    timeout=60.0
                )
            except Exception as e:
                print(f"⚠️ Groq client init failed: {e}")

    def get_model(self, system: str = "core") -> tuple:
        """
        Returns (client, model_name, provider)
        
        Args:
            system: Task type (core, code, search, etc.)
        
        Returns:
            (client, model_name, provider_name)
        """
        config = MODEL_CONFIG.get(system, MODEL_CONFIG["core"])
        
        # Priority: NVIDIA NIM > Groq
        if self.nvidia_client and NVIDIA_KEY:
            return self.nvidia_client, config["nvidia"], "nvidia"
        elif self.groq_client and GROQ_KEY:
            return self.groq_client, config["groq"], "groq"
        else:
            raise Exception(
                "❌ No API keys configured. "
                "Set NVIDIA_API_KEY_MAIN or GROQ_API_KEY"
            )

    def get_sync_client(self, system: str = "core") -> tuple:
        """Synchronous version of get_model"""
        config = MODEL_CONFIG.get(system, MODEL_CONFIG["core"])
        
        if self.nvidia_sync_client and NVIDIA_KEY:
            return self.nvidia_sync_client, config["nvidia"], "nvidia"
        elif self.groq_sync_client and GROQ_KEY:
            return self.groq_sync_client, config["groq"], "groq"
        else:
            raise Exception("No API keys configured")

    async def generate(
        self,
        messages: list,
        system: str = "core",
        max_tokens: int = 1024,
        temperature: float = 0.7,
        stream: bool = False
    ):
        """
        Generate response using optimal model
        
        Args:
            messages: Chat messages
            system: Task type
            max_tokens: Max output tokens
            temperature: Sampling temperature
            stream: Enable streaming
        
        Returns:
            Chat completion response
        """
        client, model, provider = self.get_model(system)
        
        try:
            response = await client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                stream=stream
            )
            return response
        except Exception as e:
            print(f"❌ {provider} error: {e}")
            # Fallback to other provider
            if provider == "nvidia" and self.groq_client:
                config = MODEL_CONFIG.get(system, MODEL_CONFIG["core"])
                response = await self.groq_client.chat.completions.create(
                    model=config["groq"],
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    stream=stream
                )
                return response
            raise

    def generate_sync(
        self,
        messages: list,
        system: str = "core",
        max_tokens: int = 1024,
        temperature: float = 0.7
    ):
        """Synchronous response generation"""
        client, model, provider = self.get_sync_client(system)
        
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                stream=False
            )
            return response
        except Exception as e:
            print(f"❌ {provider} error: {e}")
            if provider == "nvidia" and self.groq_sync_client:
                config = MODEL_CONFIG.get(system, MODEL_CONFIG["core"])
                response = self.groq_sync_client.chat.completions.create(
                    model=config["groq"],
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=temperature
                )
                return response
            raise

    async def generate_stream(
        self,
        messages: list,
        system: str = "core",
        max_tokens: int = 1024
    ):
        """Stream tokens from optimal model"""
        client, model, provider = self.get_model(system)
        
        try:
            stream = await client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                stream=True
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta
                if hasattr(delta, 'content') and delta.content:
                    yield delta.content
        except Exception as e:
            print(f"❌ {provider} stream error: {e}")
            if provider == "nvidia" and self.groq_client:
                config = MODEL_CONFIG.get(system, MODEL_CONFIG["core"])
                stream = await self.groq_client.chat.completions.create(
                    model=config["groq"],
                    messages=messages,
                    max_tokens=max_tokens,
                    stream=True
                )
                async for chunk in stream:
                    delta = chunk.choices[0].delta
                    if hasattr(delta, 'content') and delta.content:
                        yield delta.content
            else:
                raise

    def status(self) -> dict:
        """Get router status and available models"""
        return {
            "nvidia": bool(self.nvidia_client),
            "groq": bool(self.groq_client),
            "primary": "nvidia" if self.nvidia_client else "groq",
            "models": {
                k: {
                    "provider": "nvidia" if self.nvidia_client else "groq",
                    "model": v["nvidia"] if self.nvidia_client else v["groq"],
                    "description": v["description"]
                }
                for k, v in MODEL_CONFIG.items()
            }
        }

    def list_models(self) -> dict:
        """List all configured models"""
        return {
            "nvidia_models": {
                k: v["nvidia"] for k, v in MODEL_CONFIG.items()
            },
            "groq_models": {
                k: v["groq"] for k, v in MODEL_CONFIG.items()
            }
        }

    def call_mistral_requests(
        self,
        messages: list,
        max_tokens: int = 2048,
        temperature: float = 0.15,
        top_p: float = 1.0,
        stream: bool = True
    ):
        """Call Mistral Large 3 via requests library"""
        invoke_url = f"{NVIDIA_BASE}/chat/completions"
        headers = {
            "Authorization": f"Bearer {NVIDIA_KEY_MISTRAL}",
            "Accept": "text/event-stream" if stream else "application/json"
        }
        payload = {
            "model": "mistralai/mistral-large-3-675b-instruct-2512",
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "top_p": top_p,
            "frequency_penalty": 0.0,
            "presence_penalty": 0.0,
            "stream": stream
        }
        try:
            response = requests.post(invoke_url, headers=headers, json=payload)
            response.raise_for_status()
            return response
        except Exception as e:
            print(f"❌ Mistral error: {e}")
            raise

    def call_vision_requests(
        self,
        messages: list,
        max_tokens: int = 512,
        temperature: float = 1.0,
        top_p: float = 1.0,
        stream: bool = True
    ):
        """Call Llama 3.2 90B Vision via requests library"""
        invoke_url = f"{NVIDIA_BASE}/chat/completions"
        headers = {
            "Authorization": f"Bearer {NVIDIA_KEY_VISION}",
            "Accept": "text/event-stream" if stream else "application/json"
        }
        payload = {
            "model": "meta/llama-3.2-90b-vision-instruct",
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "top_p": top_p,
            "frequency_penalty": 0.0,
            "presence_penalty": 0.0,
            "stream": stream
        }
        try:
            response = requests.post(invoke_url, headers=headers, json=payload)
            response.raise_for_status()
            return response
        except Exception as e:
            print(f"❌ Vision error: {e}")
            raise

    def call_deepseek_v4_pro(
        self,
        messages: list,
        max_tokens: int = 16384,
        temperature: float = 1.0,
        top_p: float = 0.95,
        thinking: bool = False,
        stream: bool = True
    ):
        """Call DeepSeek V4 Pro with OpenAI client"""
        try:
            response = self.nvidia_sync_client.chat.completions.create(
                model="deepseek-ai/deepseek-v4-pro",
                messages=messages,
                temperature=temperature,
                top_p=top_p,
                max_tokens=max_tokens,
                extra_body={"chat_template_kwargs": {"thinking": thinking}},
                stream=stream
            )
            return response
        except Exception as e:
            print(f"❌ DeepSeek V4 error: {e}")
            raise

    def call_deepseek_r1(
        self,
        messages: list,
        max_tokens: int = 4096,
        temperature: float = 0.6,
        top_p: float = 0.7,
        stream: bool = True
    ):
        """Call DeepSeek R1 with OpenAI client"""
        try:
            response = self.nvidia_sync_client.chat.completions.create(
                model="deepseek-ai/deepseek-r1-distill-llama-8b",
                messages=messages,
                temperature=temperature,
                top_p=top_p,
                max_tokens=max_tokens,
                stream=stream
            )
            return response
        except Exception as e:
            print(f"❌ DeepSeek R1 error: {e}")
            raise


# Global router instance
router = ModelRouter()

# For backwards compatibility
__all__ = ["router", "ModelRouter", "MODEL_CONFIG"]
