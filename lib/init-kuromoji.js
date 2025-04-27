console.log("EZkanji: init-kuromoji.js executing...");

(function () {
    if (window.__EZKANJI_INITIALIZED__) return;
    window.__EZKANJI_INITIALIZED__ = true;

    if (typeof window.kuromoji === "undefined") {
        console.error("EZkanji: kuromoji is not defined in page context");
        return;
    }

    const dictPath = window.EZKANJI_DICT_PATH || "./dict";

    // 初始化 kuromoji 分词器
    window.kuromoji.builder({ dicPath: dictPath }).build(function (err, tokenizer) {
        if (err) {
            console.error("EZkanji: tokenizer build error:", err);
            return;
        }

        console.log("EZkanji: tokenizer ready!");

        // 遍历页面中的文本节点并注入片假名
        addFuriganaToTextNodes(tokenizer);
    });

    // 遍历文本节点并添加片假名
    function addFuriganaToTextNodes(tokenizer) {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        const MAX_NODES = 10000; // 限制处理的节点数量
        let processedNodes = 0;

        while ((node = walker.nextNode())) {
            if (processedNodes++ > MAX_NODES) {
                console.warn("EZkanji: Node processing limit reached");
                break;
            }

            if (node.nodeValue.trim() === "") continue;

            try {
                const tokens = tokenizer.tokenize(node.nodeValue);
                const rubyText = tokens
                    .map((token) => {
                        if (!token.reading || token.surface_form === token.reading) {
                            return token.surface_form; // 无需注音
                        }
                        return `<ruby>${token.surface_form}<rt>${toKatakana(
                            token.reading
                        )}</rt></ruby>`;
                    })
                    .join("");

                const span = document.createElement("span");
                span.innerHTML = rubyText;
                node.parentNode.replaceChild(span, node);
            } catch (e) {
                console.error("EZkanji: tokenize error", e);
            }
        }
    }

    // 将平假名转换为片假名
    function toKatakana(hiragana) {
        return hiragana.replace(/[\u3041-\u3096]/g, (char) =>
            String.fromCharCode(char.charCodeAt(0) + 0x60)
        );
    }
})();