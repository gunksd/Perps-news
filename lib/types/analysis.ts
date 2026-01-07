/**
 * AI分析结果结构
 */
export interface NewsAnalysis {
  newsId: string // 关联的新闻ID
  summary_cn: string // 中文精炼总结（3-5行）
  summary_en: string // 英文精炼总结
  market_impact: {
    direction: '利多' | '利空' | '中性'
    affected_markets: string[] // 如: ['中证指数', '纳斯达克']
    logic: string // 影响逻辑说明
  }
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
