from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from app.websocket import ConnectionManager
from app.models import FireworkEvent

app = FastAPI(title="Fireworks 2026 Backend")

manager = ConnectionManager()


@app.get("/")
async def root():
    return {"status": "Fireworks 2026 backend running"}


@app.websocket("/ws/fireworks")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            data = await websocket.receive_json()

            # validate data
            event = FireworkEvent(**data)

            # broadcast cho tất cả client
            await manager.broadcast(event.dict())

    except WebSocketDisconnect:
        manager.disconnect(websocket)

