import { IndexData, CandleData, SUPPORTED_INDICES, IndexSymbol } from '../types/indices'

/**
 * Yahoo Finance 数据获取器
 * 无需API Key，使用公开接口
 */
export class YahooFinanceClient {
  private baseUrl = 'https://query1.finance.yahoo.com'

  /**
   * 获取指数实时数据
   */
  async getIndexData(symbol: IndexSymbol): Promise<IndexData> {
    const config = SUPPORTED_INDICES[symbol]
    const url = `${this.baseUrl}/v8/finance/chart/${config.yahooSymbol}?interval=1d&range=1d`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${symbol}: ${response.statusText}`)
      }

      const data = await response.json()
      const quote = data.chart.result[0]
      const meta = quote.meta
      const current = meta.regularMarketPrice
      const previousClose = meta.chartPreviousClose

      const change = current - previousClose
      const changePercent = (change / previousClose) * 100

      return {
        symbol: config.symbol,
        name: config.name_cn,
        price: current,
        change,
        changePercent,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error(`[YahooFinance] Error fetching ${symbol}:`, error)
      throw error
    }
  }

  /**
   * 获取K线数据
   */
  async getCandleData(
    symbol: IndexSymbol,
    range: '1d' | '5d' | '1mo' = '5d',
    interval: '5m' | '15m' | '1h' | '1d' = '1h'
  ): Promise<CandleData[]> {
    const config = SUPPORTED_INDICES[symbol]
    const url = `${this.baseUrl}/v8/finance/chart/${config.yahooSymbol}?interval=${interval}&range=${range}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch candles: ${response.statusText}`)
      }

      const data = await response.json()
      const result = data.chart.result[0]
      const timestamps = result.timestamp
      const quotes = result.indicators.quote[0]

      const candles: CandleData[] = timestamps.map((ts: number, idx: number) => ({
        time: new Date(ts * 1000).toISOString(),
        open: quotes.open[idx],
        high: quotes.high[idx],
        low: quotes.low[idx],
        close: quotes.close[idx],
        volume: quotes.volume[idx]
      }))

      return candles.filter(c => c.open && c.high && c.low && c.close)
    } catch (error) {
      console.error(`[YahooFinance] Error fetching candles:`, error)
      throw error
    }
  }

  /**
   * 批量获取多个指数数据
   */
  async getMultipleIndices(symbols: IndexSymbol[]): Promise<IndexData[]> {
    const promises = symbols.map(symbol => this.getIndexData(symbol))
    return Promise.all(promises)
  }
}
