# 优化后的缓存策略

## 核心理念

数据更新频率：**每天2次**（上午10点、晚上10点）
更新方式：**GitHub Actions 自动采集 → 推送到仓库 → 触发 Vercel 重新部署**

## 缓存架构

### 1. 页面级别 - 完全静态生成

**主页面** (`app/[locale]/page.tsx`)
```typescript
export const dynamic = 'force-static'
export const revalidate = false
```

**策略**：
- ✅ 构建时生成静态页面
- ✅ 无需运行时重新验证
- ✅ 依赖 Vercel 部署时重新生成
- ✅ 极速加载（CDN 边缘缓存）

**原因**：数据文件只在部署时更新，5分钟 ISR 是浪费

---

### 2. API 路由 - 按数据源区分

#### **静态数据 API**（从文件读取）

**`/api/summary` - 市场摘要**
**`/api/news` - 新闻列表**

```typescript
export const dynamic = 'force-static'
export const revalidate = false

headers: {
  'Cache-Control': 'public, max-age=43200, stale-while-revalidate=86400'
}
```

**缓存策略**：
- 🏗️ 构建时静态生成
- 🌐 浏览器缓存 12 小时
- ♻️ 过期后仍可使用旧数据（stale-while-revalidate 24小时）

**原因**：
- 数据只在部署时更新（每12小时）
- 浏览器缓存时间对齐数据更新间隔
- stale-while-revalidate 确保用户始终能快速获得响应

---

#### **动态数据 API**（实时外部调用）

**`/api/indices` - 指数数据**

```typescript
export const dynamic = 'force-dynamic'

headers: {
  'Cache-Control': 'public, max-age=43200, stale-while-revalidate=86400'
}
```

**缓存策略**：
- ⚡ 每次请求动态获取（从新浪财经 API）
- 🌐 浏览器缓存 12 小时
- 📊 避免频繁调用外部 API

**原因**：
- 指数数据需要实时获取
- 但不需要每分钟都调用新浪 API
- 浏览器缓存减少服务器压力

---

### 3. 客户端数据刷新

#### **IndexPanel** - 指数卡片

```typescript
const interval = setInterval(fetchIndices, 300000) // 5分钟
```

**策略**：
- 🔄 每 5 分钟刷新一次（降低自 1 分钟）
- 🌐 依赖浏览器 12 小时缓存
- ⏰ 用户长时间停留时获取更新

**原因**：
- 指数数据实时性要求相对较高
- 但有浏览器缓存，无需频繁轮询
- 平衡实时性和性能

---

#### **SummaryPanel** - 市场摘要

```typescript
useEffect(() => {
  fetchSummaries()
  // 移除轮询
}, [])
```

**策略**：
- 🚫 **移除轮询**
- 📄 仅页面加载时获取一次
- 🔁 用户刷新页面获取最新数据

**原因**：
- 数据每 12 小时才更新一次
- 轮询完全没必要
- 浏览器缓存 12 小时已足够

---

## 优化对比

| 项目 | 优化前 | 优化后 | 节省 |
|------|--------|--------|------|
| **主页面 ISR** | 每5分钟 | 仅部署时 | **144次/天 → 2次/天** |
| **API 路由 ISR** | 每5分钟 | 仅部署时 | **144次/天 → 2次/天** |
| **指数轮询** | 每1分钟 | 每5分钟 | **1440次/天 → 288次/天** |
| **摘要轮询** | 每5分钟 | 无轮询 | **288次/天 → 0次/天** |

**总计节省**：
- 服务器计算：**~99% 减少**
- 文件系统读取：**~99% 减少**
- 外部 API 调用：**~80% 减少**

---

## 数据流程

### GitHub Actions 触发流程

```
1. GitHub Actions 运行（每天2次）
   ↓
2. 采集新闻 + AI 分析
   ↓
3. 写入 data/*.json 文件
   ↓
4. Git commit + push
   ↓
5. 触发 Vercel 部署钩子
   ↓
6. Vercel 重新构建应用
   ↓
7. 静态页面和 API 路由重新生成
   ↓
8. 用户访问获取最新数据
```

### 用户访问流程

```
用户访问页面
   ↓
CDN 返回静态页面（极速）
   ↓
浏览器加载客户端组件
   ↓
IndexPanel: 请求 /api/indices
   ├─ 浏览器缓存命中 → 直接返回（12小时内）
   └─ 缓存未命中 → 调用新浪 API → 缓存12小时
   ↓
SummaryPanel: 请求 /api/summary
   ├─ 浏览器缓存命中 → 直接返回（12小时内）
   └─ 缓存未命中 → 读取静态生成的响应
```

---

## 监控建议

### 关键指标

1. **构建时间**：每次部署的构建耗时
2. **CDN 命中率**：静态资源缓存命中率
3. **API 响应时间**：各 API 端点的响应延迟
4. **外部 API 调用量**：新浪财经 API 的调用次数

### 优化空间

1. **按需重新验证**：
   ```typescript
   // 在 GitHub Actions 完成后调用
   await fetch('/api/revalidate?secret=xxx&path=/')
   ```

2. **服务端组件优化**：
   ```typescript
   // 将更多组件改为服务端组件
   export default async function ServerComponent() {
     const data = await getData() // 构建时执行
     return <View data={data} />
   }
   ```

3. **增量静态再生 + On-Demand**：
   ```typescript
   // 结合定时重新验证和按需触发
   export const revalidate = 86400 // 1天兜底
   // + On-Demand API 触发
   ```

---

## 总结

**优化后的策略核心**：
- ✅ **数据驱动**：缓存时间对齐数据更新频率
- ✅ **静态优先**：最大化利用静态生成和 CDN
- ✅ **浏览器缓存**：减少服务器压力
- ✅ **按需轮询**：仅实时数据保留轮询
- ✅ **简洁高效**：移除不必要的重新验证

**关键数字**：
- 🕐 数据更新：**每12小时**
- 🌐 浏览器缓存：**12小时**
- 🔄 指数轮询：**5分钟**
- 🚫 摘要轮询：**禁用**
