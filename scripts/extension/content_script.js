// This part remains the same: inject the interceptor script into the page
const s = document.createElement('script');
s.src = chrome.runtime.getURL('interceptor.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);


// ADD THIS NEW PART: Listen for messages from the interceptor
window.addEventListener("message", (event) => {
  // We only accept messages from the window itself
  if (event.source !== window) {
    return;
  }

  // Check if the message is the one we're looking for
  if (event.data.type && (event.data.type === "FROM_INTERCEPTOR_SCRIPT")) {
    // Forward the message to the background script
    chrome.runtime.sendMessage({
      type: "COURSE_DATA_FOUND",
      payload: event.data.payload
    });
  }
});