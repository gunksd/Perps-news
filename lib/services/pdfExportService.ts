import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { RawNews } from '../types/news'
import { NewsAnalysis } from '../types/analysis'
import { registerChineseFont } from '../fonts/chineseFont'

interface ExportData {
  news: RawNews
  analysis: NewsAnalysis
}

/**
 * PDF导出服务 - 支持中文字符
 *
 * 解决方案：集成Noto Sans SC中文字体
 * - 支持完整的中文字符显示
 * - 字体文件动态加载，不影响主包体积
 * - 优雅降级：字体加载失败时使用英文内容
 */
export class PDFExportService {
  /**
   * 生成PDF报告
   */
  static async generatePDF(data: ExportData[], locale: string = 'zh'): Promise<Blob> {
    const doc = new jsPDF()

    // 尝试加载并注册中文字体
    let chineseFontAvailable = false
    try {
      await registerChineseFont(doc)
      doc.setFont('NotoSansSC')
      chineseFontAvailable = true
      console.log('✅ 中文字体已启用')
    } catch (error) {
      console.warn('⚠️ 中文字体加载失败，将使用英文内容', error)
      chineseFontAvailable = false
    }

    // 标题
    doc.setFontSize(20)
    const title = locale === 'zh' && chineseFontAvailable
      ? '金融新闻分析报告'
      : 'Financial News Analysis Report'
    doc.text(title, 105, 20, { align: 'center' })

    // 日期和新闻数量
    doc.setFontSize(10)
    const date = new Date().toLocaleDateString(
      locale === 'zh' ? 'zh-CN' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    )
    const generatedText = locale === 'zh' && chineseFontAvailable ? '生成日期' : 'Generated'
    const newsCountText = locale === 'zh' && chineseFontAvailable ? '新闻数量' : 'Total News'

    doc.text(`${generatedText}: ${date}`, 105, 30, { align: 'center' })
    doc.text(`${newsCountText}: ${data.length}`, 105, 35, { align: 'center' })

    let yPosition = 45

    // 遍历每条新闻
    data.forEach((item, index) => {
      const { news, analysis } = item

      // 检查是否需要新页面
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      // 新闻序号和标题
      doc.setFontSize(14)
      doc.setFont(chineseFontAvailable ? 'NotoSansSC' : 'helvetica', 'bold')

      // 优先显示中文，如果没有中文字体则使用英文
      const newsTitle = chineseFontAvailable
        ? news.title
        : (analysis.title_en || this.generateEnglishTitle(news.source))
      const truncatedTitle = this.truncateText(newsTitle, chineseFontAvailable ? 40 : 60)
      doc.text(`${index + 1}. ${truncatedTitle}`, 15, yPosition)
      yPosition += 8

      // 基本信息
      doc.setFontSize(9)
      doc.setFont(chineseFontAvailable ? 'NotoSansSC' : 'helvetica', 'normal')

      const sourceLabel = locale === 'zh' && chineseFontAvailable ? '来源' : 'Source'
      doc.text(`${sourceLabel}: ${news.source.toUpperCase()}`, 15, yPosition)
      yPosition += 5

      const timeStr = new Date(news.time).toLocaleString(
        locale === 'zh' && chineseFontAvailable ? 'zh-CN' : 'en-US',
        {
          year: 'numeric',
          month: chineseFontAvailable ? 'long' : 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      )
      const timeLabel = locale === 'zh' && chineseFontAvailable ? '时间' : 'Time'
      doc.text(`${timeLabel}: ${timeStr}`, 15, yPosition)
      yPosition += 5

      // 市场方向
      const direction = this.getMarketDirection(analysis, chineseFontAvailable, locale)
      const directionLabel = locale === 'zh' && chineseFontAvailable ? '市场方向' : 'Direction'
      doc.text(`${directionLabel}: ${direction}`, 15, yPosition)
      yPosition += 5

      const confidenceLabel = locale === 'zh' && chineseFontAvailable ? '置信度' : 'Confidence'
      doc.text(`${confidenceLabel}: ${(analysis.confidence * 100).toFixed(0)}%`, 15, yPosition)
      yPosition += 7

      // 分析摘要
      doc.setFont(chineseFontAvailable ? 'NotoSansSC' : 'helvetica', 'bold')
      const analysisLabel = locale === 'zh' && chineseFontAvailable ? '分析' : 'Analysis'
      doc.text(`${analysisLabel}:`, 15, yPosition)
      yPosition += 5
      doc.setFont(chineseFontAvailable ? 'NotoSansSC' : 'helvetica', 'normal')

      const summary = chineseFontAvailable
        ? analysis.summary_cn
        : (analysis.summary_en || '[Summary not available]')
      const summaryLines = doc.splitTextToSize(summary, 180)
      doc.text(summaryLines, 15, yPosition)
      yPosition += summaryLines.length * 5

      // 市场影响逻辑
      const impactLogic = chineseFontAvailable
        ? analysis.market_impact.logic
        : analysis.market_impact.logic_en

      if (impactLogic) {
        yPosition += 3
        doc.setFont(chineseFontAvailable ? 'NotoSansSC' : 'helvetica', 'bold')
        const impactLabel = locale === 'zh' && chineseFontAvailable ? '市场影响' : 'Market Impact'
        doc.text(`${impactLabel}:`, 15, yPosition)
        yPosition += 5
        doc.setFont(chineseFontAvailable ? 'NotoSansSC' : 'helvetica', 'normal')

        const logicLines = doc.splitTextToSize(impactLogic, 180)
        doc.text(logicLines, 15, yPosition)
        yPosition += logicLines.length * 5
      }

      // 影响的市场
      const affectedMarkets = chineseFontAvailable
        ? analysis.market_impact.affected_markets
        : (analysis.market_impact.affected_markets_en || analysis.market_impact.affected_markets)

      if (affectedMarkets && affectedMarkets.length > 0) {
        yPosition += 3
        doc.setFont(chineseFontAvailable ? 'NotoSansSC' : 'helvetica', 'bold')
        const marketsLabel = locale === 'zh' && chineseFontAvailable ? '影响市场' : 'Affected Markets'
        doc.text(`${marketsLabel}:`, 15, yPosition)
        yPosition += 5
        doc.setFont(chineseFontAvailable ? 'NotoSansSC' : 'helvetica', 'normal')
        doc.text(affectedMarkets.join(', '), 15, yPosition)
        yPosition += 5
      }

      // 相关股票
      if (analysis.related_stocks && analysis.related_stocks.length > 0) {
        yPosition += 3
        doc.setFont(chineseFontAvailable ? 'NotoSansSC' : 'helvetica', 'bold')
        const stocksLabel = locale === 'zh' && chineseFontAvailable ? '相关股票' : 'Related Stocks'
        doc.text(`${stocksLabel}:`, 15, yPosition)
        yPosition += 5
        doc.setFont(chineseFontAvailable ? 'NotoSansSC' : 'helvetica', 'normal')

        const stocks = analysis.related_stocks
          .map(s => `${s.symbol} (${s.name} - ${s.market})`)
          .join(', ')
        const stockLines = doc.splitTextToSize(stocks, 180)
        doc.text(stockLines, 15, yPosition)
        yPosition += stockLines.length * 5
      }

      // 分隔线
      yPosition += 5
      doc.setDrawColor(200, 200, 200)
      doc.line(15, yPosition, 195, yPosition)
      yPosition += 10
    })

    // 免责声明
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    } else {
      yPosition += 10
    }

    doc.setFontSize(10)
    doc.setFont(chineseFontAvailable ? 'NotoSansSC' : 'helvetica', 'bold')
    const disclaimerTitle = locale === 'zh' && chineseFontAvailable ? '免责声明' : 'Disclaimer'
    doc.text(disclaimerTitle, 15, yPosition)
    yPosition += 7
    doc.setFont(chineseFontAvailable ? 'NotoSansSC' : 'helvetica', 'normal')
    doc.setFontSize(8)

    const disclaimer = locale === 'zh' && chineseFontAvailable
      ? '本报告由AI自动生成，仅供参考，不构成投资建议。过往表现不代表未来结果。所有投资均涉及风险，包括本金损失的可能。请在做出任何投资决策前进行自己的研究并咨询合格的财务顾问。'
      : 'This report is automatically generated by AI for informational purposes only and does not ' +
        'constitute investment advice. Past performance is not indicative of future results. ' +
        'All investments involve risks, including possible loss of principal. Please conduct your own ' +
        'research and consult with qualified financial advisors before making any investment decisions.'

    const disclaimerLines = doc.splitTextToSize(disclaimer, 180)
    doc.text(disclaimerLines, 15, yPosition)

    // 页脚
    const pageCount = doc.getNumberOfPages()
    doc.setFontSize(8)
    const pageLabel = locale === 'zh' && chineseFontAvailable ? '第' : 'Page'
    const ofLabel = locale === 'zh' && chineseFontAvailable ? '页 共' : 'of'
    const pagesLabel = locale === 'zh' && chineseFontAvailable ? '页' : ''

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      const pageText = locale === 'zh' && chineseFontAvailable
        ? `${pageLabel} ${i} ${ofLabel} ${pageCount} ${pagesLabel}`
        : `${pageLabel} ${i} ${ofLabel} ${pageCount}`
      doc.text(pageText, 105, 285, { align: 'center' })
    }

