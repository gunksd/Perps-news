# 🚀 Vercel 部署指南

## ✅ 方案可行性分析

### 完美的部署架构

这个项目**非常适合**部署到 Vercel！架构设计完美匹配：

```
GitHub Actions (定时采集)
    ↓
    更新数据到 GitHub 仓库
    ↓
    触发 Vercel 自动部署
    ↓
    用户访问最新数据 ✨
```

### 优势

- ✅ **零成本**：Hobby 免费计划完全够用
- ✅ **全球 CDN**：毫秒级响应速度
- ✅ **自动部署**：GitHub 推送自动触发
- ✅ **无服务器**：无需管理服务器
- ✅ **完美集成**：Vercel 是 Next.js 开发商

## 📋 部署步骤

### 第一步：准备项目

项目已经准备就绪，包括：
- ✅ `vercel.json` 配置文件
- ✅ Next.js 14 项目结构
- ✅ 环境变量配置
- ✅ 数据文件已提交到 Git

### 第二步：部署到 Vercel

#### 方式 A：通过 Vercel Dashboard（推荐）

1. **登录 Vercel**
   - 访问：https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 **Add New** → **Project**
   - 选择你的 GitHub 仓库：`gunksd/Perps-news`
   - 点击 **Import**

3. **配置项目**

   **Root Directory（根目录）**：
   ```
   .
   ```
   或留空（默认就是根目录）

   **Framework Preset**：
   ```
   Next.js
   ```
   （自动识别，无需修改）

   **Build Command**（构建命令）：
   ```
   npm run build
   ```

   **Output Directory**（输出目录）：
   ```
   .next
   ```

   **Install Command**（安装命令）：
   ```
   npm install
   ```

4. **环境变量配置**

   在 **Environment Variables** 部分添加（可选，前端不需要 API Key）：

   | 变量名 | 值 | 说明 |
   |--------|-----|------|
   | `NEXT_PUBLIC_APP_NAME` | `Perps News AI` | 应用名称 |
   | `NEXT_PUBLIC_GITHUB_URL` | `https://github.com/gunksd/Perps-news` | GitHub 链接 |

   **⚠️ 重要**：**不要**在 Vercel 添加 `OPENAI_API_KEY`
   - 前端不需要 API Key
   - API Key 只在 GitHub Actions 中使用
   - 避免暴露敏感信息

5. **部署**
   - 点击 **Deploy** 按钮
   - 等待构建完成（约 2-3 分钟）
   - 获得部署 URL：`https://your-project.vercel.app`

