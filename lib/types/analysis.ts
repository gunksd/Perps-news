/**
 * AI分析结果结构
 */
export interface NewsAnalysis {
  newsId: string // 关联的新闻ID
  title_en?: string // 英文标题翻译
  summary_cn: string // 中文精炼总结（3-5行）
  summary_en: string // 英文精炼总结
  market_impact: {
    direction: '利多' | '利空' | '中性'
    direction_en?: string // 英文方向: Bullish/Bearish/Neutral
    affected_markets: string[] // 如: ['中证指数', '纳斯达克']
    affected_markets_en?: string[] // 英文市场名称
    logic: string // 影响逻辑说明
    logic_en?: string // 英文影响逻辑
  }
  related_stocks?: Array<{
    symbol: string // 股票代码: AAPL, 600519.SH, 00700.HK
    name: string // 公司名称
    market: 'US' | 'CN' | 'HK' // 市场
  }>
  confidence: number // 0~1，AI自评置信度
  analyzedAt: string // 分析时间
}

/**
 * 指数级汇总结果
 */
export interface IndexSummary {
  index: '中证指数' | '纳斯达克指数'
  timestamp: string
  period: '10:00' | '22:00'
  short_term: {
    direction: '偏多' | '偏空' | '震荡'
    logic: string
  }
  medium_term: {
    direction: '偏多' | '偏空' | '不确定'
    logic: string
  }
  key_news_ids: string[] // 关联的关键新闻ID
  confidence: number
}

/**
 * AI分析配置
 */
export interface AnalysisConfig {
  provider: 'openai' | 'anthropic' | 'custom'
  model: string
  temperature: number
  maxTokens: number
  systemPrompt: string
}
