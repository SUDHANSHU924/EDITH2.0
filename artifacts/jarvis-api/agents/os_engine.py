from __future__ import annotations

import base64
import io
import os
import platform
import subprocess
import webbrowser
from pathlib import Path

import psutil

PLATFORM = platform.system()

MAC_APPS = {
    "chrome": "Google Chrome",
    "safari": "Safari",
    "firefox": "Firefox",
    "brave": "Brave Browser",
    "edge": "Microsoft Edge",
    "vscode": "Visual Studio Code",
    "vs code": "Visual Studio Code",
    "terminal": "Terminal",
    "iterm": "iTerm",
    "xcode": "Xcode",
    "android studio": "Android Studio",
    "whatsapp": "WhatsApp",
    "telegram": "Telegram",
    "slack": "Slack",
    "discord": "Discord",
    "zoom": "zoom.us",
    "facetime": "FaceTime",
    "messages": "Messages",
    "notion": "Notion",
    "obsidian": "Obsidian",
    "excel": "Microsoft Excel",
    "word": "Microsoft Word",
    "powerpoint": "Microsoft PowerPoint",
    "keynote": "Keynote",
    "pages": "Pages",
    "numbers": "Numbers",
    "spotify": "Spotify",
    "vlc": "VLC",
    "quicktime": "QuickTime Player",
    "photos": "Photos",
    "finder": "Finder",
    "settings": "System Preferences",
    "system preferences": "System Preferences",
    "activity monitor": "Activity Monitor",
    "calculator": "Calculator",
    "calendar": "Calendar",
    "mail": "Mail",
    "notes": "Notes",
    "reminders": "Reminders",
}

LINUX_APPS = {
    "chrome": "google-chrome",
    "firefox": "firefox",
    "terminal": "gnome-terminal",
    "vscode": "code",
    "vs code": "code",
    "files": "nautilus",
    "settings": "gnome-control-center",
    "calculator": "gnome-calculator",
    "slack": "slack",
    "discord": "discord",
    "spotify": "spotify",
    "vlc": "vlc",
}

WINDOWS_APPS = {
    "chrome": "chrome",
    "edge": "msedge",
    "firefox": "firefox",
    "notepad": "notepad",
    "calculator": "calc",
    "paint": "mspaint",
    "word": "winword",
    "excel": "excel",
    "powerpoint": "powerpnt",
    "vscode": "code",
    "vs code": "code",
    "terminal": "wt",
    "explorer": "explorer",
    "settings": "ms-settings:",
    "task manager": "taskmgr",
    "discord": "discord",
    "slack": "slack",
    "spotify": "spotify",
    "zoom": "zoom",
    "teams": "teams",
}

WEBSITES = {
    "youtube": "https://youtube.com",
    "google": "https://google.com",
    "gmail": "https://gmail.com",
    "github": "https://github.com",
    "netflix": "https://netflix.com",
    "spotify": "https://open.spotify.com",
    "twitter": "https://twitter.com",
    "x": "https://twitter.com",
    "instagram": "https://instagram.com",
    "whatsapp web": "https://web.whatsapp.com",
    "linkedin": "https://linkedin.com",
    "chatgpt": "https://chatgpt.com",
    "claude": "https://claude.ai",
    "reddit": "https://reddit.com",
    "stackoverflow": "https://stackoverflow.com",
    "medium": "https://medium.com",
    "news": "https://news.google.com",
    "maps": "https://maps.google.com",
    "translate": "https://translate.google.com",
    "drive": "https://drive.google.com",
    "docs": "https://docs.google.com",
    "sheets": "https://sheets.google.com",
    "meet": "https://meet.google.com",
}


