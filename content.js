console.log("EZkanji: content script loaded!"); 
// 定义一个函数来处理网页上的所有文本节点
function addFuriganaToTextNodes() {
    // 获取所有的文本节点
    const textNodes = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
  
    let node;
    while ((node = textNodes.nextNode())) {
      // 只处理非空的文本节点
      if (node.nodeValue.trim() === "") continue;
  
      // 获取文本内容并进行处理
      const originalText = node.nodeValue;
      const furiganaText = convertKanjiToFurigana(originalText);
  
      // 替换原始文本为注音文本
      node.nodeValue = furiganaText;
    }
  }
  
  // 假设的转换函数，它将汉字替换为带有假名的格式（示范）
  function convertKanjiToFurigana(text) {
    // 在这个简化版本中，我们只是做一个简单的示范
    // 实际中，我们需要利用一个 API 或者自定义的库来进行汉字到假名的转换
    return text.replace(/([一-龯]+)/g, (match) => {
      // 这里我们只是模拟假名的注音，在实际情况中会调用API获取假名
      return `<ruby>${match}<rt>ふりがな</rt></ruby>`;
    });
  }
  
  // 页面加载完毕后调用这个函数
  addFuriganaToTextNodes();
  