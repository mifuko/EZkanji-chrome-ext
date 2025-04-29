document.addEventListener('DOMContentLoaded', function() {
    const enableExtension = document.getElementById('enableExtension');
    const statusText = document.getElementById('statusText');

    // 从存储中加载状态
    chrome.storage.sync.get(['extensionEnabled'], function(result) {
        const isEnabled = result.extensionEnabled !== false; // 默认为 true
        enableExtension.checked = isEnabled;
        updateStatusText(isEnabled);
        updateIcon(isEnabled);
    });

    // 处理开关状态变化
    enableExtension.addEventListener('change', function() {
        const isEnabled = this.checked;
        chrome.storage.sync.set({ extensionEnabled: isEnabled });
        updateStatusText(isEnabled);
        updateIcon(isEnabled);
        
        // 通知所有标签页更新状态
        chrome.tabs.query({}, function(tabs) {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'updateExtensionState',
                    enabled: isEnabled
                }).catch(() => {
                    // 忽略无法发送消息的标签页（比如 chrome:// 页面）
                });
            });
        });
    });

    function updateStatusText(isEnabled) {
        statusText.textContent = isEnabled ? 'Extension is enabled' : 'Extension is disabled';
    }

    function updateIcon(isEnabled) {
        const iconPath = isEnabled ? {
            "16": "icons/icon16a.png",
            "32": "icons/icon32a.png"
        } : {
            "16": "icons/icon16han.png",
            "32": "icons/icon32han.png"
        };
        chrome.action.setIcon({ path: iconPath });
    }
}); 