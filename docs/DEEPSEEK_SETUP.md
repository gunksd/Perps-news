# DeepSeek API 配置指南

本项目使用 DeepSeek API 进行 AI 分析，以下是详细配置步骤。

## 获取 API Key

### 1. 注册 DeepSeek 账号

访问 [https://platform.deepseek.com/](https://platform.deepseek.com/)

- 支持邮箱注册
- 支持手机号注册
- 新用户通常赠送免费额度

### 2. 创建 API Key

1. 登录后进入控制台
2. 点击左侧菜单的 "API Keys"
3. 点击 "Create API Key" 按钮
4. 为 API Key 命名（如：perps-news）
5. 复制生成的 API Key（只显示一次，请妥善保存）

### 3. 配置到项目

将 API Key 添加到 `.env.local` 文件：

```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx  # 你的 DeepSeek API Key
AI_API_ENDPOINT=https://api.deepseek.com/v1/chat/completions
AI_MODEL=deepseek-chat
```

## API 配置说明

### 可用模型

| 模型名称 | 说明 | 适用场景 |
|---------|------|---------|
| `deepseek-chat` | 通用对话模型 | **推荐**，本项目默认使用 |
| `deepseek-coder` | 代码专用模型 | 不适合财经分析 |

### API 端点

```
https://api.deepseek.com/v1/chat/completions
```

完全兼容 OpenAI API 格式，无需修改代码。

### 速率限制

| 限制类型 | 免费用户 | 付费用户 |
|---------|---------|---------|
| 每分钟请求数 | 60 | 600 |
| 每天请求数 | 5000 | 无限制 |

**本项目的请求频率**：
- 新闻采集：每小时 1 次
- AI 分析：每条新闻 1 次请求
- 汇总分析：每天 2 次

预计每天约 **50-100 次请求**，免费额度完全够用。

## 成本说明

### 定价（2024年）

| 服务 | 输入（每百万 tokens） | 输出（每百万 tokens） |
|-----|---------------------|---------------------|
| DeepSeek | ¥1 | ¥2 |
| OpenAI GPT-4o-mini | ¥10 | ¥30 |

### 预估成本

假设每天分析 50 条新闻，每条新闻：
- 输入：~500 tokens（新闻内容 + prompt）
- 输出：~300 tokens（分析结果）

**每日成本**：
```
输入：50 * 500 / 1,000,000 * ¥1 = ¥0.025
输出：50 * 300 / 1,000,000 * ¥2 = ¥0.03
总计：约 ¥0.055/天
```

**月成本**：约 **¥1.65**

加上汇总分析，实际月成本约 **¥3-5**，非常经济。

## 替换为其他 AI 服务

如果需要使用其他 AI 服务，只需修改 `.env.local`：

### 使用 OpenAI

```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
AI_API_ENDPOINT=https://api.openai.com/v1/chat/completions
AI_MODEL=gpt-4o-mini
```

### 使用国内中转服务

```bash
OPENAI_API_KEY=your_key
AI_API_ENDPOINT=https://your-proxy.com/v1/chat/completions
AI_MODEL=gpt-4o-mini
```

### 使用本地模型（Ollama）

```bash
OPENAI_API_KEY=dummy  # 本地模型不需要 key
AI_API_ENDPOINT=http://localhost:11434/v1/chat/completions
AI_MODEL=qwen2.5:7b
```

## 故障排除

### 1. API Key 无效

**错误信息**：`401 Unauthorized`

**解决方法**：
- 检查 API Key 是否正确复制
- 确认 API Key 未过期
- 重新生成新的 API Key

### 2. 请求频率超限

**错误信息**：`429 Too Many Requests`

**解决方法**：
- 在 `lib/analyzers/newsAnalyzer.ts` 中增加延迟
- 升级到付费账户
- 减少采集频率

### 3. 连接超时

**错误信息**：`Network timeout`

**解决方法**：
- 检查网络连接
- 确认 API 端点是否正确
- 尝试增加超时时间

## 测试配置

运行以下命令测试 API 配置是否正常：

```bash
npm run collect analyze
```

如果配置正确，应该能看到新闻分析结果。

## 安全建议

1. ⚠️ **不要将 API Key 提交到 Git**
   - `.env.local` 已在 `.gitignore` 中
   - 使用 `.env.example` 作为模板

2. 🔒 **定期轮换 API Key**
   - 建议每 3-6 个月更换一次
   - 发现泄露立即撤销并重新生成

3. 🛡️ **限制 API Key 权限**
   - 在 DeepSeek 控制台设置使用限额
   - 启用 IP 白名单（如果支持）

## 联系支持

- DeepSeek 官方文档：[https://platform.deepseek.com/docs](https://platform.deepseek.com/docs)
- 项目 Issues：[https://github.com/gunksd/Perps-news/issues](https://github.com/gunksd/Perps-news/issues)
