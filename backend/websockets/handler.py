from fastapi import WebSocket
from typing import Dict


class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, WebSocket] = {}

    async def connect(self, ws: WebSocket, sid: str):
        await ws.accept()
        self.active[sid] = ws
        await self.send(sid, {"type": "connected", "message": "EDITH WebSocket established"})

    async def disconnect(self, sid: str):
        if sid in self.active:
            del self.active[sid]

    async def send(self, sid: str, data: dict):
        if sid in self.active:
            await self.active[sid].send_json(data)

    async def broadcast(self, data: dict):
        for ws in self.active.values():
            await ws.send_json(data)


manager = ConnectionManager()


async def websocket_endpoint(ws: WebSocket, sid: str):
    await manager.connect(ws, sid)
    try:
        while True:
            data = await ws.receive_json()
            await manager.send(sid, {"type": "echo", "data": data})
    except Exception:
        await manager.disconnect(sid)