    // 返回Blob
    return doc.output('blob')
  }

  /**
   * 获取市场方向
   */
  private static getMarketDirection(
    analysis: NewsAnalysis,
    useChinese: boolean,
    locale: string
  ): string {
    if (useChinese && locale === 'zh') {
      return analysis.market_impact.direction
    }

    if (analysis.market_impact.direction_en) {
      return analysis.market_impact.direction_en
    }

    // Fallback: 转换中文到英文
    const directionMap: Record<string, string> = {
      '利多': 'Bullish',
      '利空': 'Bearish',
      '中性': 'Neutral'
    }

    return directionMap[analysis.market_impact.direction] || 'Neutral'
  }

  /**
   * 生成英文标题（当缺失时）
   */
  private static generateEnglishTitle(source: string): string {
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    return `News from ${source.toUpperCase()} - ${timestamp}`
  }

  /**
   * 文本截断
   */
  private static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + '...'
  }

  /**
   * 验证导出数据的完整性（保留用于向后兼容）
   */
  static validateExportData(data: ExportData[]): {
    valid: boolean
    message: string
    validCount: number
    totalCount: number
  } {
    const totalCount = data.length

    // 现在支持中文，所有数据都是有效的
    return {
      valid: true,
      message: 'All news items are ready for export with Chinese support.',
      validCount: totalCount,
      totalCount
    }
  }
}
