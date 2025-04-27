// inject-config.js
// 设置字典路径
window.EZKANJI_DICT_PATH = chrome.runtime.getURL('lib/dict');
script.onerror = () => {
    console.error(`EZkanji: Failed to inject ${file}`);
    script.remove();
};