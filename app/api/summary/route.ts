import { NextResponse } from 'next/server'
import { FileStore } from '@/lib/storage/fileStore'

const store = new FileStore()

/**
 * GET /api/summary - 获取最新的市场影响汇总
 */
export async function GET() {
  try {
    await store.init()

    const summaries = await store.loadSummaries()

    // 返回最新的两条汇总（中证指数和纳斯达克）
    const latest = summaries.slice(0, 2)

    return NextResponse.json(latest, {
      headers: {
        // 浏览器缓存12小时（两次GitHub Action更新之间的间隔）
        'Cache-Control': 'public, max-age=43200, stale-while-revalidate=86400'
      }
    })
  } catch (error) {
    console.error('[API /summary] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch summaries' },
      { status: 500 }
    )
  }
}

// 静态生成 - 数据只在部署时更新
export const dynamic = 'force-static'
export const revalidate = false
