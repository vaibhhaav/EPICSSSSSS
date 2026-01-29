let socket = null;

function connectWebSocket() {
  socket = new WebSocket("ws://localhost:8000/ws");

  socket.onopen = () => {
    console.log("🟢 WebSocket connected");
  };

  socket.onerror = (err) => {
    console.error("WebSocket error:", err);
  };

  socket.onclose = () => {
    console.log("🔴 WebSocket closed");
  };
}



console.log("Meet Monitor content script loaded");

let mediaStream = null;
let videoElement = null;
let captureInterval = null;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "start_capture") {
    startMediaCapture();
    sendResponse({ success: true });
  }
});

async function startMediaCapture() {
  try {
    connectWebSocket();

    mediaStream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 5 },
      audio: true
    });

    setupAudioCapture(mediaStream);
    setupVideoCapture(mediaStream);

  } catch (err) {
    console.error("Capture failed:", err);
  }
}

function setupAudioCapture(stream) {
  const audioContext = new AudioContext({ sampleRate: 16000 });
  const source = audioContext.createMediaStreamSource(stream);
  const processor = audioContext.createScriptProcessor(4096, 1, 1);

  processor.onaudioprocess = (e) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    const audioData = e.inputBuffer.getChannelData(0);
    socket.send(audioData.buffer);
  };

  source.connect(processor);
  processor.connect(audioContext.destination);

  console.log("🎧 Audio streaming started");
}

function setupVideoCapture(stream) {
  const video = document.createElement("video");
  video.srcObject = stream;
  video.muted = true;
  video.play();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  setInterval(() => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    if (video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) socket.send(blob);
    }, "image/jpeg", 0.6);

  }, 1000);

  console.log("🎥 Video streaming started");
}