#### 方式 B：通过命令行

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产部署
vercel --prod
```

### 第三步：配置自动部署

Vercel 默认已启用自动部署：

- ✅ **GitHub 推送** → 自动部署到预览环境
- ✅ **main 分支推送** → 自动部署到生产环境
- ✅ **Pull Request** → 自动创建预览部署

**完美配合 GitHub Actions**：
1. GitHub Actions 采集新闻（早10点/晚10点）
2. 自动提交更新到仓库
3. Vercel 检测到推送，自动重新部署
4. 用户访问到最新数据 ✨

## 🔧 Vercel 配置详解

### vercel.json 配置说明

```json
{
  "buildCommand": "npm run build",        // 构建命令
  "framework": "nextjs",                   // 框架类型
  "outputDirectory": ".next",              // 输出目录
  "regions": ["hkg1"],                     // 部署区域（香港）
  "headers": [                             // API 缓存配置
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=300, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

### 推荐的部署区域

```json
"regions": ["hkg1"]  // 香港（推荐中国用户）
"regions": ["sin1"]  // 新加坡（备选）
"regions": ["sfo1"]  // 旧金山（美国用户）
```

## 📊 工作流程

### 完整的自动化流程

```mermaid
graph LR
    A[定时触发<br/>10:00/22:00] --> B[GitHub Actions<br/>采集新闻]
    B --> C[AI 分析]
    C --> D[提交数据到<br/>GitHub]
    D --> E[触发 Vercel<br/>自动部署]
    E --> F[用户访问<br/>最新数据]
```

### 数据更新时间轴

```
10:00 - GitHub Actions 开始采集
10:02 - 数据分析完成，提交到 GitHub
10:03 - Vercel 检测到推送，开始构建
10:05 - 构建完成，部署到生产环境
10:10 - ISR 缓存过期，用户看到新数据
```

## 🎯 性能优化

### ISR（增量静态再生成）

项目已配置 ISR：
```typescript
export const revalidate = 300 // 5分钟
```

优势：
- ✅ 静态页面速度
- ✅ 动态数据更新
- ✅ 自动缓存管理
- ✅ 降低 API 调用

### CDN 加速

Vercel 全球 CDN 节点：
- 🌏 亚洲：香港、新加坡、东京
- 🌎 美洲：旧金山、华盛顿
- 🌍 欧洲：伦敦、法兰克福

## 🔍 监控和调试

### Vercel Dashboard

部署后可以在 Dashboard 查看：
- 📊 实时访问统计
- 🚀 部署历史和日志
- ⚡ 性能监控
- 🔍 错误追踪

### 实时日志

```bash
# 查看实时日志
vercel logs [deployment-url]

# 查看生产环境日志
vercel logs --prod
```

## 💰 成本分析

### Hobby 免费计划（推荐）

包含：
- ✅ 无限部署
- ✅ 100GB 带宽/月
- ✅ 全球 CDN
- ✅ 自动 HTTPS
- ✅ 自定义域名

**完全够用**：
- 预计访问：< 10,000 次/天
- 预计带宽：< 10GB/月
- 预计构建：2-4 次/天

### 升级到 Pro（可选）

$20/月，包含：
- 1TB 带宽
- 更快构建速度
- 团队协作功能
- 优先支持

## 🌐 自定义域名（可选）

### 添加自定义域名

1. 在 Vercel Dashboard 进入项目
2. 点击 **Settings** → **Domains**
3. 添加你的域名
4. 配置 DNS：
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

## ⚠️ 注意事项

### 数据文件大小

- ✅ 当前：约 370KB（analyses.json + news.json）
- ⚠️ 建议限制：< 5MB
- 💡 优化策略：
  - 只保留最近 7 天的数据
  - 定期清理旧数据
  - 考虑使用数据库（如需长期存储）

### 构建时间

- 正常：2-3 分钟
- 超时限制：45 分钟（Hobby 计划）
- 优化：已配置依赖缓存

### API 路由限制

- 执行时间限制：10 秒（Hobby）
- 请求体大小：4.5MB
- 响应大小：4.5MB

当前 API 都在限制内 ✅

## 🚨 故障排查

### 问题：构建失败

**检查**：
1. 查看构建日志
2. 确认依赖安装正确
3. 本地运行 `npm run build` 测试

### 问题：数据不更新

**检查**：
1. GitHub Actions 是否正常执行
2. Vercel 是否检测到推送
3. ISR 缓存是否过期（等待 5 分钟）

### 问题：页面 404

**检查**：
1. 路由配置是否正确
2. 文件名是否正确（大小写敏感）
3. 动态路由是否生成

## 🎓 最佳实践

### 环境管理

```bash
# 开发环境
vercel dev

# 预览部署
vercel

# 生产部署
vercel --prod
```

### 版本控制

- ✅ 为每个部署自动生成 URL
- ✅ 可以回滚到任何历史版本
- ✅ PR 预览自动创建

### 团队协作

- 邀请团队成员
- 权限管理
- 部署审批流程

## 📞 获取帮助

遇到问题？查看：
- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Vercel 社区](https://github.com/vercel/vercel/discussions)
- 项目 Issues 页面

## 🎉 部署成功后

### 验证清单

- [ ] 网站可以正常访问
- [ ] 新闻数据正常显示
- [ ] 中英文切换正常
- [ ] 深色模式正常
- [ ] 导出功能正常
- [ ] 移动端响应式正常

### 分享你的项目

部署成功后，获得：
- 🌐 生产 URL：`https://your-project.vercel.app`
- 🔗 GitHub 链接：已配置在页面中
- 📱 分享到社交媒体

### 下一步优化

- 添加 Google Analytics
- 配置自定义域名
- 启用 Vercel Analytics
- 添加 SEO 优化
- 配置 OG 图片

---

## 🚀 现在就开始部署吧！

访问：https://vercel.com/new

导入仓库：`gunksd/Perps-news`

根目录设置：`.` 或留空

点击 **Deploy** → 等待 2-3 分钟 → 完成！✨
