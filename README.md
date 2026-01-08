# Perps News - AI驱动的金融新闻分析工具

[English](#english) | [中文](#chinese)

---

<a name="chinese"></a>

## 📊 项目简介

Perps News 是一个专业的金融新闻分析工具，使用 AI 自动汇总和分析每日重大财经新闻，为投资者提供市场影响判断和逻辑分析。

### ✨ 核心特性

- 🤖 **AI 驱动分析**：使用大语言模型对新闻进行精炼总结和市场影响分析
- 📈 **实时指数**：集成中证指数、上证指数、纳斯达克指数实时数据
- 🌍 **双语支持**：完整的中英文界面切换
- 🌓 **主题切换**：支持明暗主题
- 📱 **响应式设计**：完美适配各种设备
- 🔄 **ISR 渲染**：增量静态再生，保证数据新鲜度

### ⚠️ 免责声明

**本项目内容仅用于信息分析和学习参考，不构成任何投资建议。投资有风险，决策需谨慎。**

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/gunksd/Perps-news.git
cd Perps-news
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

复制 `.env.example` 到 `.env.local` 并填写：

```bash
# AI API配置（必需）- 使用 DeepSeek
OPENAI_API_KEY=your_deepseek_api_key
AI_API_ENDPOINT=https://api.deepseek.com/v1/chat/completions
AI_MODEL=deepseek-chat

# 应用配置
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**获取 DeepSeek API Key**：
1. 访问 [https://platform.deepseek.com/](https://platform.deepseek.com/)
2. 注册并登录
3. 在 API Keys 页面创建新的 API Key
4. 复制并粘贴到 `.env.local` 文件

📖 **详细配置指南**：参见 [docs/DEEPSEEK_SETUP.md](./docs/DEEPSEEK_SETUP.md)

**验证配置**：
```bash
npm run test:api
```
如果配置正确，会看到 AI 的测试回复。

4. **启动开发服务器**

```bash
npm run dev
```

访问 [http://localhost:3000/zh](http://localhost:3000/zh)

---

## 💡 为什么选择 DeepSeek？

本项目默认使用 **DeepSeek API** 作为 AI 分析引擎，原因如下：

✅ **成本优势**：DeepSeek 的 API 价格是 OpenAI 的 1/10，非常适合长期运行的工具型项目
✅ **中文优化**：对中文财经新闻分析效果优秀
✅ **兼容性好**：完全兼容 OpenAI API 格式，无需修改代码
✅ **性能稳定**：响应速度快，适合批量分析任务

**成本对比**（每百万 tokens）：
- DeepSeek: ¥1-2
- OpenAI GPT-4o-mini: ¥10-15

💰 **预估成本**：每天分析 50 条新闻 + 2 次汇总，月成本约 **¥5-10**

---

## 📦 项目架构

```
perps-news/
├── app/                      # Next.js 应用
│   ├── [locale]/             # 国际化路由
│   │   ├── components/       # React 组件
│   │   ├── layout.tsx        # 根布局
│   │   └── page.tsx          # 首页
│   ├── api/                  # API 路由
│   │   ├── news/             # 新闻数据 API
│   │   ├── indices/          # 指数数据 API
│   │   └── summary/          # 汇总分析 API
│   └── globals.css           # 全局样式
├── lib/                      # 核心业务逻辑
│   ├── collectors/           # 新闻采集器
│   ├── analyzers/            # AI 分析器
│   ├── indices/              # 指数数据获取
│   ├── storage/              # 数据存储
│   └── types/                # TypeScript 类型
├── messages/                 # 国际化文案
├── scripts/                  # 定时任务脚本
└── public/                   # 静态资源
```

---

## 🔧 核心模块说明

### 1. 数据采集模块（`lib/collectors/`）

- **金十数据**：通过 RSS 采集国内财经快讯
- **财联社**：解析公开页面获取专业财经新闻
- **央视财经**：官方 RSS 源
- **美联储**：美联储官方新闻 RSS

所有数据源均为**免费**且**无需 API Key**。

### 2. AI 分析模块（`lib/analyzers/`）

- **单条新闻分析**：生成中英文总结、市场影响方向、影响逻辑
- **指数级汇总**：每日两次（10:00 / 22:00）生成市场综合影响判断

### 3. 指数数据模块（`lib/indices/`）

使用 Yahoo Finance 公开 API 获取：
- 中证500（000905.SS）
- 上证指数（000001.SS）
- 纳斯达克（^IXIC）

### 4. 前端展示

- **Next.js 14**：App Router + ISR 渲染
- **Tailwind CSS**：响应式设计
- **next-intl**：国际化
- **next-themes**：主题切换

---

## 📅 定时任务

使用 `scripts/scheduledCollect.ts` 执行定时采集和分析：

```bash
# 完整流程（采集 + 分析 + 汇总）
npm run collect

# 仅采集新闻
npm run collect collect

# 仅分析新闻
npm run collect analyze

# 仅生成汇总
npm run collect summary
```

### 生产环境部署建议

使用 cron 或云函数定时执行：

```bash
# 每小时采集新闻
0 * * * * cd /path/to/project && npm run collect collect

# 每小时分析新闻
5 * * * * cd /path/to/project && npm run collect analyze

# 每天 10:00 和 22:00 生成汇总
0 10,22 * * * cd /path/to/project && npm run collect summary
```

---

## 🔧 故障排查

### 已修复的问题

#### 1. YahooFinance 403 Forbidden
**问题**: Yahoo Finance API 拒绝访问（HTTP 403）
**解决方案**: 已添加 User-Agent 和 Accept headers
```typescript
headers: {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json',
}
```

### 2. CCTV RSS 404 错误
**问题**: 原 RSS 源 `http://www.cctv.com/rss/financial.xml` 已失效
**解决方案**: ✅ 已更新为中国新闻网财经 RSS `https://www.chinanews.com/rss/finance.xml`

#### 3. Yahoo Finance 403 Forbidden
**问题**: Yahoo Finance API 拒绝访问（HTTP 403），即使添加headers仍然失败
**解决方案**: ✅ 已切换到**新浪财经API**，完全免费且稳定
- 中证500、上证指数、纳斯达克指数实时数据全部正常
- 使用公开接口：`https://hq.sinajs.cn/list=`
- 代码路径：`lib/indices/sinaFinance.ts`

#### 4. Jin10/CLS API 问题
**问题**:
- Jin10: API 返回 HTTP 502（服务器错误）
- CLS: API 返回 HTTP 404（端点已变更）

**替代方案**:

**方案1: 使用自托管 RSSHub（推荐）**
```bash
# Docker 部署 RSSHub
docker run -d --name rsshub -p 1200:1200 diygod/rsshub

# 然后更新采集器 URL
# Jin10: http://localhost:1200/jin10/telegraph
# CLS: http://localhost:1200/cls/telegraph
```

**方案2: 申请官方 API Key**
- Jin10: 访问 [open.jin10.com](https://open.jin10.com) 申请 API Key
- CLS: 联系财联社申请数据接口权限

**方案3: 使用其他财经数据源**
- 新浪财经 RSS
- 东方财富网
- 华尔街见闻（需要 API Key）

### 当前状态（2026-01-08）

| 功能 | 状态 | 说明 |
|------|------|------|
| 指数实时数据 | ✅ 正常 | 使用新浪财经API |
| 中证500 | ✅ 正常 | s_sh000905 |
| 上证指数 | ✅ 正常 | s_sh000001 |
| 纳斯达克 | ✅ 正常 | int_nasdaq |
| 市场总结 | ✅ 正常 | SummaryPanel组件已添加 |
| CCTV财经新闻 | ✅ 正常 | 使用中国新闻网RSS |
| Fed (美联储) | ✅ 正常 | 官方RSS源 |
| Jin10 (金十数据) | ⚠️ 需配置 | API需认证或已变更 |
| CLS (财联社) | ⚠️ 需配置 | API端点已失效 |

### 2026-01-08 重大更新

1. **新浪财经API替代Yahoo Finance**
   - Yahoo Finance存在严格的反爬虫机制，即使添加headers也无法访问
   - 新浪财经API完全免费、稳定，无需API Key
   - 支持所有需要的指数：中证500、上证指数、纳斯达克
   - K线数据接口也已集成（新浪K线API）

2. **添加SummaryPanel组件**
   - 新增市场总结显示组件
   - 显示短期和中期市场影响
   - 包含置信度指标和生成时间
   - 位于页面右侧，紧跟指数面板之下

3. **所有采集器添加防爬虫headers**
   - 所有RSS和API请求都添加了User-Agent
   - 提高数据采集成功率和稳定性

### 常见问题

**问题: "ETIMEDOUT" 连接超时**
- **原因**: 网络问题或服务器在某些地区被墙
- **解决**: 使用 VPN 或自托管 RSSHub

**问题: 采集到 0 条新闻**
- **原因**: 可能今天没有新闻或过滤规则太严格
- **解决**: 检查 `filterToday()` 方法的日期过滤逻辑

**问题: AI 分析失败**
- **原因**: DeepSeek API Key 未配置或余额不足
- **解决**: 运行 `npm run test:api` 检查配置

### 参考资料

- [金十数据官网](https://www.jin10.com/)
- [财联社官网](https://www.cls.cn/)
- [RSSHub 金融路由文档](https://docs.rsshub.app/zh/routes/finance)
- [中国新闻网 RSS](https://www.chinanews.com/rss/)

---

## 🌐 数据源说明

本项目所有数据源均为公开、免费资源：

| 数据源 | 类型 | 说明 |
|--------|------|------|
| 金十数据 | RSS | 国内财经快讯 |
| 财联社 | HTML | 专业财经新闻 |
| 央视财经 | RSS | 官方权威新闻 |
| 美联储 | RSS | 美联储官方声明 |
| Yahoo Finance | API | 指数实时数据 |

---

## 🛠️ 技术栈

- **框架**：Next.js 14（App Router）
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **国际化**：next-intl
- **主题**：next-themes
- **AI**：DeepSeek API（兼容 OpenAI 格式，成本低廉）
- **数据采集**：rss-parser, cheerio

---

## 📝 开发指南

### 添加新数据源

1. 在 `lib/collectors/` 创建新采集器类，继承 `BaseCollector`
2. 实现 `collect()` 方法
3. 在 `scripts/scheduledCollect.ts` 中注册

### 自定义 AI 分析逻辑

修改 `lib/analyzers/newsAnalyzer.ts` 中的系统提示词（`getSystemPrompt`）。

### 调整 ISR 缓存时间

修改 API 路由或页面的 `revalidate` 配置：

```typescript
export const revalidate = 300 // 秒
```

---

## 📄 许可证

本项目采用 **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** 许可证。

- ✅ 允许：学习、研究、个人使用、非商业分享
- ❌ 禁止：商业使用、盈利性质的部署

详见 [LICENSE](./LICENSE) 文件。

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 贡献建议

- 新增数据源支持
- 优化 AI 分析提示词
- 改进 UI/UX 设计
- 增强错误处理和日志
- 添加单元测试

---

## 📮 联系方式

- **GitHub**: [https://github.com/gunksd/Perps-news](https://github.com/gunksd/Perps-news)
- **Issues**: [提交问题](https://github.com/gunksd/Perps-news/issues)

---

<a name="english"></a>

## 📊 Project Overview

Perps News is a professional financial news analysis tool that uses AI to automatically aggregate and analyze major daily financial news, providing investors with market impact assessments and logical analysis.

### ✨ Key Features

- 🤖 **AI-Powered Analysis**: Uses large language models for concise news summaries and market impact analysis
- 📈 **Real-time Indices**: Integrates CSI 500, Shanghai Composite, and NASDAQ real-time data
- 🌍 **Bilingual Support**: Complete Chinese-English interface switching
- 🌓 **Theme Toggle**: Supports light and dark themes
- 📱 **Responsive Design**: Perfect adaptation to various devices
- 🔄 **ISR Rendering**: Incremental Static Regeneration for data freshness

### ⚠️ Disclaimer

**This project is for informational analysis and educational purposes only. It does not constitute investment advice. Investment involves risks, and decisions should be made carefully.**

---

## 🚀 Quick Start

### Requirements

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the project**

```bash
git clone https://github.com/gunksd/Perps-news.git
cd Perps-news
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env.local` and fill in:

```bash
# AI API Configuration (Required) - Using DeepSeek
OPENAI_API_KEY=your_deepseek_api_key
AI_API_ENDPOINT=https://api.deepseek.com/v1/chat/completions
AI_MODEL=deepseek-chat

# Application Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Get DeepSeek API Key**:
1. Visit [https://platform.deepseek.com/](https://platform.deepseek.com/)
2. Register and login
3. Create a new API Key in the API Keys page
4. Copy and paste to `.env.local` file

📖 **Detailed Configuration Guide**: See [docs/DEEPSEEK_SETUP.md](./docs/DEEPSEEK_SETUP.md)

**Verify Configuration**:
```bash
npm run test:api
```
If configured correctly, you'll see a test response from the AI.

4. **Start development server**

```bash
npm run dev
```

Visit [http://localhost:3000/en](http://localhost:3000/en)

---

## 📝 License

This project is licensed under **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**.

- ✅ Allowed: Learning, research, personal use, non-commercial sharing
- ❌ Prohibited: Commercial use, profit-oriented deployment

See [LICENSE](./LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit Issues and Pull Requests.

---

## 📮 Contact

- **GitHub**: [https://github.com/gunksd/Perps-news](https://github.com/gunksd/Perps-news)
- **Issues**: [Submit Issue](https://github.com/gunksd/Perps-news/issues)
