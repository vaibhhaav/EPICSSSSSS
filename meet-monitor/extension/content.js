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
    console.log("Requesting screen + audio permission...");

    mediaStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        frameRate: 5
      },
      audio: true
    });

    console.log("Media stream acquired:", mediaStream);

    setupVideoCapture(mediaStream);
    setupAudioCapture(mediaStream);

  } catch (err) {
    console.error("Capture failed:", err);
  }
}
function setupAudioCapture(stream) {
  const audioContext = new AudioContext();
  const audioSource = audioContext.createMediaStreamSource(stream);
  const processor = audioContext.createScriptProcessor(4096, 1, 1);

  processor.onaudioprocess = (event) => {
    const audioData = event.inputBuffer.getChannelData(0);
    console.log("Audio chunk received:", audioData.length);
  };

  audioSource.connect(processor);
  processor.connect(audioContext.destination);

  console.log("Audio capture initialized");
}
function setupVideoCapture(stream) {
  videoElement = document.createElement("video");
  videoElement.srcObject = stream;
  videoElement.muted = true;
  videoElement.play();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  captureInterval = setInterval(() => {
    if (videoElement.videoWidth === 0) return;

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    ctx.drawImage(videoElement, 0, 0);

    canvas.toBlob((blob) => {
      console.log("Video frame captured:", blob.size, "bytes");
    }, "image/jpeg", 0.6);

  }, 1000);

  console.log("Video capture initialized");
}
