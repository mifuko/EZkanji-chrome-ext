// content.js

let tokenizer;
let isProcessing = false;

// 添加样式
const style = document.createElement('style');
style.textContent = `
    .ezkanji-ruby {
        display: inline-block;
        position: relative;
        margin: 0;
        line-height: 2.2; /* 增加整体行高 */
        white-space: nowrap;
        -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
    }
    .ezkanji-ruby rt {
        position: absolute;
        top: -0.6em; /* 让注音更靠近汉字 */
        left: -1.2em;
        right: -1.2em;
        text-align: center;
        font-size: 0.6em;
        line-height: 1;
        color: #666;
        white-space: nowrap;
        overflow: visible; /* 允许注音溢出 */
        text-overflow: clip;
        pointer-events: none; /* 防止注音文本影响点击 */
        z-index: 1; /* 确保注音显示在其他内容之上 */
    }
    /* 相邻ruby元素的样式 */
    .ezkanji-ruby.adjacent-ruby rt {
        left: -0.15em;
        right: -0.15em;
    }
    /* 可以向左扩展的样式 */
    .ezkanji-ruby.can-extend-left rt {
        left: -1.2em;
    }
    /* 可以向右扩展的样式 */
    .ezkanji-ruby.can-extend-right rt {
        right: -1.2em;
    }
    /* 下一个是ruby的样式 */
    .ezkanji-ruby.next-is-ruby rt {
        right: -0.15em;
    }
    .ezkanji-text {
        position: relative;
        z-index: 0;
        line-height: 2.2; /* 保持与非ruby文本相同的行高 */
    }
    .ezkanji-ruby:hover rt,
    .ezkanji-ruby.active rt {
        color: #000;
        font-weight: bold;
    }
    .ezkanji-ruby {
        word-break: keep-all;
        word-wrap: normal;
    }
    
    /* 移动设备特定样式 */
    @media (max-width: 768px) {
        .ezkanji-ruby {
            padding: 0.2em 0;
            line-height: 2.4; /* 移动端更大的行高 */
        }
        .ezkanji-ruby rt {
            font-size: 0.7em;
            top: -0.7em; /* 移动端注音也靠近汉字 */
            left: -1.5em;
            right: -1.5em;
        }
        .ezkanji-text {
            line-height: 2.4; /* 移动端保持相同的行高 */
        }
        .ezkanji-ruby.adjacent-ruby rt {
            left: -0.3em;
            right: -0.3em;
        }
        .ezkanji-ruby.can-extend-left rt {
            left: -1.5em;
        }
        .ezkanji-ruby.can-extend-right rt {
            right: -1.5em;
        }
        .ezkanji-ruby.next-is-ruby rt {
            right: -0.3em;
        }
    }
`;
document.head.appendChild(style);

// 添加移动设备触摸支持
document.addEventListener('DOMContentLoaded', function() {
    // 检测是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // 为移动设备添加触摸事件处理
        document.addEventListener('touchstart', function(e) {
            const ruby = e.target.closest('.ezkanji-ruby');
            if (ruby) {
                // 移除其他ruby的active状态
                document.querySelectorAll('.ezkanji-ruby.active').forEach(el => {
                    if (el !== ruby) el.classList.remove('active');
                });
                // 切换当前ruby的active状态
                ruby.classList.toggle('active');
                e.preventDefault(); // 防止触发其他事件
            } else {
                // 点击非ruby区域时移除所有active状态
                document.querySelectorAll('.ezkanji-ruby.active').forEach(el => {
                    el.classList.remove('active');
                });
            }
        }, { passive: false });
    }
});

// 将片假名转换为平假名
function toHiragana(text) {
    if (!text) return '';
    return text.replace(/[\u30a1-\u30f6]/g, function(match) {
        const chr = match.charCodeAt(0) - 0x60;
        return String.fromCharCode(chr);
    });
}

// 检查是否包含汉字
function containsKanji(text) {
    if (!text || typeof text !== 'string') return false;
    return /[\u4e00-\u9faf\u3400-\u4dbf]/.test(text);
}

// 处理页面内容
function processPageContent() {
    if (isProcessing) return;
    isProcessing = true;
    
    console.log('Processing all Japanese text content on the page...');
    
    // 排除不需要处理的元素
    const excludeSelectors = [
        'script',
        'style',
        'noscript',
        'iframe',
        'textarea',
        'input',
        'button',
        'select',
        'option',
        'meta',
        'link',
        'title',
        'head',
        'footer',
        'nav',
        'header',
        '.ezkanji-ruby', // 已经处理过的内容
        '.ezkanji-ignore' // 用户标记为忽略的内容
    ];
    
    // 创建树遍历器
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                // 跳过不需要处理的元素
                if (excludeSelectors.some(selector => 
                    node.parentElement && node.parentElement.matches(selector))) {
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
            const fragment = document.createDocumentFragment();
            let lastTokenHadRuby = false;
            let nextTokenIsRuby = false;

            // 先检查下一个token是否是ruby
            for (let i = 0; i < tokens.length; i++) {
                if (i < tokens.length - 1 && containsKanji(tokens[i + 1].surface_form)) {
                    nextTokenIsRuby = true;
                } else {
                    nextTokenIsRuby = false;
                }

                if (containsKanji(tokens[i].surface_form)) {
                    const ruby = document.createElement('ruby');
                    ruby.className = 'ezkanji-ruby';
                    
                    // 根据上下文添加不同的类
                    if (lastTokenHadRuby) {
                        ruby.classList.add('adjacent-ruby');
                    }
                    if (nextTokenIsRuby) {
                        ruby.classList.add('next-is-ruby');
                    }
                    // 如果是第一个汉字，可以向左扩展
                    if (i === 0 || !containsKanji(tokens[i - 1].surface_form)) {
                        ruby.classList.add('can-extend-left');
                    }
                    // 如果是最后一个汉字，可以向右扩展
                    if (i === tokens.length - 1 || !containsKanji(tokens[i + 1].surface_form)) {
                        ruby.classList.add('can-extend-right');
                    }
                    
                    const rb = document.createElement('rb');
                    rb.textContent = tokens[i].surface_form;
                    
                    const rt = document.createElement('rt');
                    // 获取读音并转换为平假名
                    const reading = tokens[i].reading || tokens[i].pronunciation || '';
                    rt.textContent = toHiragana(reading);
                    
                    ruby.appendChild(rb);
                    ruby.appendChild(rt);
                    fragment.appendChild(ruby);
                    
                    lastTokenHadRuby = true;
                } else {
                    const span = document.createElement('span');
                    span.className = 'ezkanji-text';
                    span.textContent = tokens[i].surface_form;
                    fragment.appendChild(span);
                    lastTokenHadRuby = false;
                }
            }
            
            if (fragment.childNodes.length > 0) {
                node.parentNode.replaceChild(fragment, node);
            }
        } catch (error) {
            console.error('Error processing text node:', error);
        }
    });
    
    isProcessing = false;
    console.log('Finished processing page content');
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
            
            // 开始处理页面内容
            processPageContent();
        });
    } catch (error) {
        console.error('Exception during Kuromoji initialization:', error);
    }
}

// 检查 kuromoji 是否已加载
if (typeof window.kuromoji === 'undefined') {
    console.error('Kuromoji is not loaded');
} else {
    console.log('Kuromoji is available:', window.kuromoji);
    initializeKuromoji();
}
