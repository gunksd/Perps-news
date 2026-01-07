# 快速启动指南

本指南帮助你在 5 分钟内运行项目。

## 📦 前置要求

- Node.js 18+ 已安装
- npm 或 yarn 已安装
- 有效的网络连接

检查版本：
```bash
node --version  # 应该 >= 18.0.0
npm --version
```

---

## 🚀 启动步骤

### 1. 安装依赖（已完成✅）

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 DeepSeek API Key：

```env
# 必需配置
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxx  # 你的 DeepSeek API Key

# 其他配置（可选，使用默认值即可）
AI_API_ENDPOINT=https://api.deepseek.com/v1/chat/completions
AI_MODEL=deepseek-chat
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**如何获取 DeepSeek API Key**？
1. 访问 https://platform.deepseek.com/
2. 注册并登录
3. 进入 API Keys → Create New Key
4. 复制 Key 并粘贴到 `.env.local`

### 3. 测试 API 配置

```bash
npm run test:api
```

**预期输出**：
```
✅ API 测试成功！
📝 AI 回复：我是一个专业的金融新闻分析师...
🎉 DeepSeek API 配置正确，项目可以正常运行！
```

如果失败，请检查：
- API Key 是否正确
- 网络连接是否正常
- 是否有使用限额

### 4. 启动开发服务器

```bash
npm run dev
```

**预期输出**：
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

### 5. 访问应用

在浏览器中打开：
- 中文版：http://localhost:3000/zh
- 英文版：http://localhost:3000/en

---

## 🎯 首次使用

### 当前状态

由于这是首次启动，你会看到：
- ✅ 页面正常显示
- ⚠️ **暂无新闻数据**（正常！需要先采集）
- ✅ 指数面板正常工作（从 Yahoo Finance 获取）

### 开始采集新闻

在新的终端窗口运行：

```bash
# 完整流程：采集 + 分析 + 汇总
npm run collect

# 或者分步执行：
npm run collect collect  # 仅采集
npm run collect analyze  # 仅分析
npm run collect summary  # 仅汇总
```

**预期输出**：
```
[Collect] Starting news collection...
[Collect] Jin10Collector: 15 items
[Collect] CCTVCollector: 8 items
[Collect] Saved 23 news items

[Analyze] Analyzing 23 news items...
[Analyze] ✓ news_id_1
[Analyze] ✓ news_id_2
...
[Analyze] Saved 23 analyses

[Summary] Generating market impact summaries...
[Summary] ✓ 中证指数
[Summary] ✓ 纳斯达克指数
```

### 刷新页面

采集完成后，刷新浏览器，你应该能看到：
- ✅ 新闻卡片展示
- ✅ AI 分析内容
- ✅ 市场影响判断

---

## 📁 项目结构

```
Perps-news/
├── app/                    # Next.js 应用
│   ├── [locale]/          # 国际化路由
│   └── api/               # API 路由
├── lib/                   # 核心业务逻辑
│   ├── collectors/        # 新闻采集器
│   ├── analyzers/         # AI 分析器
│   └── indices/           # 指数数据
├── data/                  # 数据存储目录（自动创建）
│   ├── news.json         # 新闻数据
│   ├── analyses.json     # 分析结果
│   └── summaries.json    # 汇总数据
├── .env.local            # 环境变量（你需要创建）
└── package.json          # 项目配置
```

---

## 🔄 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm start` | 启动生产服务器 |
| `npm run test:api` | 测试 API 配置 |
| `npm run collect` | 执行数据采集和分析 |
| `npm run collect collect` | 仅采集新闻 |
| `npm run collect analyze` | 仅分析新闻 |
| `npm run collect summary` | 仅生成汇总 |

---

## ⚠️ 常见问题

### 1. 端口被占用

**错误**：`Port 3000 is already in use`

**解决**：
```bash
# 使用其他端口
PORT=3001 npm run dev

# 或者杀死占用进程
lsof -ti:3000 | xargs kill -9
```

### 2. TypeScript 报错

**错误**：`找不到模块 "next-intl/server"`

**解决**：
- 重启 VS Code
- 或者按 `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### 3. API 请求失败

**错误**：`Failed to fetch news`

**原因**：
- 首次运行，数据目录不存在
- API 路由返回空数据

**解决**：
- 正常现象，执行 `npm run collect` 即可

### 4. 新闻采集失败

**可能原因**：
- 数据源网站结构变化
- 网络连接问题
- RSS 源暂时不可用

**解决**：
- 查看控制台错误日志
- 稍后重试
- 部分数据源失败不影响其他源

---

## 📚 下一步

✅ 项目已成功运行！

接下来你可以：

1. **定期采集数据**
   ```bash
   # 每小时执行一次
   0 * * * * cd /path/to/project && npm run collect
   ```

2. **自定义配置**
   - 修改 AI 分析提示词：`lib/analyzers/newsAnalyzer.ts`
   - 添加新数据源：`lib/collectors/`
   - 调整 UI 样式：`app/[locale]/components/`

3. **查看文档**
   - DeepSeek 配置：[docs/DEEPSEEK_SETUP.md](./DEEPSEEK_SETUP.md)
   - 故障排除：[docs/TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
   - 完整 README：[README.md](../README.md)

4. **部署到生产**
   - Vercel
   - Netlify
   - 自己的服务器

---

## 🎉 成功！

恭喜！你已经成功运行了 Perps News 项目。

有任何问题？
- 查看 [故障排除文档](./TROUBLESHOOTING.md)
- 提交 Issue：https://github.com/gunksd/Perps-news/issues
