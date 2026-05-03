class QueueClient:
    def __init__(self, url: str):
        self.url = url

    async def enqueue(self, task: dict) -> bool:
        return True
