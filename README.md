# EZkanji - Chrome Extension

EZkanji 是一个 Chrome 扩展，可以自动为日文网站添加假名注音。

## 功能特点

- 自动为日文汉字添加假名注音
- 支持移动设备触摸操作
- 可以通过工具栏图标快速开启/关闭
- 优化了注音显示效果

## 安装方法

1. 下载项目代码
2. 打开 Chrome 浏览器，进入扩展管理页面 (chrome://extensions/)
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目目录

## 使用方法

1. 安装扩展后，工具栏会出现 EZkanji 图标
2. 点击图标可以开启/关闭注音功能
3. 在移动设备上，点击注音可以切换显示/隐藏

## 项目结构

```
EZkanji/
├── manifest.json          # 扩展配置文件
├── background.js          # 后台脚本
├── content.js            # 内容脚本
├── build/                # 构建文件
│   └── kuromoji.js       # Kuromoji 分词器
├── dict/                 # 字典文件
└── icons/                # 图标文件
```

## 技术栈

- Chrome Extension API
- Kuromoji.js (日语分词器)

## 许可证

MIT License 