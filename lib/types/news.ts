/**
 * 原始新闻数据结构
 */
export interface RawNews {
  id: string
  time: string // ISO 8601 格式
  source: 'jin10' | 'cls' | 'cctv' | 'fed' | 'sina' | 'eastmoney' | 'caixin' | 'netease' | 'yicai' | 'people' | 'xinhua'
  title: string
  content: string
  url: string
  importance?: 'high' | 'medium' | 'low' // 预留重要性字段
}

/**
 * 新闻来源配置
 */
export interface NewsSource {
  id: string
  name: string
  type: 'rss' | 'html'
  url: string
  enabled: boolean
}

/**
 * 采集器统计信息
 */
export interface CollectorStats {
  source: string
  collected: number
  errors: number
  lastRun: string
}
