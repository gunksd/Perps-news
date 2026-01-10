import { BaseCollector } from './base'
import { RawNews } from '../types/news'

/**
 * 财联社采集器
 * 使用财联社公开API
 */
export class CLSCollector extends BaseCollector {
  private apiUrl = 'https://www.cls.cn/nodeapi/telegraphList'

  constructor() {
    super('cls')
  }

  async collect(): Promise<RawNews[]> {
    try {
      const response = await this.retry(() =>
        fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            app: 'CailianpressWeb',
            os: 'web',
            refresh_type: 1,
            order: 1,
            rn: 50
          })
        })
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const items = data?.data?.roll_data || []

      const news: RawNews[] = items.map((item: any) => ({
        id: this.generateId('cls', item.title || '', item.ctime || ''),
        time: new Date(item.ctime * 1000).toISOString(),
        source: 'cls',
        title: item.title || '',
        content: this.cleanContent(item.content || ''),
        url: `https://www.cls.cn/telegraph/${item.id}`
      }))

      // 改为过滤最近48小时的新闻，避免丢弃昨天的数据
      return this.filterRecent(news, 48)
    } catch (error) {
      console.error('[CLSCollector] Error:', error)
      return []
    }
  }

  private cleanContent(content: string): string {
    return content
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }
}
