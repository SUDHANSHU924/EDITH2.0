class TavilyClient:
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def search(self, query: str) -> dict:
        return {"query": query, "results": []}
