chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.request === "getDictPath") {
        sendResponse({ dictPath: chrome.runtime.getURL("lib/dict") });
    }
});
