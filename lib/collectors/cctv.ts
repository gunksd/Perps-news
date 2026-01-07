import { BaseCollector } from './base'
import { RawNews } from '../types/news'
import Parser from 'rss-parser'

/**
 * 央视财经采集器
 * 使用官方RSS源
 */
export class CCTVCollector extends BaseCollector {
  private rssUrl = 'http://www.cctv.com/rss/financial.xml'
  private parser: Parser

  constructor() {
    super('cctv')
    this.parser = new Parser()
  }

  async collect(): Promise<RawNews[]> {
    try {
      const feed = await this.retry(() => this.parser.parseURL(this.rssUrl))

      const news: RawNews[] = feed.items.map(item => ({
        id: this.generateId('cctv', item.title || '', item.pubDate || ''),
        time: item.pubDate || new Date().toISOString(),
        source: 'cctv',
        title: item.title || '',
        content: this.cleanContent(item.contentSnippet || item.content || ''),
        url: item.link || ''
      }))

      return this.filterToday(news)
    } catch (error) {
      console.error('[CCTVCollector] Error:', error)
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
