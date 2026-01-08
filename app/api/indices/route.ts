import { NextResponse } from 'next/server'
import { SinaFinanceClient } from '@/lib/indices/sinaFinance'

const client = new SinaFinanceClient()

/**
 * GET /api/indices - 获取所有支持的指数数据
 */
export async function GET() {
  try {
    const indices = await client.getMultipleIndices(['CSI500', 'SSE', 'NASDAQ'])
    return NextResponse.json(indices)
  } catch (error) {
    console.error('[API /indices] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch indices' },
      { status: 500 }
    )
  }
}

// 5分钟缓存
export const revalidate = 300
