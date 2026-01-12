import whisper
import torch

print("=== Whisper GPU Test ===")
print("PyTorch CUDA:", torch.cuda.is_available())
print("GPU device:", torch.cuda.get_device_name(0) if torch.cuda.is_available() else "None")

# Load tiny model first (fastest test)
print("\nLoading tiny model on GPU...")
model_tiny = whisper.load_model("tiny", device="cuda")
print(f"Tiny model loaded on: {model_tiny.device}")

# Load small model (more realistic for real-time)
print("\nLoading small model on GPU...")
model_small = whisper.load_model("small", device="cuda")
print(f"Small model loaded on: {model_small.device}")

print("\n✅ Whisper GPU setup complete!")
