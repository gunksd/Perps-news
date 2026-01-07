/**
 * 指数数据结构
 */
export interface IndexData {
  symbol: string // 如: '000905.SS', '^IXIC'
  name: string
  price: number
  change: number
  changePercent: number
  timestamp: string
}

/**
 * K线数据点
 */
export interface CandleData {
  time: string // ISO 8601
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/**
 * 支持的指数配置
 */
export const SUPPORTED_INDICES = {
  CSI500: {
    symbol: '000905.SS',
    name_cn: '中证500',
    name_en: 'CSI 500',
    yahooSymbol: '000905.SS'
  },
  SSE: {
    symbol: '000001.SS',
    name_cn: '上证指数',
    name_en: 'Shanghai Composite',
    yahooSymbol: '000001.SS'
  },
  NASDAQ: {
    symbol: '^IXIC',
    name_cn: '纳斯达克',
    name_en: 'NASDAQ Composite',
    yahooSymbol: '^IXIC'
  }
} as const

export type IndexSymbol = keyof typeof SUPPORTED_INDICES
