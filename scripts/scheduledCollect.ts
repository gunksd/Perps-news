// 加载环境变量
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { CCTVCollector } from '../lib/collectors/cctv'
import { FedCollector } from '../lib/collectors/fed'
import { XinhuaCollector } from '../lib/collectors/xinhua'
import { NewsAnalyzer } from '../lib/analyzers/newsAnalyzer'
import { SummaryAnalyzer } from '../lib/analyzers/summaryAnalyzer'
import { FileStore } from '../lib/storage/fileStore'
import { RawNews } from '../lib/types/news'
import { SinaFinanceClient } from '../lib/indices/sinaFinance'
import { IndexSymbol } from '../lib/types/indices'

/**
 * 定时采集脚本
 * 用法：npm run collect
 *
 * 生产环境建议使用 cron 或云函数定时执行
 * - 每小时采集新闻
 * - 10:00 和 22:00 生成汇总
 */

const store = new FileStore()
const newsAnalyzer = new NewsAnalyzer()
const summaryAnalyzer = new SummaryAnalyzer()
const sinaFinance = new SinaFinanceClient()

const collectors = [
  new CCTVCollector(),        // 中国新闻网 - 稳定 ✅
  new FedCollector(),         // 美联储 - 官方源 ✅
  new XinhuaCollector(),      // 新华网财经 - 官方RSS ✅
]

// 需要获取的指数
const INDICES_TO_TRACK: IndexSymbol[] = ['CSI500', 'NASDAQ']

// 新闻来源权重（与API保持一致）
const SOURCE_WEIGHTS: Record<string, number> = {
  'xinhua': 10,
  'cctv': 9,
  'fed': 8,
  'people': 7,
  'jin10': 6,
  'cls': 6,
  'sina': 5,
  'default': 3
}

