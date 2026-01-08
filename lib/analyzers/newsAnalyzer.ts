import { RawNews } from '../types/news'
import { NewsAnalysis } from '../types/analysis'

/**
 * 新闻分析器 - 使用LLM进行分析
 */
export class NewsAnalyzer {
  private apiKey: string
  private apiEndpoint: string
  private model: string

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || ''
    this.apiEndpoint = process.env.AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions'
    this.model = process.env.AI_MODEL || 'gpt-4o-mini'
  }

  /**
   * 分析单条新闻
   */
  async analyze(news: RawNews): Promise<NewsAnalysis> {
    const prompt = this.buildPrompt(news)

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
        newsId: news.id,
        title_en: result.title_en || '',
        summary_cn: result.summary_cn,
        summary_en: result.summary_en,
        market_impact: {
          direction: result.market_impact.direction,
          direction_en: result.market_impact.direction_en || result.market_impact.direction,
          affected_markets: result.market_impact.affected_markets,
          affected_markets_en: result.market_impact.affected_markets_en || result.market_impact.affected_markets,
          logic: result.market_impact.logic,
          logic_en: result.market_impact.logic_en || result.market_impact.logic
        },
        related_stocks: result.related_stocks || [],
        confidence: result.confidence,
        analyzedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('[NewsAnalyzer] Error:', error)
      throw error
    }
  }

  /**
   * 系统提示词
   */
  private getSystemPrompt(): string {
    return `你是一个专业的金融新闻分析师。你的任务是：
1. 精炼总结新闻内容（中英文各3-5行）
2. 翻译新闻标题为英文
3. 分析新闻对金融市场的影响（中英文双语）

【严格禁止】
- 不得预测任何具体价格或点位
- 不得给出买卖建议
- 不得使用"必涨/必跌"等确定性表述

【只允许】
- 判断市场方向倾向（利多/利空/中性）
- 分析市场预期变化
- 说明情绪和因果逻辑

请以JSON格式输出：
{
  "title_en": "English translation of the news title",
  "summary_cn": "中文总结",
  "summary_en": "English summary",
  "market_impact": {
    "direction": "利多/利空/中性",
    "direction_en": "Bullish/Bearish/Neutral",
    "affected_markets": ["中证指数", "纳斯达克指数"],
    "affected_markets_en": ["CSI Index", "NASDAQ"],
    "logic": "影响逻辑说明",
    "logic_en": "Impact logic explanation in English"
  },
  "related_stocks": [
    {
      "symbol": "股票代码（如 AAPL, 600519.SH, 00700.HK）",
      "name": "公司名称",
      "market": "US/CN/HK"
    }
  ],
  "confidence": 0.8
}

【股票识别规则】
- 只标注新闻中明确提到的上市公司
- 提供准确的股票代码（A股加.SH/.SZ，港股加.HK，美股直接代码）
- 如果新闻没有提到具体公司，related_stocks返回空数组[]
- 最多标注5个最相关的股票

免责声明：本分析仅用于信息参考，不构成投资建议。`
  }

  /**
   * 构建用户提示词
   */
  private buildPrompt(news: RawNews): string {
    return `请分析以下财经新闻：

【新闻来源】${news.source}
【发布时间】${news.time}
【新闻标题】${news.title}
【新闻内容】${news.content}

请按照系统提示的格式输出分析结果。`
  }
}
