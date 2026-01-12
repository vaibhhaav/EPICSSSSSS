const statusText = document.getElementById("statusText");
const startBtn = document.getElementById("startBtn");

startBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "start_capture" },
      (response) => {
        if (chrome.runtime.lastError) {
          statusText.textContent = "Status: Error (reload Meet)";
          return;
        }
        statusText.textContent = "Status: Capturing";
      }
    );
  });
});
