"""OS Control toolkit — safe sandboxed execution for the Jarvis ReAct agent.

Tools exposed:
  run_shell      — execute a shell command and return stdout/stderr
  list_files     — list files in a directory
  read_file      — read a text file
  write_file     — write text to a file
  get_processes  — list running processes
  get_sys_info   — system information snapshot
  web_search     — lightweight DuckDuckGo scrape (no API key required)
"""

import os
import subprocess
import platform
import json
import textwrap
from typing import Optional
from pathlib import Path

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False

try:
    import httpx
    HAS_HTTPX = True
except ImportError:
    HAS_HTTPX = False


WORK_DIR = os.environ.get("JARVIS_WORK_DIR", "/tmp/jarvis_workspace")
os.makedirs(WORK_DIR, exist_ok=True)

_BLOCKED_COMMANDS = {
    "rm -rf /", "sudo rm", "mkfs", "dd if=", ":(){ :|:& };:", "shutdown",
    "reboot", "halt", "init 0", "passwd", "chmod 777 /",
}


def _is_blocked(cmd: str) -> bool:
    low = cmd.lower().strip()
    return any(b in low for b in _BLOCKED_COMMANDS)


def run_shell(command: str, timeout: int = 15) -> dict:
    """Run a shell command. Returns stdout, stderr, returncode."""
    if _is_blocked(command):
        return {"stdout": "", "stderr": "BLOCKED: unsafe command", "returncode": -1}
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=WORK_DIR,
        )
        return {
            "stdout": result.stdout[:4000],
            "stderr": result.stderr[:2000],
            "returncode": result.returncode,
        }
    except subprocess.TimeoutExpired:
        return {"stdout": "", "stderr": "TIMEOUT", "returncode": -1}
    except Exception as e:
        return {"stdout": "", "stderr": str(e), "returncode": -1}


def list_files(directory: str = ".") -> dict:
    """List files in a directory (relative to work dir)."""
    try:
        base = Path(WORK_DIR)
        target = (base / directory).resolve()
        if not str(target).startswith(str(base)):
            target = base
        entries = []
        for entry in target.iterdir():
            entries.append({
                "name": entry.name,
                "type": "dir" if entry.is_dir() else "file",
                "size": entry.stat().st_size if entry.is_file() else None,
            })
        return {"path": str(target), "entries": entries[:100]}
    except Exception as e:
        return {"path": directory, "entries": [], "error": str(e)}


def read_file(path: str) -> dict:
    """Read a text file (relative to work dir)."""
    try:
        base = Path(WORK_DIR)
        target = (base / path).resolve()
        if not str(target).startswith(str(base)):
            return {"content": "", "error": "Path outside workspace"}
        content = target.read_text(encoding="utf-8", errors="replace")
        return {"path": str(target), "content": content[:8000]}
    except Exception as e:
        return {"path": path, "content": "", "error": str(e)}


def write_file(path: str, content: str) -> dict:
    """Write text to a file (relative to work dir)."""
    try:
        base = Path(WORK_DIR)
        target = (base / path).resolve()
        if not str(target).startswith(str(base)):
            return {"success": False, "error": "Path outside workspace"}
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")
        return {"success": True, "path": str(target), "bytes_written": len(content)}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_processes() -> dict:
    """Get currently running processes."""
    if not HAS_PSUTIL:
        result = run_shell("ps aux | head -30")
        return {"processes": result["stdout"], "method": "ps_aux"}
    procs = []
    for proc in psutil.process_iter(["pid", "name", "status", "cpu_percent", "memory_percent"]):
        try:
            info = proc.info
            procs.append({
                "pid": info["pid"],
                "name": info["name"],
                "status": info["status"],
                "cpu": round(info.get("cpu_percent") or 0, 2),
                "mem": round(info.get("memory_percent") or 0, 2),
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    procs.sort(key=lambda p: p["cpu"], reverse=True)
    return {"processes": procs[:30], "count": len(procs)}


def get_sys_info() -> dict:
    """Return system information snapshot."""
    info: dict = {
        "platform": platform.system(),
        "platform_version": platform.version(),
        "architecture": platform.machine(),
        "python_version": platform.python_version(),
        "hostname": platform.node(),
        "cwd": os.getcwd(),
        "work_dir": WORK_DIR,
    }
    if HAS_PSUTIL:
        try:
            vm = psutil.virtual_memory()
            info["memory"] = {
                "total_mb": round(vm.total / 1024 / 1024, 1),
                "available_mb": round(vm.available / 1024 / 1024, 1),
                "percent_used": vm.percent,
            }
            info["cpu_count"] = psutil.cpu_count()
            info["cpu_percent"] = psutil.cpu_percent(interval=0.5)
            du = psutil.disk_usage("/")
            info["disk"] = {
                "total_gb": round(du.total / 1024 / 1024 / 1024, 2),
                "free_gb": round(du.free / 1024 / 1024 / 1024, 2),
                "percent_used": du.percent,
            }
        except Exception:
            pass
    return info


def web_search(query: str, max_results: int = 5) -> dict:
    """Lightweight DuckDuckGo Instant Answer API search."""
    if not HAS_HTTPX:
        return {"results": [], "error": "httpx not installed"}
    try:
        url = "https://api.duckduckgo.com/"
        params = {"q": query, "format": "json", "no_html": "1", "skip_disambig": "1"}
        with httpx.Client(timeout=10) as client:
            resp = client.get(url, params=params)
        data = resp.json()
        results = []
        if data.get("AbstractText"):
            results.append({
                "title": data.get("Heading", query),
                "snippet": data["AbstractText"][:400],
                "url": data.get("AbstractURL", ""),
            })
        for r in data.get("RelatedTopics", [])[:max_results - len(results)]:
            if isinstance(r, dict) and r.get("Text"):
                results.append({
                    "title": r.get("Text", "")[:80],
                    "snippet": r.get("Text", "")[:300],
                    "url": r.get("FirstURL", ""),
                })
        return {"query": query, "results": results[:max_results]}
    except Exception as e:
        return {"query": query, "results": [], "error": str(e)}


TOOL_REGISTRY = {
    "run_shell": run_shell,
    "list_files": list_files,
    "read_file": read_file,
    "write_file": write_file,
    "get_processes": get_processes,
    "get_sys_info": get_sys_info,
    "web_search": web_search,
}


def call_tool(name: str, args: dict) -> str:
    fn = TOOL_REGISTRY.get(name)
    if not fn:
        return json.dumps({"error": f"Unknown tool: {name}"})
    result = fn(**args)
    return json.dumps(result, default=str)[:6000]
