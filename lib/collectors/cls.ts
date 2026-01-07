import { BaseCollector } from './base'
import { RawNews } from '../types/news'
import * as cheerio from 'cheerio'

/**
 * 财联社采集器
 * 通过HTML解析公开页面
 */
export class CLSCollector extends BaseCollector {
  private url = 'https://www.cls.cn/telegraph'

  constructor() {
    super('cls')
  }

  async collect(): Promise<RawNews[]> {
    try {
      const html = await this.retry(() =>
        fetch(this.url).then(res => res.text())
      )

      const $ = cheerio.load(html)
      const news: RawNews[] = []

      // 解析快讯列表（实际选择器需要根据页面结构调整）
      $('.telegraph-item').each((_, element) => {
        const $el = $(element)
        const title = $el.find('.title').text().trim()
        const content = $el.find('.content').text().trim()
        const time = $el.find('.time').attr('data-time') || new Date().toISOString()
        const url = $el.find('a').attr('href') || ''

        if (title && content) {
          news.push({
            id: this.generateId('cls', title, time),
            time,
            source: 'cls',
            title,
            content,
            url: url.startsWith('http') ? url : `https://www.cls.cn${url}`
          })
        }
      })

      return this.filterToday(news)
    } catch (error) {
      console.error('[CLSCollector] Error:', error)
      return []
    }
  }
}
