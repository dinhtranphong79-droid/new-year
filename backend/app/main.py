from fastapi import FastAPI
from app.websocket import router as ws_router

app = FastAPI(title="Fireworks 2026 Backend")

app.include_router(ws_router)



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

