import { BaseCollector } from './base'
import { RawNews } from '../types/news'
import Parser from 'rss-parser'

/**
 * 美联储采集器
 * 使用美联储官方RSS
 */
export class FedCollector extends BaseCollector {
  private rssUrl = 'https://www.federalreserve.gov/feeds/press_all.xml'
  private parser: Parser

  constructor() {
    super('fed')
    this.parser = new Parser({
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    })
  }

  async collect(): Promise<RawNews[]> {
    try {
      const feed = await this.retry(() => this.parser.parseURL(this.rssUrl))

      const news: RawNews[] = feed.items.map(item => ({
        id: this.generateId('fed', item.title || '', item.pubDate || ''),
        time: item.pubDate || new Date().toISOString(),
        source: 'fed',
        title: item.title || '',
        content: this.cleanContent(item.contentSnippet || item.content || ''),
        url: item.link || ''
      }))

      // 改为过滤最近48小时的新闻，避免丢弃昨天的数据
      return this.filterRecent(news, 48)
    } catch (error) {
      console.error('[FedCollector] Error:', error)
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
