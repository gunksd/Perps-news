import { BaseCollector } from './base'
import { RawNews } from '../types/news'

/**
 * 金十数据采集器
 * 使用金十数据公开API（无需认证）
 */
export class Jin10Collector extends BaseCollector {
  private apiUrl = 'https://flash-api.jin10.com/get_flash_list'

  constructor() {
    super('jin10')
  }

  async collect(): Promise<RawNews[]> {
    try {
      const response = await this.retry(() =>
        fetch(this.apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
          }
        })
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const items = data?.data || []

      const news: RawNews[] = items.map((item: any) => ({
        id: this.generateId('jin10', item.content || '', item.time || ''),
        time: new Date(item.time * 1000).toISOString(),
        source: 'jin10',
        title: item.content?.substring(0, 50) || '',
        content: item.content || '',
        url: `https://www.jin10.com/flash/${item.id}`
      }))

      return this.filterToday(news)
    } catch (error) {
      console.error('[Jin10Collector] Error:', error)
      return []
    }
  }
}
