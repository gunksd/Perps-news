import { NextResponse } from 'next/server'
import { FileStore } from '@/lib/storage/fileStore'

const store = new FileStore()

/**
 * GET /api/news - 获取今日新闻和分析
 */
export async function GET() {
  try {
    await store.init()

    const news = await store.getTodayNews()
    const analyses = await store.loadAnalyses()

    // 合并新闻和分析结果
    const combined = news.map(newsItem => {
      const analysis = analyses.find(a => a.newsId === newsItem.id)
      return {
        news: newsItem,
        analysis
      }
    }).filter(item => item.analysis) // 只返回已分析的新闻

    return NextResponse.json(combined)
  } catch (error) {
    console.error('[API /news] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}
