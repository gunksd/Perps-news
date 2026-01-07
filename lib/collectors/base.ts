import { RawNews } from '../types/news'

/**
 * 新闻采集器基类
 */
export abstract class BaseCollector {
  protected source: string

  constructor(source: string) {
    this.source = source
  }

  /**
   * 采集新闻（子类必须实现）
   */
  abstract collect(): Promise<RawNews[]>

  /**
   * 过滤今天的新闻
   */
  protected filterToday(news: RawNews[]): RawNews[] {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return news.filter(item => {
      const newsDate = new Date(item.time)
      newsDate.setHours(0, 0, 0, 0)
      return newsDate.getTime() === today.getTime()
    })
  }

  /**
   * 生成唯一ID
   */
  protected generateId(source: string, title: string, time: string): string {
    const hash = Buffer.from(`${source}-${title}-${time}`).toString('base64')
    return hash.substring(0, 16)
  }

  /**
   * 重试机制
   */
  protected async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        if (i === maxRetries - 1) throw error
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
    throw new Error('Max retries reached')
  }
}
