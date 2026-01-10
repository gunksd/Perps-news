import { NextResponse } from 'next/server'
import { SinaFinanceClient } from '@/lib/indices/sinaFinance'

const client = new SinaFinanceClient()

/**
 * GET /api/indices - 获取所有支持的指数数据
 */
export async function GET() {
  try {
    const indices = await client.getMultipleIndices(['CSI500', 'SSE', 'NASDAQ'])

    return NextResponse.json(indices, {
      headers: {
        // 浏览器缓存12小时（两次GitHub Action更新之间的间隔）
        'Cache-Control': 'public, max-age=43200, stale-while-revalidate=86400'
      }
    })
  } catch (error) {
    console.error('[API /indices] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch indices' },
      { status: 500 }
    )
  }
}

// 静态生成 - 指数数据实时从新浪获取
export const dynamic = 'force-dynamic'