class OSEngine:
    def __init__(self):
        self.platform = PLATFORM
        self.last_action = None

    def _find_website(self, text: str):
        for site, url in WEBSITES.items():
            if site in text:
                return url
        return None

    def open_app(self, app_name: str) -> dict:
        name_lower = app_name.lower().strip()

        url = self._find_website(name_lower)
        if url:
            return self.open_url(url)

        try:
            if self.platform == "Darwin":
                app = MAC_APPS.get(name_lower, app_name)
                result = subprocess.run(["open", "-a", app], capture_output=True, text=True)
                if result.returncode == 0:
                    return {"success": True, "action": "open_app", "app": app, "message": f"Opened {app}"}
                subprocess.Popen([app_name])
                return {"success": True, "action": "open_app", "app": app_name, "message": f"Launched {app_name}"}

            if self.platform == "Windows":
                app = WINDOWS_APPS.get(name_lower, app_name)
                if app.startswith("ms-"):
                    subprocess.Popen(["start", app], shell=True)
                else:
                    subprocess.Popen(app, shell=True)
                return {"success": True, "action": "open_app", "app": app, "message": f"Opened {app}"}

            app = LINUX_APPS.get(name_lower, name_lower)
            subprocess.Popen([app], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return {"success": True, "action": "open_app", "app": app, "message": f"Opened {app}"}

        except FileNotFoundError:
            url = self._find_website(name_lower)
            if url:
                return self.open_url(url)
            return {"success": False, "message": f"App not found: {app_name}"}
        except Exception as exc:
            return {"success": False, "error": str(exc), "message": f"Failed to open {app_name}"}

    def open_url(self, url: str) -> dict:
        target = url.strip()
        if not target:
            return {"success": False, "message": "URL is required"}
        if not target.startswith("http"):
            target = "https://" + target
        try:
            # Use subprocess for non-blocking URL opening
            if self.platform == "Darwin":
                subprocess.Popen(["open", target], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            elif self.platform == "Windows":
                subprocess.Popen(f"start {target}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                # Linux: use xdg-open
                subprocess.Popen(["xdg-open", target], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass  # Silently fail if command not available (headless env)
        return {"success": True, "action": "open_url", "url": target, "message": f"Opened {target}"}

    def search_web(self, query: str, engine: str = "google") -> dict:
        engines = {
            "google": f"https://google.com/search?q={query}",
            "youtube": f"https://youtube.com/results?search_query={query}",
            "github": f"https://github.com/search?q={query}",
        }
        return self.open_url(engines.get(engine, engines["google"]))

    def close_app(self, app_name: str) -> dict:
        name_lower = app_name.lower().strip()
        killed: list[str] = []

        for proc in psutil.process_iter(["name", "pid"]):
            try:
                proc_name = (proc.info.get("name") or "").lower()
                if name_lower and name_lower in proc_name:
                    proc.terminate()
                    killed.append(proc.info.get("name") or proc_name)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue

        if killed:
            return {"success": True, "action": "close_app", "closed": killed, "message": f"Closed: {', '.join(killed)}"}
        return {"success": False, "message": f"App not running: {app_name}"}

    def get_running_apps(self) -> dict:
        apps = set()
        for proc in psutil.process_iter(["name"]):
            try:
                name = proc.info.get("name")
                if name and not name.startswith("."):
                    apps.add(name)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        return {"success": True, "apps": sorted(apps)[:30], "count": len(apps)}

    def open_folder(self, path: str) -> dict:
        target = os.path.expanduser(path)
        if self.platform == "Darwin":
            subprocess.Popen(["open", target])
        elif self.platform == "Windows":
            subprocess.Popen(["explorer", target])
        else:
            subprocess.Popen(["xdg-open", target])
        return {"success": True, "action": "open_folder", "path": target, "message": f"Opened {target}"}

    def open_file(self, path: str) -> dict:
        target = os.path.expanduser(path)
        if self.platform == "Darwin":
            subprocess.Popen(["open", target])
        elif self.platform == "Windows":
            os.startfile(target)
        else:
            subprocess.Popen(["xdg-open", target])
        return {"success": True, "action": "open_file", "path": target, "message": f"Opened {target}"}

    def create_file(self, path: str, content: str = "") -> dict:
        target = os.path.expanduser(path)
        os.makedirs(os.path.dirname(target) or ".", exist_ok=True)
        with open(target, "w", encoding="utf-8") as file_handle:
            file_handle.write(content)
        return {"success": True, "action": "create_file", "path": target, "message": f"Created {target}"}

    def list_files(self, path: str = ".") -> dict:
        target = os.path.expanduser(path)
        try:
            items = os.listdir(target)
            return {"success": True, "path": target, "files": items, "count": len(items)}
        except Exception as exc:
            return {"success": False, "error": str(exc)}

    def run_command(self, cmd: str) -> dict:
        try:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
            return {"success": True, "output": result.stdout + result.stderr, "returncode": result.returncode}
        except subprocess.TimeoutExpired:
            return {"success": False, "error": "Timeout"}
        except Exception as exc:
            return {"success": False, "error": str(exc)}

    def get_system_info(self) -> dict:
        info = {
            "platform": self.platform,
            "cpu_percent": psutil.cpu_percent(interval=0.5),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage("/").percent,
            "running_processes": len(psutil.pids()),
        }
        battery = psutil.sensors_battery() if hasattr(psutil, "sensors_battery") else None
        if battery:
            info["battery"] = battery.percent
        return info

    def set_volume(self, level: int) -> dict:
        level = max(0, min(100, int(level)))
        try:
            if self.platform == "Darwin":
                subprocess.run(["osascript", "-e", f"set volume output volume {level}"], check=False)
            elif self.platform == "Linux":
                subprocess.run(["amixer", "set", "Master", f"{level}%"], check=False)
            elif self.platform == "Windows":
                subprocess.run(["nircmd", "setsysvolume", str(int(level * 655.35))], check=False)
        except Exception as exc:
            return {"success": False, "error": str(exc)}
        return {"success": True, "action": "set_volume", "level": level, "message": f"Volume set to {level}%"}

    def _capture_with_pyautogui(self):
        import pyautogui
        screenshot = pyautogui.screenshot()
        buf = io.BytesIO()
        screenshot.save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode("utf-8")

    def take_screenshot(self) -> dict:
        try:
            encoded = self._capture_with_pyautogui()
            return {"success": True, "action": "screenshot", "screenshot": encoded, "message": "Screenshot taken"}
        except Exception as exc:
            try:
                import mss  # type: ignore
                from PIL import Image

                with mss.mss() as sct:
                    shot = sct.grab(sct.monitors[0])
                    image = Image.frombytes("RGB", shot.size, shot.bgra, "raw", "BGRX")
                    buf = io.BytesIO()
                    image.save(buf, format="PNG")
                    encoded = base64.b64encode(buf.getvalue()).decode("utf-8")
                    return {"success": True, "action": "screenshot", "screenshot": encoded, "message": "Screenshot taken"}
            except Exception as fallback_exc:
                return {"success": False, "error": f"{exc}; {fallback_exc}"}

    def type_text(self, text: str) -> dict:
        try:
            import pyautogui

            pyautogui.write(text, interval=0.01)
            return {"success": True, "action": "type_text", "text": text, "message": "Typed text"}
        except Exception as exc:
            return {"success": False, "error": str(exc)}

    def press_keys(self, keys: str) -> dict:
        try:
            import pyautogui

            pyautogui.hotkey(*[part.strip() for part in keys.split("+") if part.strip()])
            return {"success": True, "action": "press_keys", "keys": keys, "message": f"Pressed {keys}"}
        except Exception as exc:
            return {"success": False, "error": str(exc)}

    def click(self, x: int, y: int) -> dict:
        try:
            import pyautogui

            pyautogui.click(x=x, y=y)
            return {"success": True, "action": "click", "x": x, "y": y, "message": f"Clicked {x}, {y}"}
        except Exception as exc:
            return {"success": False, "error": str(exc)}

    def scroll(self, clicks: int = 3) -> dict:
        try:
            import pyautogui

            pyautogui.scroll(clicks)
            return {"success": True, "action": "scroll", "clicks": clicks, "message": f"Scrolled {clicks}"}
        except Exception as exc:
            return {"success": False, "error": str(exc)}


os_engine = OSEngine()
os_controller = os_engine