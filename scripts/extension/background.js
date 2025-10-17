// Listens for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "COURSE_DATA_FOUND") {
    // 1. Get the currently stored data (or an empty object if nothing is stored)
    chrome.storage.local.get({ courseData: {} }, (result) => {
      const existingData = result.courseData;
      const newData = message.payload;

      // 2. Merge the old data with the new data
      const mergedData = { ...existingData, ...newData };
      const courseCount = Object.keys(mergedData).length;

      // 3. Save the newly merged data back to storage
      chrome.storage.local.set({ courseData: mergedData }, () => {
        console.log(`BACKGROUND: Data merged. Total unique courses: ${courseCount}`);
        
        // Update the badge with the total count
        chrome.action.setBadgeText({ text: `${courseCount}` });
        chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });
      });
    });
  }
});