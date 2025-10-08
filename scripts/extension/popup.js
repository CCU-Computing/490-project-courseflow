document.addEventListener('DOMContentLoaded', () => {
  const statusDiv = document.getElementById('status');
  const downloadBtn = document.getElementById('downloadBtn');
  const clearBtn = document.getElementById('clearBtn');

  // Function to update the course count on the popup
  function updateStatus() {
    chrome.storage.local.get({ courseData: {} }, (result) => {
      const count = Object.keys(result.courseData).length;
      statusDiv.textContent = `${count} courses collected`;
    });
  }
  updateStatus(); // Call it immediately when popup opens

  // Add click listener for the download button
  downloadBtn.addEventListener('click', () => {
    chrome.storage.local.get({ courseData: {} }, (result) => {
      const courseData = result.courseData;
      if (Object.keys(courseData).length === 0) {
        statusDiv.textContent = 'No data to download.';
        return;
      }

      const dataString = JSON.stringify(courseData, null, 2);
      const dataBlob = new Blob([dataString], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      // Use the chrome.downloads API to trigger a download
      chrome.downloads.download({
        url: url,
        filename: 'course_data.json',
        saveAs: true // Prompts the user where to save the file
      });
    });
  });

  // Add click listener for the clear button
  clearBtn.addEventListener('click', () => {
    // Clear the data in storage and reset the badge
    chrome.storage.local.set({ courseData: {} }, () => {
      chrome.action.setBadgeText({ text: '' });
      updateStatus(); // Update the count to 0
    });
  });
});