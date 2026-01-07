import { BaseCollector } from './base'
import { RawNews } from '../types/news'
import Parser from 'rss-parser'

/**
 * 金十数据采集器
 * 使用RSS源（免费，无需API Key）
 */
export class Jin10Collector extends BaseCollector {
  private rssUrl = 'https://rss.jin10.com/app_article.xml'
  private parser: Parser

  constructor() {
    super('jin10')
    this.parser = new Parser()
  }

  async collect(): Promise<RawNews[]> {
    try {
      const feed = await this.retry(() => this.parser.parseURL(this.rssUrl))

      const news: RawNews[] = feed.items.map(item => ({
        id: this.generateId('jin10', item.title || '', item.pubDate || ''),
        time: item.pubDate || new Date().toISOString(),
        source: 'jin10',
        title: item.title || '',
        content: this.cleanContent(item.contentSnippet || item.content || ''),
        url: item.link || ''
      }))

      return this.filterToday(news)
    } catch (error) {
      console.error('[Jin10Collector] Error:', error)
      return []
    }
  }

  /**
   * 清理HTML标签和多余空白
   */
  private cleanContent(content: string): string {
    return content
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }
}
