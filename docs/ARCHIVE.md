# 数据归档功能说明

## 📦 功能概述

新闻采集系统现在支持按月归档功能，自动将历史数据移动到归档目录，保持主数据文件的小巧和高效。

## 🗂️ 目录结构

```
data/
├── news.json              # 当前月份的新闻（始终保持最新）
├── analyses.json          # 当前月份的分析结果
├── summaries.json         # 汇总数据（限制100条）
├── indices.json           # 指数数据
└── archive/               # 归档目录
    ├── news-2025-12.json      # 2025年12月的新闻
    ├── analyses-2025-12.json  # 2025年12月的分析
    ├── news-2025-11.json      # 2025年11月的新闻
    └── analyses-2025-11.json  # 2025年11月的分析
```

## ⚙️ 工作原理

### 自动归档

每次保存数据时（`saveNews()` 或 `saveAnalyses()`），系统会自动：

1. **识别当前月份** - 获取当前年月 (YYYY-MM)
2. **分组数据** - 将数据按月份分组
3. **保留当前月** - 只在主文件中保留当前月份的数据
4. **归档历史** - 将其他月份的数据移动到 `archive/` 目录

### 数据合并

- 如果归档文件已存在，新数据会与现有归档数据合并
- 按时间倒序排序（最新的在前）
- 自动去重

## 📚 API 使用

### 读取当前月份数据

```typescript
const store = new FileStore()
const currentNews = await store.loadNews()
const currentAnalyses = await store.loadAnalyses()
```

### 读取归档数据

```typescript
// 读取特定月份的归档
const archivedNews = await store.loadArchivedNews('2025-12')
const archivedAnalyses = await store.loadArchivedAnalyses('2025-12')

// 列出所有归档月份
const months = await store.listArchiveMonths()
// 返回: ['2026-01', '2025-12', '2025-11', ...]

// 获取日期范围内的所有数据（包括归档）
const allNews = await store.getNewsInRange('2025-11', '2026-01')
```

## 🎯 优势

### 性能优化
- ✅ 主文件保持小巧（只有当前月数据）
- ✅ 加载速度更快
- ✅ Git提交更小

### 存储管理
- ✅ 历史数据不会丢失
- ✅ 按月组织，易于管理
- ✅ 可以独立访问任意月份数据

### 扩展性
- ✅ 支持长期运行
- ✅ 数据增长可控
- ✅ 便于数据分析和备份

## 📊 存储对比

### 之前（无归档）
```
news.json: 持续增长，无上限
├── 2022-12数据
├── 2023-01数据
├── ...
└── 2026-01数据  # 全部在一个文件中
```

### 现在（有归档）
```
news.json: 仅当前月，大小可控
archive/
├── news-2025-12.json  # 历史按月分离
├── news-2025-11.json
└── ...
```

## 🔧 配置

归档功能是自动的，无需额外配置。以下是关键参数：

- **归档时机**: 每次调用 `saveNews()` 或 `saveAnalyses()`
- **月份判断**: 基于数据的 `time` 或 `analyzedAt` 字段
- **保留策略**: 只保留当前月份在主文件中

## 🚀 下次定时任务运行时

下次执行 `scheduledCollect` 时，如果有2月之前的数据，会自动归档：

```
[Archive] Saved 50 items to news-2026-01.json
[Storage] Keeping 15 news items for current month (2026-02)
```

## 📝 注意事项

1. **时间字段**: 归档基于数据的时间字段
   - 新闻使用 `time` 字段
   - 分析使用 `analyzedAt` 字段

2. **数据完整性**:
   - 归档不会删除数据，只是移动位置
   - 可以通过 API 访问所有历史数据

3. **Git 友好**:
   - 归档文件创建后很少改变
   - 减少主文件的频繁变更
   - 更小的 diff 和更快的提交

## 🔍 故障排查

### 检查归档是否正常
```bash
ls -lh data/archive/
```

### 查看特定月份的归档
```bash
cat data/archive/news-2025-12.json | jq 'length'
```

### 列出所有归档月份
```typescript
const months = await store.listArchiveMonths()
console.log(months)
```
