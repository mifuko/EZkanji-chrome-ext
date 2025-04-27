document.getElementById("toggleButton").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: toggleRuby,
      });
    });
  });
  
  function toggleRuby() {
    document.body.classList.toggle("rubyEnabled");
  }
  