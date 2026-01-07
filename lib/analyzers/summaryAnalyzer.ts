import { NewsAnalysis, IndexSummary } from '../types/analysis'
import { RawNews } from '../types/news'

/**
 * 指数级汇总分析器
 */
export class SummaryAnalyzer {
  private apiKey: string
  private apiEndpoint: string
  private model: string

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || ''
    this.apiEndpoint = process.env.AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions'
    this.model = process.env.AI_MODEL || 'gpt-4o-mini'
  }

  /**
   * 生成指数影响汇总
   */
  async summarize(
    news: RawNews[],
    analyses: NewsAnalysis[],
    index: '中证指数' | '纳斯达克指数',
    period: '10:00' | '22:00'
  ): Promise<IndexSummary> {
    const relevantAnalyses = this.filterRelevantAnalyses(analyses, index)
    const prompt = this.buildPrompt(news, relevantAnalyses, index)

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt()
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' }
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const data = await response.json()
      const result = JSON.parse(data.choices[0].message.content)

      return {
        index,
        timestamp: new Date().toISOString(),
        period,
        short_term: result.short_term,
        medium_term: result.medium_term,
        key_news_ids: relevantAnalyses.map(a => a.newsId),
        confidence: result.confidence
      }
    } catch (error) {
      console.error('[SummaryAnalyzer] Error:', error)
      throw error
    }
  }

  /**
   * 筛选相关分析
   */
  private filterRelevantAnalyses(
    analyses: NewsAnalysis[],
    index: string
  ): NewsAnalysis[] {
    return analyses.filter(analysis =>
      analysis.market_impact.affected_markets.includes(index) &&
      analysis.market_impact.direction !== '中性'
    )
  }

  /**
   * 系统提示词
   */
  private getSystemPrompt(): string {
    return `你是一个专业的金融市场分析师。你的任务是：
汇总分析当天所有重要财经新闻对特定指数的综合影响。

【输出要求】
- 短期影响（1-3天）：偏多/偏空/震荡
- 中期影响（1-2周）：偏多/偏空/不确定
- 核心逻辑说明（不超过5行）

【严格禁止】
- 任何数值或点位预测
- 买卖建议
- 确定性表述

请以JSON格式输出：
{
  "short_term": {
    "direction": "偏多/偏空/震荡",
    "logic": "短期影响逻辑"
  },
  "medium_term": {
    "direction": "偏多/偏空/不确定",
    "logic": "中期影响逻辑"
  },
  "confidence": 0.75
}`
  }

  /**
   * 构建提示词
   */
  private buildPrompt(
    news: RawNews[],
    analyses: NewsAnalysis[],
    index: string
  ): string {
    const newsContext = analyses.map((analysis, idx) => {
      const newsItem = news.find(n => n.id === analysis.newsId)
      return `【新闻${idx + 1}】
标题：${newsItem?.title}
分析：${analysis.summary_cn}
影响：${analysis.market_impact.direction}
逻辑：${analysis.market_impact.logic}`
    }).join('\n\n')

    return `请汇总分析以下新闻对【${index}】的综合影响：

${newsContext}

请按照系统提示的格式输出汇总结果。`
  }
}
