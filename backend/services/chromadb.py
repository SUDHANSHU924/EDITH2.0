class ChromaClient:
    def __init__(self, host: str, port: int):
        self.host = host
        self.port = port

    async def heartbeat(self) -> bool:
        return True
