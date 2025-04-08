# Attention List

一个帮助管理注意力的应用程序。

## 设置 API

1. 复制 `src/services/aiService.example.js` 为 `src/services/aiService.js`
2. 在 `aiService.js` 中替换 `your-api-key-here` 为你的 DeepSeek API 密钥
3. 确保 `.gitignore` 文件中包含 `src/services/aiService.js`，这样你的 API 密钥就不会被提交到 GitHub

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start
```

## 构建

```bash
npm run build
``` 