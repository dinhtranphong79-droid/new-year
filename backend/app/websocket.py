from fastapi import APIRouter, WebSocket
import asyncio
from app.time_utils import get_remaining_seconds

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()

    while True:
        remaining = get_remaining_seconds()

        await ws.send_json({
            "type": "countdown",
            "remaining": remaining
        })

        await asyncio.sleep(1)
