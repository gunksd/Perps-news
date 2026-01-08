import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { RawNews } from '@/lib/types/news'
import { NewsAnalysis } from '@/lib/types/analysis'
import { ExportService, ExportFormat } from '@/lib/services/exportService'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const format = (searchParams.get('format') || 'markdown') as ExportFormat
    const locale = searchParams.get('locale') || 'zh'

    // 读取新闻数据
    const newsPath = path.join(process.cwd(), 'data', 'news.json')
    const newsContent = await fs.readFile(newsPath, 'utf-8')
    const allNews: RawNews[] = JSON.parse(newsContent)

    // 读取分析数据
    const analysisPath = path.join(process.cwd(), 'data', 'analyses.json')
    const analysisContent = await fs.readFile(analysisPath, 'utf-8')
    const allAnalysis: NewsAnalysis[] = JSON.parse(analysisContent)

    // 合并数据
    const exportData = allAnalysis
      .map(analysis => {
        const news = allNews.find(n => n.id === analysis.newsId)
        if (!news) return null
        return { news, analysis }
      })
      .filter((item): item is { news: RawNews; analysis: NewsAnalysis } => item !== null)
      .slice(0, 50) // 限制导出最多50条

    if (exportData.length === 0) {
      return NextResponse.json(
        { error: 'No data available for export' },
        { status: 404 }
      )
    }

    // 生成导出内容
    let content: string
    let filename: string
    let contentType: string

    switch (format) {
      case 'markdown':
        content = ExportService.toMarkdown(exportData, locale)
        filename = `financial-news-report-${new Date().toISOString().split('T')[0]}.md`
        contentType = 'text/markdown'
        break

      case 'txt':
        content = ExportService.toText(exportData, locale)
        filename = `financial-news-report-${new Date().toISOString().split('T')[0]}.txt`
        contentType = 'text/plain'
        break

      case 'json':
        content = ExportService.toJSON(exportData)
        filename = `financial-news-report-${new Date().toISOString().split('T')[0]}.json`
        contentType = 'application/json'
        break

      default:
        return NextResponse.json(
          { error: 'Invalid format. Supported formats: markdown, txt, json' },
          { status: 400 }
        )
    }

    // 返回文件下载
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('[Export API] Error:', error)
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    )
  }
}
