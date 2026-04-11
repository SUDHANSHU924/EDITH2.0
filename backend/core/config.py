from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    NVIDIA_API_KEY: str = ""
    NVIDIA_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NVIDIA_MODEL_MAIN: str = "deepseek-ai/deepseek-r1"
    NVIDIA_MODEL_CODE: str = "deepseek-ai/deepseek-coder-v2"
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    HUGGINGFACE_API_KEY: str = ""

    TAVILY_API_KEY: str = ""

    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    REDIS_URL: str = "redis://localhost:6379"
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8001

    HACKER_MODE_TOKEN: str = ""
    SATELLITE_MODE_TOKEN: str = ""

    CLIENT_URL: str = "http://localhost:3000"
    PORT: int = 8000

    class Config:
        env_file = ".env"


settings = Settings()
