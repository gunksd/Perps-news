// 加载环境变量
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { Jin10Collector } from '../lib/collectors/jin10'
import { CCTVCollector } from '../lib/collectors/cctv'
import { CLSCollector } from '../lib/collectors/cls'
import { FedCollector } from '../lib/collectors/fed'
import { NewsAnalyzer } from '../lib/analyzers/newsAnalyzer'
import { SummaryAnalyzer } from '../lib/analyzers/summaryAnalyzer'
import { FileStore } from '../lib/storage/fileStore'
import { RawNews } from '../lib/types/news'

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

const collectors = [
  new Jin10Collector(),
  new CCTVCollector(),
  new CLSCollector(),
  new FedCollector()
]

async function collectNews() {
  console.log('[Collect] Starting news collection...')

  const allNews: RawNews[] = []

  for (const collector of collectors) {
    try {
      const news = await collector.collect()
      console.log(`[Collect] ${collector.constructor.name}: ${news.length} items`)
      allNews.push(...news)
    } catch (error) {
      console.error(`[Collect] ${collector.constructor.name} failed:`, error)
    }
  }

  if (allNews.length > 0) {
    await store.saveNews(allNews)
    console.log(`[Collect] Saved ${allNews.length} news items`)
  }

  return allNews
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

  console.log(`[Analyze] Analyzing ${toAnalyze.length} news items...`)

  const newAnalyses = []

  for (const newsItem of toAnalyze) {
    try {
      const analysis = await newsAnalyzer.analyze(newsItem)
      newAnalyses.push(analysis)
      console.log(`[Analyze] ✓ ${newsItem.id}`)
    } catch (error) {
      console.error(`[Analyze] ✗ ${newsItem.id}:`, error)
    }

    // 避免API速率限制
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  if (newAnalyses.length > 0) {
    await store.saveAnalyses(newAnalyses)
    console.log(`[Analyze] Saved ${newAnalyses.length} analyses`)
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
      break
    case 'analyze':
      await analyzeNews()
      break
    case 'summary':
      await generateSummaries()
      break
    case 'all':
    default:
      await collectNews()
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
