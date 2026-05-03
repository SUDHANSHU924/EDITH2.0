class SupabaseClient:
    def __init__(self, url: str, key: str):
        self.url = url
        self.key = key

    async def health(self) -> bool:
        return True
