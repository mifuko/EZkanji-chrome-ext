chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.request === "getDictPath") {
        sendResponse({ dictPath: chrome.runtime.getURL("dict") });
    }
});

// 检查字典文件路径
const dictPath = chrome.runtime.getURL("dict/unk.dict.gz");
console.log("Dictionary file path:", dictPath);

// 尝试加载文件
fetch(dictPath)
  .then(response => {
    if (response.ok) {
      console.log("Dictionary file loaded successfully.");
    } else {
      console.error("Failed to load dictionary file.");
    }
  })
  .catch(error => {
    console.error("Error loading dictionary file:", error);
  });
