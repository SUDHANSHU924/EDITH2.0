from fastapi import APIRouter
from pydantic import BaseModel
import os

router = APIRouter()


class WhatsAppMessage(BaseModel):
    to: str
    message: str
    require_confirmation: bool = True


class ConfirmRequest(BaseModel):
    message_id: str
    confirmed: bool


pending_messages = {}


@router.post("/draft")
async def draft_message(request: WhatsAppMessage):
    """Draft a WhatsApp message - requires confirmation"""
    import uuid

    msg_id = str(uuid.uuid4())[:8]
    pending_messages[msg_id] = {
        "to": request.to,
        "message": request.message,
        "status": "pending_confirmation",
    }
    return {
        "message_id": msg_id,
        "to": request.to,
        "message": request.message,
        "status": "AWAITING_COMMANDER_CONFIRMATION",
        "instruction": "Call /confirm with YES or NO",
    }


@router.post("/confirm")
async def confirm_send(request: ConfirmRequest):
    """Commander confirms or rejects the message"""
    msg = pending_messages.get(request.message_id)
    if not msg:
        return {"error": "Message not found"}

    if request.confirmed:
        twilio_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        twilio_token = os.getenv("TWILIO_AUTH_TOKEN", "")

        if twilio_sid and twilio_token:
            from twilio.rest import Client

            client = Client(twilio_sid, twilio_token)
            message = client.messages.create(
                from_=f"whatsapp:{os.getenv('TWILIO_WHATSAPP_NUMBER')}",
                to=f"whatsapp:{msg['to']}",
                body=msg["message"],
            )
            del pending_messages[request.message_id]
            return {
                "status": "SENT",
                "sid": message.sid,
            }

        return {
            "status": "SIMULATED_SENT",
            "message": "Add TWILIO keys to send real messages",
            "to": msg["to"],
            "content": msg["message"],
        }

    del pending_messages[request.message_id]
    return {"status": "CANCELLED_BY_COMMANDER"}


@router.get("/pending")
async def get_pending():
    return {"pending": pending_messages}


@router.get("/status")
async def status():
    twilio = bool(os.getenv("TWILIO_ACCOUNT_SID", ""))
    return {
        "status": "online",
        "whatsapp_ready": twilio,
        "confirmation_required": True,
        "note": "Add TWILIO keys for real WhatsApp",
    }
