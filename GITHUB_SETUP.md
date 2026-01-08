# 🚀 GitHub Actions 快速配置指南

## ⚠️ 重要：配置 GitHub Secrets

在推送代码到 GitHub 后，**必须**配置以下 Secrets 才能让自动化采集正常工作。

### 📝 配置步骤

#### 1. 进入仓库设置
- 打开你的 GitHub 仓库
- 点击 **Settings** 标签
- 左侧菜单选择 **Secrets and variables** → **Actions**

#### 2. 添加必需的 Secrets

点击 **New repository secret**，依次添加：

##### Secret 1: OPENAI_API_KEY (必需)
```
Name: OPENAI_API_KEY
Value: sk-38ac064eb23b4e118f3fd2c3522241c4
```
**⚠️ 重要**：这是你的 DeepSeek API Key，请从 `.env.local` 复制

##### Secret 2: AI_API_ENDPOINT (可选，推荐)
```
Name: AI_API_ENDPOINT
Value: https://api.deepseek.com/v1/chat/completions
```

##### Secret 3: AI_MODEL (可选，推荐)
```
Name: AI_MODEL
Value: deepseek-chat
```

### 🔒 安全提示

- ✅ **千万不要**将 `.env.local` 文件提交到 Git
- ✅ `.env.local` 已在 `.gitignore` 中被忽略
- ✅ 只通过 GitHub Secrets 管理敏感信息
- ✅ 定期更换 API Key

### ✅ 验证配置

配置完成后，测试一下：

1. 进入仓库的 **Actions** 标签
2. 选择 **Scheduled News Collection** 工作流
3. 点击 **Run workflow** → **Run workflow**
4. 查看运行日志，确认没有错误

### 📅 自动执行时间

配置完成后，GitHub Actions 将自动在以下时间执行：
- **早上 10:00**（北京时间）
- **晚上 22:00**（北京时间）

### 🎯 期望结果

执行成功后，你会看到：
- ✅ 新的新闻数据被采集
- ✅ AI 自动分析完成
- ✅ 数据文件被自动提交到仓库
- ✅ 网站显示最新新闻（5分钟后）

### ❌ 常见问题

#### 问题：找不到 package-lock.json
**解决**：已修复，工作流现在会自动处理

#### 问题：API 调用失败
**检查**：
- OPENAI_API_KEY 是否正确
- API 额度是否充足
- API_ENDPOINT 是否正确

#### 问题：提交失败
**检查**：
- Actions 是否有写入权限
- 仓库是否启用了 Actions

### 📊 监控使用

建议定期检查：
- GitHub Actions 执行日志
- DeepSeek API 使用量
- API 费用

### 🔄 下一步

配置完成后：
1. ✅ 等待自动执行（早10点/晚10点）
2. ✅ 或手动触发测试
3. ✅ 检查网站是否显示最新数据

---

## 📞 需要帮助？

如遇到问题，请查看：
- 详细文档：`docs/GITHUB_ACTIONS_SETUP.md`
- GitHub Actions 日志
- 项目 Issues 页面
