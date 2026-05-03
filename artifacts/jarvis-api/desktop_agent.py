#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════╗
║   E.D.I.T.H. Desktop Control Agent v2.0     ║
║   Full desktop automation for your EDITH     ║
╚══════════════════════════════════════════════╝

SETUP:
  pip install websockets pyautogui pillow

RUN:
  python edith_desktop_agent.py --url wss://YOUR_EDITH_URL/api/desktop/ws

Or set env var:
  export EDITH_DESKTOP_URL=wss://YOUR_EDITH_URL/api/desktop/ws
  python edith_desktop_agent.py

After running, EDITH can:
  - Open any app (WhatsApp, Chrome, Spotify, VSCode...)
  - Type text into any application
  - Press keyboard shortcuts (Ctrl+C, Alt+Tab, etc.)
  - Take screenshots and send to EDITH vision
  - Run shell commands
  - Click anywhere on screen
  - Scroll, drag, move mouse
"""

import argparse
import asyncio
import base64
import io
import json
import os
import platform
import subprocess
import sys

SYSTEM = platform.system()  # Windows / Darwin / Linux
VERSION = "2.0.0"

# ── Optional dependency: pyautogui ────────────────────────────────────────────
try:
    import pyautogui
    pyautogui.FAILSAFE = True
    pyautogui.PAUSE = 0.05
    HAS_GUI = True
except ImportError:
    HAS_GUI = False

# ── Optional dependency: websockets ───────────────────────────────────────────
try:
    import websockets
except ImportError:
    print("[SETUP] Installing websockets...")
    subprocess.run([sys.executable, "-m", "pip", "install", "websockets"], check=True)
    import websockets  # type: ignore


# ── App launch map ────────────────────────────────────────────────────────────
APP_MAP = {
    "whatsapp":   {"Windows": "start whatsapp:",             "Darwin": "open -a WhatsApp",              "Linux": "whatsapp-desktop"},
    "telegram":   {"Windows": "start tg://",                 "Darwin": "open -a Telegram",              "Linux": "telegram-desktop"},
    "chrome":     {"Windows": "start chrome",                "Darwin": "open -a 'Google Chrome'",       "Linux": "google-chrome"},
    "firefox":    {"Windows": "start firefox",               "Darwin": "open -a Firefox",               "Linux": "firefox"},
    "safari":     {"Windows": None,                          "Darwin": "open -a Safari",                "Linux": None},
    "edge":       {"Windows": "start msedge",                "Darwin": "open -a 'Microsoft Edge'",      "Linux": "microsoft-edge"},
    "notepad":    {"Windows": "notepad",                     "Darwin": "open -a TextEdit",              "Linux": "gedit"},
    "calc":       {"Windows": "calc",                        "Darwin": "open -a Calculator",            "Linux": "gnome-calculator"},
    "calculator": {"Windows": "calc",                        "Darwin": "open -a Calculator",            "Linux": "gnome-calculator"},
    "spotify":    {"Windows": "start spotify:",              "Darwin": "open -a Spotify",               "Linux": "spotify"},
    "vscode":     {"Windows": "code",                        "Darwin": "open -a 'Visual Studio Code'",  "Linux": "code"},
    "terminal":   {"Windows": "start cmd",                   "Darwin": "open -a Terminal",              "Linux": "gnome-terminal"},
    "files":      {"Windows": "explorer",                    "Darwin": "open ~",                        "Linux": "nautilus"},
    "word":       {"Windows": "start winword",               "Darwin": "open -a 'Microsoft Word'",      "Linux": "libreoffice --writer"},
    "excel":      {"Windows": "start excel",                 "Darwin": "open -a 'Microsoft Excel'",     "Linux": "libreoffice --calc"},
    "powerpoint": {"Windows": "start powerpnt",              "Darwin": "open -a 'Microsoft PowerPoint'","Linux": "libreoffice --impress"},
    "zoom":       {"Windows": "start zoommtg://",            "Darwin": "open -a zoom.us",               "Linux": "zoom"},
    "slack":      {"Windows": "start slack",                 "Darwin": "open -a Slack",                 "Linux": "slack"},
    "discord":    {"Windows": "start discord",               "Darwin": "open -a Discord",               "Linux": "discord"},
    "paint":      {"Windows": "mspaint",                     "Darwin": "open -a Preview",               "Linux": "gimp"},
    "settings":   {"Windows": "start ms-settings:",         "Darwin": "open -a 'System Preferences'",  "Linux": "gnome-control-center"},
    "task manager":{"Windows": "taskmgr",                   "Darwin": "open -a 'Activity Monitor'",    "Linux": "gnome-system-monitor"},
    "camera":     {"Windows": "start microsoft.windows.camera:", "Darwin": "open -a Photo Booth",       "Linux": "cheese"},
    "music":      {"Windows": "start mswindowsmusic:",       "Darwin": "open -a Music",                 "Linux": "rhythmbox"},
}


def open_app(name: str) -> dict:
    name_lower = name.lower().strip()
    for key, cmds in APP_MAP.items():
        if key in name_lower or name_lower in key:
            cmd = cmds.get(SYSTEM)
            if cmd:
                subprocess.Popen(cmd, shell=True)
                return {"success": True, "opened": name}
            else:
                return {"error": f"{name} not supported on {SYSTEM}"}
    # Fallback: try to launch directly
    try:
        subprocess.Popen(name, shell=True)
        return {"success": True, "opened": name}
    except Exception as e:
        return {"error": str(e)}


async def execute(action: str, params: dict) -> dict:
    """Execute a desktop action and return result."""

    # ── App launch ────────────────────────────────────────────────────────────
    if action == "open_app":
        return open_app(params.get("name", params.get("app", params.get("query", ""))))

    # ── Text typing ───────────────────────────────────────────────────────────
    elif action == "type_text":
        if not HAS_GUI:
            return {"error": "pyautogui not installed — run: pip install pyautogui pillow"}
        text = params.get("text", "")
        await asyncio.sleep(0.4)
        pyautogui.typewrite(text, interval=0.04)
        return {"success": True, "typed": text[:50]}

    # ── Keyboard shortcuts ────────────────────────────────────────────────────
    elif action == "press_keys":
        if not HAS_GUI:
            return {"error": "pyautogui not installed"}
        keys_str = params.get("keys", "")
        keys = [k.strip().lower() for k in keys_str.split("+")]
        pyautogui.hotkey(*keys)
        return {"success": True, "keys": keys_str}

    # ── Mouse click ───────────────────────────────────────────────────────────
    elif action == "click":
        if not HAS_GUI:
            return {"error": "pyautogui not installed"}
        x, y = int(params.get("x", 0)), int(params.get("y", 0))
        button = params.get("button", "left")
        pyautogui.click(x, y, button=button)
        return {"success": True, "clicked": [x, y]}

    # ── Double click ──────────────────────────────────────────────────────────
    elif action == "double_click":
        if not HAS_GUI:
            return {"error": "pyautogui not installed"}
        x, y = int(params.get("x", 0)), int(params.get("y", 0))
        pyautogui.doubleClick(x, y)
        return {"success": True}

    # ── Mouse move ────────────────────────────────────────────────────────────
    elif action == "move_mouse":
        if not HAS_GUI:
            return {"error": "pyautogui not installed"}
        x, y = int(params.get("x", 0)), int(params.get("y", 0))
        pyautogui.moveTo(x, y, duration=0.3)
        return {"success": True, "moved_to": [x, y]}

    # ── Scroll ────────────────────────────────────────────────────────────────
    elif action == "scroll":
        if not HAS_GUI:
            return {"error": "pyautogui not installed"}
        clicks = int(params.get("clicks", 3))
        pyautogui.scroll(clicks)
        return {"success": True, "scrolled": clicks}

    # ── Screenshot ────────────────────────────────────────────────────────────
    elif action == "screenshot":
        if not HAS_GUI:
            return {"error": "pyautogui not installed"}
        img = pyautogui.screenshot()
        img.thumbnail((1280, 720))
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        b64 = base64.b64encode(buf.getvalue()).decode()
        return {"success": True, "screenshot_b64": b64, "size": [img.width, img.height]}

    # ── Run shell command ─────────────────────────────────────────────────────
    elif action == "run_command":
        cmd = params.get("command", "")
        try:
            result = subprocess.run(
                cmd, shell=True, capture_output=True,
                text=True, timeout=30
            )
            return {
                "success": True,
                "stdout": result.stdout[:3000],
                "stderr": result.stderr[:500],
                "returncode": result.returncode,
            }
        except subprocess.TimeoutExpired:
            return {"error": "Command timed out after 30s"}
        except Exception as e:
            return {"error": str(e)}

    # ── Get screen info ───────────────────────────────────────────────────────
    elif action == "screen_info":
        if not HAS_GUI:
            return {"error": "pyautogui not installed"}
        w, h = pyautogui.size()
        x, y = pyautogui.position()
        return {"success": True, "width": w, "height": h, "mouse_x": x, "mouse_y": y}

    # ── Ping / handshake ──────────────────────────────────────────────────────
    elif action == "ping":
        return {
            "success": True,
            "pong": True,
            "os": SYSTEM,
            "pyautogui": HAS_GUI,
            "version": VERSION,
        }

    # ── Write file ────────────────────────────────────────────────────────────
    elif action == "write_file":
        path = params.get("path", "")
        content = params.get("content", "")
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        return {"success": True, "path": path}

    # ── Read file ─────────────────────────────────────────────────────────────
    elif action == "read_file":
        path = params.get("path", "")
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        return {"success": True, "content": content[:5000]}

    else:
        return {"error": f"Unknown action: {action}. Available: open_app, type_text, press_keys, click, screenshot, run_command, scroll, screen_info, ping"}


async def run_agent(url: str):
    print("=" * 54)
    print("  E.D.I.T.H. Desktop Agent v2.0")
    print(f"  OS: {SYSTEM}  |  PyAutoGUI: {'✓' if HAS_GUI else '✗ (pip install pyautogui pillow)'}")
    print(f"  Connecting: {url}")
    print("=" * 54)

    while True:
        try:
            async with websockets.connect(url, ping_interval=20, ping_timeout=10) as ws:
                print("[CONNECTED] EDITH now has full desktop control")
                print("  Press Ctrl+C to disconnect\n")

                while True:
                    msg = await ws.recv()
                    data = json.loads(msg)

                    if data.get("type") == "pong":
                        continue

                    cmd_id = data.get("cmd_id", "?")
                    action = data.get("action", "unknown")
                    params = data.get("params", {})

                    print(f"  → [{cmd_id}] {action} {params}")

                    try:
                        result = await execute(action, params)
                    except Exception as e:
                        result = {"error": str(e)}

                    await ws.send(json.dumps({
                        "type": "result",
                        "cmd_id": cmd_id,
                        "result": result,
                    }))

                    status = "✓" if result.get("success") else "✗"
                    print(f"  {status} [{cmd_id}] done")

        except KeyboardInterrupt:
            print("\n[EDITH DESKTOP] Agent stopped by user.")
            break
        except Exception as e:
            print(f"[DISCONNECTED] {e}")
            print("  Reconnecting in 5 seconds...")
            await asyncio.sleep(5)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="EDITH Desktop Control Agent — gives EDITH full control of your computer"
    )
    parser.add_argument(
        "--url",
        default=os.environ.get("EDITH_DESKTOP_URL", ""),
        help="EDITH backend WebSocket URL (wss://YOUR_URL/api/desktop/ws)",
    )
    args = parser.parse_args()

    if not args.url:
        print("\nERROR: EDITH backend URL not provided.\n")
        print("Usage:")
        print("  python edith_desktop_agent.py --url wss://YOUR_EDITH_URL/api/desktop/ws\n")
        print("Or set the environment variable:")
        print("  export EDITH_DESKTOP_URL=wss://YOUR_EDITH_URL/api/desktop/ws")
        print("  python edith_desktop_agent.py\n")
        sys.exit(1)

    asyncio.run(run_agent(args.url))
