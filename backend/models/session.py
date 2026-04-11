from pydantic import BaseModel, Field
from typing import List
from models.message import Message


class Session(BaseModel):
    session_id: str
    system_id: int = 1
    messages: List[Message] = Field(default_factory=list)
