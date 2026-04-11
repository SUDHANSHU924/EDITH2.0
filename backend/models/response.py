from pydantic import BaseModel


class ChatResponse(BaseModel):
    content: str
    session_id: str
    model: str = "deepseek-ai/deepseek-r1"
