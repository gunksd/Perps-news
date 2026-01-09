import { NextResponse } from 'next/server'
import { FileStore } from '@/lib/storage/fileStore'

const store = new FileStore()

// 新闻来源权重
const SOURCE_WEIGHTS: Record<string, number> = {
  'xinhua': 10,  // 新华网 - 官方权威
  'cctv': 9,     // 中国新闻网 - 权威
  'fed': 8,      // 美联储 - 国际权威
  'people': 7,   // 人民网
  'jin10': 6,    // 金十数据
  'cls': 6,      // 财联社
  'sina': 5,     // 新浪
  'default': 3   // 其他来源
}

// 财经关键词词汇库（按影响力分级）
const FINANCIAL_KEYWORDS = {
  // 高影响力关键词 (权重 3) - 重大政策和核心指标
  high: [
    '降息', '加息', '降准', '加准',
    'GDP', 'CPI', 'PPI', 'PMI',
    '通胀', '通缩', '失业率',
    '贸易战', '制裁', '关税',
    '违约', '破产', '危机',
    '央行', '美联储', 'Fed', 'Federal Reserve',
    '降低利率', '提高利率', '基准利率',
    '量化宽松', 'QE', '缩表'
  ],

  // 中等影响力关键词 (权重 2) - 重要经济活动
  medium: [
    '财政政策', '货币政策', '监管政策',
    '利率', '汇率', '利润', '营收',
    '股市', '债券', '期货', '大宗商品',
    'IPO', '上市', '并购', '重组',
    '财报', '业绩', '盈利', '亏损',
    '投资', '融资', '估值', '市值',
    '指数', '涨跌', '震荡', '波动',
    '外汇', '黄金', '原油', '能源'
  ],

  // 标准影响力关键词 (权重 1) - 一般经济话题
  standard: [
    '经济', '金融', '市场', '行业',
    '企业', '公司', '产业', '贸易',
    '增长', '下降', '上涨', '下跌',
    '预期', '预测', '展望', '前景',
    '改革', '开放', '创新', '转型',
    '消费', '生产', '出口', '进口',
    '房地产', '制造业', '科技', '互联网'
  ]
}

/**
 * 计算关键词匹配评分
 */
function calculateKeywordScore(newsItem: any): number {
  const text = `${newsItem.title} ${newsItem.content}`.toLowerCase()
  let score = 0

  // 高影响力关键词
  for (const keyword of FINANCIAL_KEYWORDS.high) {
    if (text.includes(keyword.toLowerCase())) {
      score += 3
    }
  }

  // 中等影响力关键词
  for (const keyword of FINANCIAL_KEYWORDS.medium) {
    if (text.includes(keyword.toLowerCase())) {
      score += 2
    }
  }

  // 标准影响力关键词
  for (const keyword of FINANCIAL_KEYWORDS.standard) {
    if (text.includes(keyword.toLowerCase())) {
      score += 1
    }
  }

  // 上限10分
  return Math.min(score, 10)
}

/**
 * 计算新闻重要性评分
 */
function calculateImportance(newsItem: any, analysis: any): number {
  let score = 0

  // 1. 来源权重 (0-10分)
  const sourceWeight = SOURCE_WEIGHTS[newsItem.source] || SOURCE_WEIGHTS['default']
  score += sourceWeight

  // 2. AI分析置信度 (0-10分)
  if (analysis) {
    score += (analysis.confidence || 0) * 10
  }

  // 3. 市场影响程度 (0-5分)
  if (analysis?.market_impact) {
    const direction = analysis.market_impact.direction
    if (direction === '利多' || direction === '利空') {
      score += 5 // 有明确影响方向
    } else if (direction === '中性') {
      score += 2 // 中性影响
    }
  }

  // 4. 时效性 (0-5分)
  const newsTime = new Date(newsItem.time).getTime()
  const now = Date.now()
  const hoursAgo = (now - newsTime) / (1000 * 60 * 60)

  if (hoursAgo < 2) {
    score += 5 // 2小时内
  } else if (hoursAgo < 6) {
    score += 3 // 6小时内
  } else if (hoursAgo < 12) {
    score += 1 // 12小时内
  }

  // 5. 关键词匹配 (0-10分)
  score += calculateKeywordScore(newsItem)

  return score
}

/**
 * GET /api/news - 获取今日最重要的20条新闻
 */
export async function GET() {
  try {
    await store.init()

    // 改为获取最近48小时的新闻，与页面保持一致
    const news = await store.getRecentNews(48)
    const analyses = await store.loadAnalyses()

    // 合并新闻和分析结果
    const combined = news.map(newsItem => {
      const analysis = analyses.find(a => a.newsId === newsItem.id)
      return {
        news: newsItem,
        analysis,
        importance: calculateImportance(newsItem, analysis)
      }
    }).filter(item => item.analysis) // 只返回已分析的新闻

    // 按重要性排序，取前20条
    const topNews = combined
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 20)
      .map(({ news, analysis }) => ({ news, analysis })) // 移除importance字段

    return NextResponse.json(topNews)
  } catch (error) {
    console.error('[API /news] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}

// ISR: 每5分钟重新生成一次
export const revalidate = 300
