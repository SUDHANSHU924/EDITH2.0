from core.config import settings


def verify_mode_token(token: str, mode: str) -> bool:
    if mode == "hacker":
        return bool(token) and token == settings.HACKER_MODE_TOKEN
    if mode == "satellite":
        return bool(token) and token == settings.SATELLITE_MODE_TOKEN
    return False
