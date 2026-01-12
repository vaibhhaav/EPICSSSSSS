from fastapi import FastAPI
import uvicorn

app = FastAPI(title="Meet Monitor Backend Test")

@app.get("/")
def root():
    return {"message": "Meet Monitor Backend Ready"}

@app.get("/health")
def health():
    import torch
    return {
        "status": "healthy",
        "cuda_available": torch.cuda.is_available(),
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
