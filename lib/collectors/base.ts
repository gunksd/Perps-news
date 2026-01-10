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
   * 过滤最近N小时的新闻（默认48小时，与页面显示逻辑一致）
   */
  protected filterRecent(news: RawNews[], hours: number = 48): RawNews[] {
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000

    return news.filter(item => {
      const newsTime = new Date(item.time).getTime()
      return newsTime >= cutoffTime
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
