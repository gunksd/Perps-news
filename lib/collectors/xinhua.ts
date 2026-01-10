import { BaseCollector } from './base'
import { RawNews } from '../types/news'
import Parser from 'rss-parser'

/**
 * 新华网财经采集器
 * 使用新华网官方RSS
 */
export class XinhuaCollector extends BaseCollector {
  private rssUrl = 'http://www.news.cn/fortune/news_fortune.xml'
  private parser: Parser

  constructor() {
    super('xinhua')
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
        id: this.generateId('xinhua', item.title || '', item.pubDate || ''),
        time: item.pubDate || new Date().toISOString(),
        source: 'xinhua',
        title: item.title || '',
        content: this.cleanContent(item.contentSnippet || item.content || ''),
        url: item.link || ''
      }))

      // 改为过滤最近48小时的新闻，避免丢弃昨天的数据
      return this.filterRecent(news, 48)
    } catch (error) {
      console.error('[XinhuaCollector] Error:', error)
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
