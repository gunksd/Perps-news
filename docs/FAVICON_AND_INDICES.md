# Favicon 和指数数据更新功能说明

## 🎨 Favicon 设计

### 设计理念
- **主题**：上升趋势的财经图表
- **风格**：优雅、现代、专业
- **配色**：紫蓝渐变 (#667eea → #764ba2) + 金黄色趋势线
- **元素**：圆角矩形背景、上升曲线、数据点、上升箭头

### 技术实现
- **格式**：SVG（矢量图形，任意缩放不失真）
- **尺寸**：512x512 原始尺寸
- **特性**：
  - 支持明暗主题
  - 高分辨率显示友好
  - PWA 应用图标
  - Apple Touch Icon

### 文件位置
```
public/
├── favicon.svg          # 主 favicon（SVG）
└── manifest.json        # Web App Manifest
```

## 📊 指数数据自动更新

### 功能说明
在每次新闻采集时，自动更新以下指数的实时数据：
- **中证500** (CSI500, 000905.SS)
- **纳斯达克综合指数** (NASDAQ, ^IXIC)

### 数据来源
使用**新浪财经 API**（免费、实时、稳定）获取指数数据，包括：
- 当前价格
- 涨跌点数
- 涨跌幅
- 更新时间戳

### 更新时机
指数数据会在以下情况自动更新：
1. **定时采集**：每天 10:00 和 22:00（北京时间）
2. **手动触发**：`npm run collect`
3. **单独更新**：`npm run collect indices`

### 数据存储
指数数据保存在 `data/indices.json`：
```json
[
  {
    "symbol": "000905.SS",
    "name": "中证500",
    "price": 7894.54,
    "change": 19.46,
    "changePercent": 0.25,
    "timestamp": "2026-01-08T15:20:19.604Z"
  },
  {
    "symbol": "^IXIC",
    "name": "纳斯达克",
    "price": 22484.07,
    "change": 99.37,
    "changePercent": 0.44,
    "timestamp": "2026-01-08T15:20:19.602Z"
  }
]
```

## 🔄 自动化流程

### 完整的数据更新流程
```
每天 10:00 & 22:00（北京时间）
    ↓
GitHub Actions 触发
    ↓
1. 采集新闻（并行）
2. 更新指数数据（同时）
    ↓
3. AI 分析新闻
4. 生成市场总结
    ↓
推送到 GitHub
    ↓
触发 Vercel 重新部署
    ↓
新数据上线！
```

### 命令行使用

```bash
# 完整流程（新闻 + 指数 + 分析）
npm run collect

# 只更新指数
npm run collect indices

# 只采集新闻（会同时更新指数）
npm run collect collect

# 只分析新闻
npm run collect analyze

# 只生成总结
npm run collect summary
```

## 📝 代码集成

### FileStore 新增方法
```typescript
// 保存指数数据
async saveIndices(indices: IndexData[]): Promise<void>

// 加载指数数据
async loadIndices(): Promise<IndexData[]>
```

### 新增函数
```typescript
// scripts/scheduledCollect.ts
async function updateIndices(): Promise<void>
```

### API 端点（已有）
```
GET /api/indices  - 获取指数数据
```

## 🎯 使用效果

### 用户体验提升
1. **品牌识别**：独特的 favicon 增强品牌辨识度
2. **实时数据**：指数数据与新闻同步更新
3. **PWA 支持**：支持添加到主屏幕

### 开发体验提升
1. **自动化**：无需手动更新指数数据
2. **容错性**：指数更新失败不影响新闻采集
3. **可扩展**：轻松添加更多指数

## 🔍 监控和验证

### 查看指数更新日志
```bash
# 查看最近的采集日志
npm run collect indices
```

输出示例：
```
[Indices] Updating market indices...
[Indices] Updated indices:
  中证500: 7894.54 ↑ +19.46 (+0.25%)
  纳斯达克: 22484.07 ↑ +99.37 (+0.44%)
[Done] Process completed
```

### 验证数据文件
```bash
# 查看指数数据
cat data/indices.json

# 查看数据时间戳
jq '.[].timestamp' data/indices.json
```

## 🚀 扩展指南

### 添加更多指数
1. 在 `lib/types/indices.ts` 的 `SUPPORTED_INDICES` 中添加新指数
2. 在 `scripts/scheduledCollect.ts` 的 `INDICES_TO_TRACK` 中添加符号
3. 新浪财经支持的指数代码：
   - 上证指数：`s_sh000001`
   - 深证成指：`s_sz399001`
   - 创业板指：`s_sz399006`
   - 恒生指数：`int_hangseng`
   - 道琼斯：`int_dji`
   - 标普500：`int_sp500`

### 自定义更新频率
修改 `.github/workflows/scheduled-collect.yml` 的 cron 表达式：
```yaml
schedule:
  - cron: '0 2,8,14 * * *'  # 每6小时更新一次
```

## 📚 相关文档
- [新浪财经 API 文档](https://finance.sina.com.cn)
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
