class NvidiaClient:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url

    async def generate(self, prompt: str) -> str:
        return "NVIDIA stub response"
