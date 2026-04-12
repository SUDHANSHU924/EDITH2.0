from pydantic_settings import BaseSettings
import os
from pathlib import Path


class Settings(BaseSettings):
    # NVIDIA API Configuration
    NVIDIA_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    
    # Department-Specific NVIDIA API Keys
    NVIDIA_CORE_API_KEY: str = ""
    NVIDIA_PLANNING_API_KEY: str = ""
    NVIDIA_CODE_API_KEY: str = ""
    NVIDIA_FILES_API_KEY: str = ""
    NVIDIA_SEARCH_API_KEY: str = ""
    NVIDIA_LEARNING_API_KEY: str = ""
    NVIDIA_ML_API_KEY: str = ""
    NVIDIA_IOT_API_KEY: str = ""
    NVIDIA_VISION_API_KEY: str = ""
    NVIDIA_VOICE_API_KEY: str = ""
    NVIDIA_PERSONAL_API_KEY: str = ""
    NVIDIA_SECURITY_API_KEY: str = ""
    NVIDIA_DAILY_API_KEY: str = ""
    NVIDIA_SECURITY_GRID_API_KEY: str = ""
    NVIDIA_SATELLITE_API_KEY: str = ""

    # Optional Services
    HUGGINGFACE_API_KEY: str = ""

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    TAVILY_API_KEY: str = ""

    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    NEXT_PUBLIC_SUPABASE_URL: str = ""
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: str = ""
    REDIS_URL: str = "redis://localhost:6379"
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8001

    HACKER_MODE_TOKEN: str = ""
    SATELLITE_MODE_TOKEN: str = ""

    CLIENT_URL: str = "http://localhost:3000"
    PORT: int = 8000
    MAX_FILE_SIZE_MB: int = 50

    class Config:
        # Use absolute path to ensure .env file is found regardless of cwd
        env_file = str(Path(__file__).parent.parent / ".env")


settings = Settings()
