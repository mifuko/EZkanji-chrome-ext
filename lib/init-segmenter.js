console.log("EZkanji: init-segmenter.js executing...");

(function () {
    if (window.__EZKANJI_INITIALIZED__) return;
    window.__EZKANJI_INITIALIZED__ = true;

    // 初始化 TinySegmenter
    const segmenter = new TinySegmenter();

    // 遍历页面中的文本节点并注入片假名
    addFuriganaToTextNodes();

    function addFuriganaToTextNodes() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        while ((node = walker.nextNode())) {
            if (node.nodeValue.trim() === "") continue;

            try {
                const tokens = segmenter.segment(node.nodeValue);
                const rubyText = tokens
                    .map((token) => {
                        if (isKanji(token)) {
                            const reading = getReading(token); // 获取假名读音
                            return `<ruby>${token}<rt>${reading}</rt></ruby>`;
                        }
                        return token;
                    })
                    .join("");

                const span = document.createElement("span");
                span.innerHTML = rubyText;
                node.parentNode.replaceChild(span, node);
            } catch (e) {
                console.error("EZkanji: segmenter error", e);
            }
        }
    }

    // 判断是否为汉字
    function isKanji(char) {
        return /[\u4e00-\u9faf]/.test(char);
    }

    // 获取汉字的假名读音（伪实现）
    function getReading(kanji) {
        // 简单映射，实际可以从 Sudachi 词典中查找
        const dictionary = {
            日本: "にほん",
            語: "ご",
            漢字: "かんじ",
        };
        return dictionary[kanji] || "ふりがな"; // 默认返回 "ふりがな"
    }
})();