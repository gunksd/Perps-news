import { IndexData, CandleData, SUPPORTED_INDICES, IndexSymbol } from '../types/indices'

/**
 * 新浪财经数据获取器
 * 完全免费，提供实时数据，覆盖A股和美股
 */
export class SinaFinanceClient {
  private baseUrl = 'https://hq.sinajs.cn/list='

  /**
   * Symbol映射：内部symbol -> 新浪代码
   */
  private symbolMap: Record<IndexSymbol, string> = {
    CSI500: 's_sh000905',   // 中证500
    SSE: 's_sh000001',       // 上证指数
    NASDAQ: 'int_nasdaq'     // 纳斯达克综合指数（国际指数）
  }

  /**
   * 获取指数实时数据
   */
  async getIndexData(symbol: IndexSymbol): Promise<IndexData> {
    const sinaSymbol = this.symbolMap[symbol]
    const url = `${this.baseUrl}${sinaSymbol}`

    try {
      const response = await fetch(url, {
        headers: {
          'Referer': 'https://finance.sina.com.cn',
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch ${symbol}: ${response.statusText}`)
      }

      const text = await response.text()

      // 解析新浪返回的数据格式: var hq_str_s_sh000001="上证指数,3411.9998,14.3204,0.42";
      const match = text.match(/="([^"]+)"/)
      if (!match) {
        throw new Error(`Invalid response format for ${symbol}`)
      }

      const parts = match[1].split(',')

      // A股指数格式: 名称,当前点数,涨跌点,涨跌幅
      // 美股指数格式: 名称,当前点数,涨跌点,涨跌幅,时间
      const name = parts[0]
      const current = parseFloat(parts[1])
      const change = parseFloat(parts[2])
      const changePercent = parseFloat(parts[3])

      return {
        symbol: SUPPORTED_INDICES[symbol].symbol,
        name: SUPPORTED_INDICES[symbol].name_cn,
        price: current,
        change,
        changePercent,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error(`[SinaFinance] Error fetching ${symbol}:`, error)
      throw error
    }
  }

  /**
   * 获取K线数据 - 使用新浪K线接口
   */
  async getCandleData(
    symbol: IndexSymbol,
    scale: '5m' | '15m' | '30m' | '60m' | 'daily' = '60m',
    count: number = 240
  ): Promise<CandleData[]> {
    const sinaSymbol = this.symbolMap[symbol]

    // 新浪K线接口
    const url = `https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData?symbol=${sinaSymbol}&scale=${scale}&ma=no&datalen=${count}`

    try {
      const response = await fetch(url, {
        headers: {
          'Referer': 'https://finance.sina.com.cn',
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch candles: ${response.statusText}`)
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        return []
      }

      const candles: CandleData[] = data.map((item: any) => ({
        time: item.day,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseFloat(item.volume)
      }))

      return candles.filter(c => c.open && c.high && c.low && c.close)
    } catch (error) {
      console.error(`[SinaFinance] Error fetching candles:`, error)
      // 如果K线获取失败，返回空数组而不是抛出错误
      return []
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
