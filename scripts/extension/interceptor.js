// This script runs in the page's context and intercepts the network request
const originalSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.send = function() {
  this.addEventListener("load", function() {
    if (this.responseURL && this.responseURL.includes("PostSearchCriteria")) {
      try {
        const responseJson = JSON.parse(this.responseText);
        
        if (responseJson && responseJson.CourseFullModels) {
          console.log("INTERCEPTOR: Found CourseFullModels. Starting data transformation...");
          
          const courseMap = responseJson.CourseFullModels.reduce((accumulator, course) => {
            const title = course.CourseTitleDisplay;
            if (title) {
              accumulator[title] = course;
            }
            return accumulator;
          }, {});
          
          console.log("INTERCEPTOR: Data transformed. Posting this message to content script:", courseMap);
          
          window.postMessage({
            type: "FROM_INTERCEPTOR_SCRIPT",
            payload: courseMap
          }, "*");
        }
      } catch (e) {
        console.error("INTERCEPTOR: An error occurred.", e);
      }
    }
  });
  // Call the original XHR send function
  originalSend.apply(this, arguments);
};