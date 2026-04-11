class RedisClient:
    def __init__(self, url: str):
        self.url = url

    async def ping(self) -> bool:
        return True
