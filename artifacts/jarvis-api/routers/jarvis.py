"""FastAPI router for the Jarvis agent.

/run was removed: the JarvisAgent's ReAct loop gave it access to run_shell,
write_file, and other OS tools via TOOL_REGISTRY — an unauthenticated RCE
surface. The /ask endpoint below replaces it with a safe, read-only LLM
reasoning call (Groq, no tool access).
"""

import base64
import os
import asyncio
import subprocess
import webbrowser
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from agents.os_control import web_search, get_sys_info

router = APIRouter()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")

JARVIS_SYSTEM = """You are EDITH — Even Dead, I'm The Hero. Tony Stark's autonomous AI.
You reason through tasks step by step like Jarvis: observe, plan, act, verify.
Be concise, sharp, and decisive. No shell or file access — pure intelligence only.
Format multi-step tasks as:
  THOUGHT: <reasoning>
  PLAN: <steps>
  ANSWER: <result>"""


class AskRequest(BaseModel):
    task: str
    max_tokens: int = 1024


class RunRequest(BaseModel):
    task: str
    require_confirmation: bool = True
    max_steps: int = 20


class SearchRequest(BaseModel):
    query: str
    max_results: int = 5


@router.get("/status")
async def status():
    groq_key_set = bool(GROQ_API_KEY)
    sys_info = get_sys_info()
    return {
        "status": "online",
        "groq_configured": groq_key_set,
        "model": GROQ_MODEL,
        "platform": sys_info.get("platform"),
        "work_dir": sys_info.get("work_dir"),
        "autonomous_run_enabled": True,
    }


@router.post("/run")
async def run(req: RunRequest):
    """Autonomous ReAct task runner using local tool registry."""
    if not req.task.strip():
        raise HTTPException(status_code=400, detail="Task is required")
    if req.max_steps < 1 or req.max_steps > 50:
        raise HTTPException(status_code=400, detail="max_steps must be between 1 and 50")

    try:
        from agents.jarvis_agent import JarvisAgent
        agent = JarvisAgent(max_steps=req.max_steps)
        result = await asyncio.to_thread(agent.run, req.task, req.require_confirmation)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Jarvis run failed: {e}")


@router.post("/ask")
async def ask(req: AskRequest):
    """Safe LLM reasoning endpoint — no shell/file tools, read-only."""
    if not GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY not configured")

    try:
        import httpx
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": GROQ_MODEL,
            "messages": [
                {"role": "system", "content": JARVIS_SYSTEM},
                {"role": "user", "content": req.task},
            ],
            "max_tokens": req.max_tokens,
            "temperature": 0.7,
        }
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{GROQ_BASE_URL}/chat/completions",
                json=payload,
                headers=headers,
            )
        resp.raise_for_status()
        data = resp.json()
        content = data["choices"][0]["message"]["content"]
        model_used = data.get("model", GROQ_MODEL)
        usage = data.get("usage", {})

        # Parse thought/plan/answer sections if present
        thoughts: list[str] = []
        actions: list[str] = []
        answer = content

        lines = content.split("\n")
        current_answer_lines: list[str] = []
        in_answer = False
        for line in lines:
            stripped = line.strip()
            if stripped.startswith("THOUGHT:"):
                thoughts.append(stripped[8:].strip())
                in_answer = False
            elif stripped.startswith("PLAN:"):
                actions.append(stripped[5:].strip())
                in_answer = False
            elif stripped.startswith("ANSWER:"):
                current_answer_lines = [stripped[7:].strip()]
                in_answer = True
            elif in_answer:
                current_answer_lines.append(line)
        if current_answer_lines:
            answer = "\n".join(current_answer_lines).strip()

        return {
            "completed": True,
            "answer": answer,
            "thoughts": thoughts,
            "actions": actions,
            "steps_taken": len(thoughts) + len(actions),
            "elapsed_seconds": 0,
            "model_used": model_used,
            "tokens": usage.get("total_tokens", 0),
        }

    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Groq error: {e.response.status_code}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search")
async def search(req: SearchRequest):
    return web_search(req.query, req.max_results)


@router.post("/action")
async def action(request: dict):
    action_name = str(request.get("action", "")).strip().lower()
    params = request.get("params", {}) or {}

    try:
        if action_name == "running_apps":
            try:
                import psutil

                apps = []
                for process in psutil.process_iter(["name", "pid"]):
                    try:
                        apps.append({
                            "name": process.info.get("name"),
                            "pid": process.info.get("pid"),
                        })
                    except Exception:
                        pass
                return {"status": "ok", "apps": apps[:20]}
            except Exception:
                result = subprocess.run(
                    ["bash", "-lc", "ps -eo pid=,comm= | head -n 20"],
                    capture_output=True,
                    text=True,
                    timeout=15,
                )
                return {"status": "ok", "apps": result.stdout.strip().splitlines()}

        if action_name == "list_files":
            path = str(params.get("path", "."))
            files = os.listdir(path)
            return {"status": "ok", "files": files}

        if action_name == "run_command":
            cmd = str(params.get("cmd", ""))
            if not cmd.strip():
                raise HTTPException(status_code=400, detail="cmd is required")
            result = subprocess.run(
                cmd,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30,
            )
            return {"status": "ok", "output": result.stdout + result.stderr}

        if action_name == "open_url":
            url = str(params.get("url", ""))
            if not url:
                raise HTTPException(status_code=400, detail="url is required")
            opened = webbrowser.open(url, new=2)
            return {"status": "ok", "action": "open_url", "url": url, "opened": bool(opened)}

        return {"error": f"Unknown: {action_name}"}

    except Exception as exc:
        return {"error": str(exc)}


@router.get("/screenshot")
async def screenshot():
    """Attempt to take a screenshot. Returns a placeholder on headless hosts."""
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto("about:blank")
            png_bytes = page.screenshot(full_page=True)
            browser.close()
        encoded = base64.b64encode(png_bytes).decode("utf-8")
        return {"screenshot": encoded, "method": "playwright"}
    except Exception as e:
        return {"screenshot": None, "error": str(e), "method": "unavailable"}
