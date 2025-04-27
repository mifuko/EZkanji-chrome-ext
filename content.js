// content.js

let tokenizer;
let isProcessing = false;

// 添加样式
const style = document.createElement('style');
style.textContent = `
    .ezkanji-ruby {
        display: inline-block;
        position: relative;
        margin: 0 0.1em;
        line-height: 1.5;
    }
    .ezkanji-ruby rt {
        position: absolute;
        top: -1em;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 0.6em;
        line-height: 1;
        color: #666;
    }
    .ezkanji-ruby:hover rt {
        color: #000;
        font-weight: bold;
    }
`;
document.head.appendChild(style);

// 将片假名转换为平假名
function toHiragana(text) {
    if (!text) return '';
    return text.replace(/[\u30a1-\u30f6]/g, function(match) {
        const chr = match.charCodeAt(0) - 0x60;
        return String.fromCharCode(chr);
    });
}

// 初始化 kuromoji
function initializeKuromoji() {
    try {
        console.log('Initializing Kuromoji...');
        
        if (typeof window.kuromoji === 'undefined' || typeof window.kuromoji.builder !== 'function') {
            console.error('Kuromoji is not properly initialized');
            return;
        }

        const builder = window.kuromoji.builder({ 
            dicPath: chrome.runtime.getURL('dict/'),
            debug: false
        });

        builder.build((err, tokenInstance) => {
            if (err) {
                console.error('Error initializing Kuromoji:', err);
                return;
            }
            console.log('Kuromoji initialized successfully');
            tokenizer = tokenInstance;
            
            // 开始处理文章内容
            processArticleContent();
        });
    } catch (error) {
        console.error('Exception during Kuromoji initialization:', error);
    }
}

// 检查是否包含汉字
function containsKanji(text) {
    if (!text || typeof text !== 'string') return false;
    return /[\u4e00-\u9faf\u3400-\u4dbf]/.test(text);
}

// 处理文章内容
function processArticleContent() {
    if (isProcessing) return;
    isProcessing = true;
    
    // 查找文章正文区域
    const articleSelectors = [
        'article',
        '.article',
        '.article-body',
        '.article-content',
        '.article-main',
        '.main-content'
    ];
    
    let articleElement = null;
    for (const selector of articleSelectors) {
        articleElement = document.querySelector(selector);
        if (articleElement) break;
    }
    
    if (!articleElement) {
        console.log('No article content found');
        isProcessing = false;
        return;
    }
    
    console.log('Found article content, processing...');
    
    const walker = document.createTreeWalker(
        articleElement,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                // 跳过脚本和样式标签
                if (node.parentNode && 
                    (node.parentNode.tagName === 'SCRIPT' || 
                     node.parentNode.tagName === 'STYLE' ||
                     node.parentNode.tagName === 'NOSCRIPT')) {
                    return NodeFilter.FILTER_REJECT;
                }
                
                // 跳过已经处理过的节点
                if (node.parentNode && node.parentNode.classList && 
                    node.parentNode.classList.contains('ezkanji-ruby')) {
                    return NodeFilter.FILTER_REJECT;
                }
                
                // 检查文本内容
                const text = node.nodeValue.trim();
                if (!text || text.length < 1) return NodeFilter.FILTER_SKIP;
                
                return containsKanji(text) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
            }
        },
        false
    );

    const nodes = [];
    let node;
    while (node = walker.nextNode()) {
        nodes.push(node);
    }
    
    console.log('Found', nodes.length, 'text nodes to process');
    
    // 处理所有找到的文本节点
    nodes.forEach(node => {
        try {
            const text = node.nodeValue.trim();
            if (!text || !containsKanji(text)) return;
            
            const tokens = tokenizer.tokenize(text);
            const container = document.createElement('span');
            
            tokens.forEach(token => {
                if (containsKanji(token.surface_form)) {
                    const ruby = document.createElement('ruby');
                    ruby.className = 'ezkanji-ruby';
                    
                    const rb = document.createElement('rb');
                    rb.textContent = token.surface_form;
                    
                    const rt = document.createElement('rt');
                    // 获取读音并转换为平假名
                    const reading = token.reading || token.pronunciation || '';
                    rt.textContent = toHiragana(reading);
                    
                    ruby.appendChild(rb);
                    ruby.appendChild(rt);
                    container.appendChild(ruby);
                } else {
                    container.appendChild(document.createTextNode(token.surface_form));
                }
            });
            
            if (container.childNodes.length > 0) {
                node.parentNode.replaceChild(container, node);
            }
        } catch (error) {
            console.error('Error processing text node:', error);
        }
    });
    
    isProcessing = false;
    console.log('Finished processing article content');
}

// 检查 kuromoji 是否已加载
if (typeof window.kuromoji === 'undefined') {
    console.error('Kuromoji is not loaded');
} else {
    console.log('Kuromoji is available:', window.kuromoji);
    initializeKuromoji();
}