// 财经关键词词汇库（与API保持一致）
const FINANCIAL_KEYWORDS = {
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
 * 计算关键词匹配评分（预筛选用）
 */
function calculateKeywordScore(newsItem: RawNews): number {
  const text = `${newsItem.title} ${newsItem.content}`.toLowerCase()
  let score = 0

  for (const keyword of FINANCIAL_KEYWORDS.high) {
    if (text.includes(keyword.toLowerCase())) {
      score += 3
    }
  }

  for (const keyword of FINANCIAL_KEYWORDS.medium) {
    if (text.includes(keyword.toLowerCase())) {
      score += 2
    }
  }

  for (const keyword of FINANCIAL_KEYWORDS.standard) {
    if (text.includes(keyword.toLowerCase())) {
      score += 1
    }
  }

  return Math.min(score, 10)
}

/**
 * 计算预筛选分数（不包含AI分析）
 */
function calculatePreFilterScore(newsItem: RawNews): number {
  let score = 0

  // 来源权重 (0-10分)
  score += SOURCE_WEIGHTS[newsItem.source] || SOURCE_WEIGHTS['default']

  // 关键词匹配 (0-10分)
  score += calculateKeywordScore(newsItem)

  // 时效性 (0-5分)
  const newsTime = new Date(newsItem.time).getTime()
  const now = Date.now()
  const hoursAgo = (now - newsTime) / (1000 * 60 * 60)

  if (hoursAgo < 2) {
    score += 5
  } else if (hoursAgo < 6) {
    score += 3
  } else if (hoursAgo < 12) {
    score += 1
  }

  return score
}

async function collectNews() {
  console.log('[Collect] Starting news collection...')

  // ===== 并行采集所有新闻源，而不是串行 =====
  const collectionPromises = collectors.map(async (collector) => {
    try {
      const news = await collector.collect()
      console.log(`[Collect] ${collector.constructor.name}: ${news.length} items`)
      return news
    } catch (error) {
      console.error(`[Collect] ${collector.constructor.name} failed:`, error)
      return []
    }
  })

  const results = await Promise.all(collectionPromises)
  const allNews: RawNews[] = results.flat()

  if (allNews.length > 0) {
    await store.saveNews(allNews)
    console.log(`[Collect] Saved ${allNews.length} news items (collected in parallel)`)
  }

  return allNews
}

async function updateIndices() {
  console.log('[Indices] Updating market indices...')

  try {
    const indices = await sinaFinance.getMultipleIndices(INDICES_TO_TRACK)
    await store.saveIndices(indices)

    console.log('[Indices] Updated indices:')
    indices.forEach(index => {
      const arrow = index.change >= 0 ? '↑' : '↓'
      const color = index.change >= 0 ? '+' : ''
      console.log(`  ${index.name}: ${index.price.toFixed(2)} ${arrow} ${color}${index.change.toFixed(2)} (${color}${index.changePercent.toFixed(2)}%)`)
    })
  } catch (error) {
    console.error('[Indices] Failed to update indices:', error)
  }
}

async function analyzeNews() {
  console.log('[Analyze] Starting news analysis...')

  const news = await store.getTodayNews()
  const existingAnalyses = await store.loadAnalyses()
  const existingIds = new Set(existingAnalyses.map(a => a.newsId))

  // 只分析未分析过的新闻
  const toAnalyze = news.filter(n => !existingIds.has(n.id))

  if (toAnalyze.length === 0) {
    console.log('[Analyze] No new news to analyze')
    return
  }

  console.log(`[Analyze] Found ${toAnalyze.length} unanalyzed news items`)

  // ===== 预筛选：按重要性评分，只取前50条送AI分析 =====
  const MAX_AI_ANALYSIS = 50 // 每次最多分析50条，避免API消耗过大

  const scoredNews = toAnalyze.map(newsItem => ({
    newsItem,
    score: calculatePreFilterScore(newsItem)
  }))

  // 按分数降序排序
  scoredNews.sort((a, b) => b.score - a.score)

  // 取前N条
  const selectedForAnalysis = scoredNews.slice(0, MAX_AI_ANALYSIS).map(item => item.newsItem)
  const filteredCount = toAnalyze.length - selectedForAnalysis.length

  console.log(`[Analyze] Pre-filter: Selected top ${selectedForAnalysis.length} items for AI analysis`)
  if (filteredCount > 0) {
    console.log(`[Analyze] Pre-filter: Skipped ${filteredCount} low-priority items (saves API calls)`)
    console.log(`[Analyze] Score range: ${scoredNews[0].score.toFixed(1)} (highest) ~ ${scoredNews[scoredNews.length - 1].score.toFixed(1)} (lowest)`)
    console.log(`[Analyze] Threshold: ${scoredNews[Math.min(MAX_AI_ANALYSIS - 1, scoredNews.length - 1)].score.toFixed(1)}`)
  }

  // ===== 批量并发AI分析（每批10条） =====
  const BATCH_SIZE = 10 // 每批并发处理10条
  const newAnalyses = []

  for (let i = 0; i < selectedForAnalysis.length; i += BATCH_SIZE) {
    const batch = selectedForAnalysis.slice(i, i + BATCH_SIZE)
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(selectedForAnalysis.length / BATCH_SIZE)

    console.log(`[Analyze] Processing batch ${batchNumber}/${totalBatches} (${batch.length} items)...`)

    // 并发处理当前批次
    const batchPromises = batch.map(async (newsItem) => {
      try {
        const analysis = await newsAnalyzer.analyze(newsItem)
        console.log(`[Analyze] ✓ ${newsItem.id}`)
        return analysis
      } catch (error) {
        console.error(`[Analyze] ✗ ${newsItem.id}:`, error)
        return null
      }
    })

    const batchResults = await Promise.all(batchPromises)
    const successfulAnalyses = batchResults.filter(a => a !== null)
    newAnalyses.push(...successfulAnalyses)

    // 批次间短暂延迟，避免API速率限制
    if (i + BATCH_SIZE < selectedForAnalysis.length) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  if (newAnalyses.length > 0) {
    await store.saveAnalyses(newAnalyses)
    console.log(`[Analyze] Saved ${newAnalyses.length} analyses (batch processing complete)`)
  }
}

async function generateSummaries() {
  console.log('[Summary] Generating market impact summaries...')

  const news = await store.getTodayNews()
  const analyses = await store.loadAnalyses()

  if (analyses.length === 0) {
    console.log('[Summary] No analyses available')
    return
  }

  const indices: Array<'中证指数' | '纳斯达克指数'> = ['中证指数', '纳斯达克指数']
  const hour = new Date().getHours()
  const period = hour < 16 ? '10:00' : '22:00' as '10:00' | '22:00'

  const summaries = []

  for (const index of indices) {
    try {
      const summary = await summaryAnalyzer.summarize(news, analyses, index, period)
      summaries.push(summary)
      console.log(`[Summary] ✓ ${index}`)
    } catch (error) {
      console.error(`[Summary] ✗ ${index}:`, error)
    }

    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  if (summaries.length > 0) {
    await store.saveSummaries(summaries)
    console.log(`[Summary] Saved ${summaries.length} summaries`)
  }
}

async function main() {
  const command = process.argv[2] || 'all'

  await store.init()

  switch (command) {
    case 'collect':
      await collectNews()
      await updateIndices()
      break
    case 'analyze':
      await analyzeNews()
      break
    case 'summary':
      await generateSummaries()
      break
    case 'indices':
      await updateIndices()
      break
    case 'all':
    default:
      await collectNews()
      await updateIndices()
      await analyzeNews()
      // 只在10:00和22:00生成汇总
      const hour = new Date().getHours()
      if (hour === 10 || hour === 22) {
        await generateSummaries()
      }
      break
  }

  console.log('[Done] Process completed')
}

main().catch(console.error)
