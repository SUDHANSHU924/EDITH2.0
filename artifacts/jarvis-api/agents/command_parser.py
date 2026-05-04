from __future__ import annotations

import re

from agents.os_engine import os_engine


class CommandParser:
    """Parse natural language into OS actions."""

    OPEN_PATTERNS = [
        r"open\s+(.+)",
        r"launch\s+(.+)",
        r"start\s+(.+)",
        r"run\s+(.+)",
        r"show\s+me\s+(.+)",
        r"go\s+to\s+(.+)",
        r"take\s+me\s+to\s+(.+)",
        r"(.+)\s+kholo",
        r"(.+)\s+chalao",
        r"(.+)\s+open\s+karo",
        r"(.+)\s+launch\s+karo",
        r"(.+)\s+chalu\s+karo",
        r"(.+)\s+dikhao",
    ]

    CLOSE_PATTERNS = [
        r"close\s+(.+)",
        r"quit\s+(.+)",
        r"exit\s+(.+)",
        r"kill\s+(.+)",
        r"(.+)\s+band\s+karo",
        r"(.+)\s+close\s+karo",
    ]

    SEARCH_PATTERNS = [
        r"search\s+(?:for\s+)?(.+?)(?:\s+on\s+(\w+))?$",
        r"find\s+(.+?)(?:\s+on\s+(\w+))?$",
        r"look\s+up\s+(.+)",
        r"google\s+(.+)",
        r"youtube\s+(.+)",
        r"(.+)\s+search\s+karo",
        r"(.+)\s+dhundho",
        r"(.+)\s+ko\s+search\s+karo",
    ]

    VOLUME_PATTERNS = [
        r"volume\s+(\d+)",
        r"set\s+volume\s+to\s+(\d+)",
        r"volume\s+(?:ko\s+)?(\d+)\s+karo",
        r"(\d+)\s+percent\s+volume",
    ]

    SYSTEM_PATTERNS = [
        r"(?:take\s+a?\s*)?screenshot",
        r"screen\s+capture",
        r"screenshot\s+lo",
        r"system\s+info",
        r"system\s+status",
        r"running\s+apps",
        r"kya\s+chal\s+raha\s+hai",
    ]

    FILE_PATTERNS = [
        r"open\s+(?:folder|directory)\s+(.+)",
        r"open\s+file\s+(.+)",
        r"show\s+files\s+(?:in\s+)?(.+)",
        r"list\s+files\s+(?:in\s+)?(.+)",
        r"(.+)\s+folder\s+kholo",
    ]

    def parse(self, text: str) -> dict | None:
        text_lower = text.lower().strip()

        for pattern in self.VOLUME_PATTERNS:
            match = re.search(pattern, text_lower)
            if match:
                level = max(0, min(100, int(match.group(1))))
                return {"type": "volume", "level": level, "execute": lambda level=level: os_engine.set_volume(level)}

        for pattern in self.SYSTEM_PATTERNS:
            if re.search(pattern, text_lower):
                if "screenshot" in pattern or "screen" in pattern:
                    return {"type": "screenshot", "execute": lambda: os_engine.take_screenshot()}
                if "info" in pattern or "status" in pattern:
                    return {"type": "system_info", "execute": lambda: os_engine.get_system_info()}
                if "running" in pattern or "chal" in pattern:
                    return {"type": "running_apps", "execute": lambda: os_engine.get_running_apps()}

        for pattern in self.SEARCH_PATTERNS:
            match = re.search(pattern, text_lower)
            if match:
                query = match.group(1).strip()
                engine = "google"
                if "youtube" in text_lower:
                    engine = "youtube"
                elif "github" in text_lower:
                    engine = "github"
                return {
                    "type": "search",
                    "query": query,
                    "engine": engine,
                    "execute": lambda q=query, e=engine: os_engine.search_web(q, e),
                }

        for pattern in self.CLOSE_PATTERNS:
            match = re.search(pattern, text_lower)
            if match:
                app = match.group(1).strip()
                return {"type": "close_app", "app": app, "execute": lambda app=app: os_engine.close_app(app)}

        for pattern in self.FILE_PATTERNS:
            match = re.search(pattern, text_lower)
            if match:
                path = match.group(1).strip()
                return {"type": "open_folder", "path": path, "execute": lambda path=path: os_engine.open_folder(path)}

        for pattern in self.OPEN_PATTERNS:
            match = re.search(pattern, text_lower)
            if match:
                target = re.sub(r"\s+(app|application|website|site)$", "", match.group(1).strip())
                return {"type": "open_app", "target": target, "execute": lambda target=target: os_engine.open_app(target)}

        return None


parser = CommandParser()