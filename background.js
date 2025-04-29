chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.request === "getDictPath") {
        sendResponse({ dictPath: chrome.runtime.getURL("dict") });
    }
});

// 监听图标点击事件
chrome.action.onClicked.addListener((tab) => {
    console.log('Extension icon clicked');
    
    // 获取当前状态
    chrome.storage.sync.get(['extensionEnabled'], function(result) {
        const isEnabled = !result.extensionEnabled; // 切换状态
        console.log('Extension state changed to:', isEnabled);
        
        // 更新状态
        chrome.storage.sync.set({ extensionEnabled: isEnabled });
        
        // 更新图标
        const iconPath = isEnabled ? {
            "16": "icons/icon16a.png",
            "32": "icons/icon32a.png"
        } : {
            "16": "icons/icon16han.png",
            "32": "icons/icon32han.png"
        };
        chrome.action.setIcon({ path: iconPath });
        
        // 通知当前标签页更新状态
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                // 检查标签页是否支持 content scripts
                if (tabs[0].url.startsWith('chrome://')) {
                    console.log('Cannot send message to chrome:// pages');
                    return;
                }
                
                console.log('Sending message to tab:', tabs[0].id);
                try {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'updateExtensionState',
                        enabled: isEnabled
                    }).then(() => {
                        console.log('Message sent successfully');
                    }).catch(error => {
                        // 忽略常见的无害错误
                        if (error.message.includes('Receiving end does not exist')) {
                            console.log('Tab is not ready yet');
                        } else {
                            console.error('Error sending message:', error);
                        }
                    });
                } catch (error) {
                    console.log('Error preparing to send message:', error);
                }
            }
        });
    });
});

// 初始化时设置默认状态
chrome.storage.sync.get(['extensionEnabled'], function(result) {
    if (result.extensionEnabled === undefined) {
        chrome.storage.sync.set({ extensionEnabled: false }); // 默认关闭
        // 设置初始图标为关闭状态
        chrome.action.setIcon({
            path: {
                "16": "icons/icon16han.png",
                "32": "icons/icon32han.png"
            }
        });
    }
});
