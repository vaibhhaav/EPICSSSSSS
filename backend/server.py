from fastapi import FastAPI, WebSocket
import numpy as np
import datetime

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    print("🟢 WebSocket client connected")

    try:
        while True:
            message = await ws.receive()

            if "bytes" in message:
                data = message["bytes"]

                # Simple heuristic: audio chunks are small, frames are large
                if len(data) < 100_000:
                    audio = np.frombuffer(data, dtype=np.float32)
                    print(f"🎧 Audio chunk received: {audio.shape}")
                else:
                    print(f"🎥 Video frame received: {len(data)} bytes")

    except Exception as e:
        print("🔴 Client disconnected:", e)
