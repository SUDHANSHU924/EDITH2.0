"""
EDITH Desktop Control Router
WebSocket relay between EDITH brain and the local desktop agent running on user's machine.
"""

import asyncio
import json
import uuid
from typing import Optional

import os
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from pydantic import BaseModel

router = APIRouter()

_agent_ws: Optional[WebSocket] = None
_pending: dict[str, "asyncio.Future[dict]"] = {}
_command_log: list[dict] = []


class DesktopCommand(BaseModel):
    action: str
    params: dict = {}


@router.get("/download-agent")
async def download_agent():
    agent_path = os.path.join(os.path.dirname(__file__), "..", "desktop_agent.py")
    agent_path = os.path.abspath(agent_path)
    if not os.path.exists(agent_path):
        from fastapi import HTTPException
        raise HTTPException(404, "Agent script not found")
    return FileResponse(agent_path, filename="edith_desktop_agent.py", media_type="text/x-python")


@router.get("/status")
async def desktop_status():
    return {
        "connected": _agent_ws is not None,
        "recent_commands": _command_log[-10:],
    }


@router.post("/command")
async def send_desktop_command(cmd: DesktopCommand):
    global _agent_ws
    if _agent_ws is None:
        return {
            "error": "Desktop agent not connected",
            "hint": "Download edith_desktop_agent.py and run: python edith_desktop_agent.py --url wss://YOUR_URL/api/desktop/ws",
        }

    cmd_id = str(uuid.uuid4())[:8]
    loop = asyncio.get_event_loop()
    future: asyncio.Future = loop.create_future()
    _pending[cmd_id] = future

    log_entry = {"cmd_id": cmd_id, "action": cmd.action, "params": cmd.params, "status": "pending"}
    _command_log.append(log_entry)
    if len(_command_log) > 50:
        _command_log.pop(0)

    try:
        await _agent_ws.send_text(json.dumps({
            "cmd_id": cmd_id,
            "action": cmd.action,
            "params": cmd.params,
        }))
        result = await asyncio.wait_for(future, timeout=30.0)
        log_entry["status"] = "done"
        log_entry["result"] = str(result)[:120]
        return {"success": True, "result": result}

    except asyncio.TimeoutError:
        log_entry["status"] = "timeout"
        return {"error": "Command timed out — desktop agent may be busy"}
    except Exception as e:
        log_entry["status"] = "error"
        return {"error": str(e)}
    finally:
        _pending.pop(cmd_id, None)


@router.websocket("/ws")
async def desktop_agent_websocket(ws: WebSocket):
    global _agent_ws
    await ws.accept()
    _agent_ws = ws
    print("[DESKTOP AGENT] Connected — EDITH has desktop control")

    try:
        while True:
            raw = await ws.receive_text()
            data = json.loads(raw)
            msg_type = data.get("type")

            if msg_type == "result":
                cmd_id = data.get("cmd_id")
                if cmd_id and cmd_id in _pending:
                    fut = _pending[cmd_id]
                    if not fut.done():
                        fut.set_result(data.get("result", {}))

            elif msg_type == "ping":
                await ws.send_text(json.dumps({"type": "pong"}))

    except WebSocketDisconnect:
        print("[DESKTOP AGENT] Disconnected")
    except Exception as e:
        print(f"[DESKTOP AGENT] Error: {e}")
    finally:
        _agent_ws = None
        for fut in list(_pending.values()):
            if not fut.done():
                fut.set_exception(Exception("Desktop agent disconnected"))
        _pending.clear()
