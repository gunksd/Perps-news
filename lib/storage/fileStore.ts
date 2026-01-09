import fs from 'fs/promises'
import path from 'path'
import { RawNews } from '../types/news'
import { NewsAnalysis, IndexSummary } from '../types/analysis'
import { IndexData } from '../types/indices'

/**
 * 简单的文件存储系统
 * 生产环境建议使用数据库
 */
export class FileStore {
  private dataDir: string
  private archiveDir: string

  constructor(dataDir: string = './data') {
    this.dataDir = dataDir
    this.archiveDir = path.join(dataDir, 'archive')
  }

  /**
   * 初始化存储目录
   */
  async init(): Promise<void> {
    await fs.mkdir(this.dataDir, { recursive: true })
    await fs.mkdir(this.archiveDir, { recursive: true })
  }

  /**
   * 获取当前年月字符串 (YYYY-MM)
   */
  private getCurrentYearMonth(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  }

  /**
   * 获取日期的年月字符串 (YYYY-MM)
   */
  private getYearMonth(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  }

  /**
   * 归档旧数据（通用版本）
   */
  private async archiveOldData<T extends { time: string } | { analyzedAt: string }>(
    items: T[],
    currentMonth: string,
    filePrefix: string
  ): Promise<T[]> {
    // 按月份分组
    const groupedByMonth = new Map<string, T[]>()
    const currentMonthItems: T[] = []

    items.forEach(item => {
      // 支持 time 或 analyzedAt 字段
      const timeField = 'time' in item ? item.time : 'analyzedAt' in item ? item.analyzedAt : ''
      const itemDate = new Date(timeField)
      const yearMonth = this.getYearMonth(itemDate)

      if (yearMonth === currentMonth) {
        currentMonthItems.push(item)
      } else {
        if (!groupedByMonth.has(yearMonth)) {
          groupedByMonth.set(yearMonth, [])
        }
        groupedByMonth.get(yearMonth)!.push(item)
      }
    })

    // 保存归档数据
    for (const [yearMonth, monthItems] of groupedByMonth.entries()) {
      const archivePath = path.join(this.archiveDir, `${filePrefix}-${yearMonth}.json`)

      // 如果归档文件已存在，合并数据
      let existingArchive: T[] = []
      try {
        const content = await fs.readFile(archivePath, 'utf-8')
        existingArchive = JSON.parse(content)
      } catch {
        // 文件不存在，忽略
      }

      // 合并并去重（根据时间排序）
      const timeField = 'time' in monthItems[0] ? 'time' : 'analyzedAt'
      const mergedArchive = [...existingArchive, ...monthItems]
        .sort((a: any, b: any) => new Date(b[timeField]).getTime() - new Date(a[timeField]).getTime())

      await fs.writeFile(archivePath, JSON.stringify(mergedArchive, null, 2), 'utf-8')
      console.log(`[Archive] Saved ${monthItems.length} items to ${filePrefix}-${yearMonth}.json`)
    }

    return currentMonthItems
  }

  /**
   * 保存新闻数据（带归档）
   */
  async saveNews(news: RawNews[]): Promise<void> {
    const filePath = path.join(this.dataDir, 'news.json')
    const existing = await this.loadNews()

    // 合并去重
    const newsMap = new Map(existing.map(n => [n.id, n]))
    news.forEach(n => newsMap.set(n.id, n))

    const merged = Array.from(newsMap.values())
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    // 归档旧数据，只保留当前月份
    const currentMonth = this.getCurrentYearMonth()
    const currentMonthNews = await this.archiveOldData(merged, currentMonth, 'news')

    console.log(`[Storage] Keeping ${currentMonthNews.length} news items for current month (${currentMonth})`)

    await fs.writeFile(filePath, JSON.stringify(currentMonthNews, null, 2), 'utf-8')
  }

  /**
   * 加载新闻数据
   */
  async loadNews(): Promise<RawNews[]> {
    const filePath = path.join(this.dataDir, 'news.json')
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return []
    }
  }

  /**
   * 保存分析结果（带归档）
   */
  async saveAnalyses(analyses: NewsAnalysis[]): Promise<void> {
    const filePath = path.join(this.dataDir, 'analyses.json')
    const existing = await this.loadAnalyses()

    const analysisMap = new Map(existing.map(a => [a.newsId, a]))
    analyses.forEach(a => analysisMap.set(a.newsId, a))

    const merged = Array.from(analysisMap.values())

    // 归档旧数据，只保留当前月份
    const currentMonth = this.getCurrentYearMonth()
    const currentMonthAnalyses = await this.archiveOldData(merged, currentMonth, 'analyses')

    console.log(`[Storage] Keeping ${currentMonthAnalyses.length} analyses for current month (${currentMonth})`)

    await fs.writeFile(filePath, JSON.stringify(currentMonthAnalyses, null, 2), 'utf-8')
  }

  /**
   * 加载分析结果
   */
  async loadAnalyses(): Promise<NewsAnalysis[]> {
    const filePath = path.join(this.dataDir, 'analyses.json')
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return []
    }
  }

  /**
   * 保存汇总结果
   */
  async saveSummaries(summaries: IndexSummary[]): Promise<void> {
    const filePath = path.join(this.dataDir, 'summaries.json')
    const existing = await this.loadSummaries()

    const merged = [...existing, ...summaries]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 100) // 只保留最近100条

    await fs.writeFile(filePath, JSON.stringify(merged, null, 2), 'utf-8')
  }

  /**
   * 加载汇总结果
   */
  async loadSummaries(): Promise<IndexSummary[]> {
    const filePath = path.join(this.dataDir, 'summaries.json')
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return []
    }
  }

  /**
   * 获取今天的新闻
   */
  async getTodayNews(): Promise<RawNews[]> {
    const allNews = await this.loadNews()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return allNews.filter(news => {
      const newsDate = new Date(news.time)
      newsDate.setHours(0, 0, 0, 0)
      return newsDate.getTime() === today.getTime()
    })
  }

  /**
   * 获取最近N小时的新闻（避免凌晨空白期）
   */
  async getRecentNews(hours: number = 48): Promise<RawNews[]> {
    const allNews = await this.loadNews()
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000

    return allNews.filter(news => {
      const newsTime = new Date(news.time).getTime()
      return newsTime >= cutoffTime
    }).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  }

  /**
   * 保存指数数据
   */
  async saveIndices(indices: IndexData[]): Promise<void> {
    const filePath = path.join(this.dataDir, 'indices.json')
    await fs.writeFile(filePath, JSON.stringify(indices, null, 2), 'utf-8')
  }

  /**
   * 加载指数数据
   */
  async loadIndices(): Promise<IndexData[]> {
    const filePath = path.join(this.dataDir, 'indices.json')
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return []
    }
  }

  /**
   * 读取归档的新闻数据（按月份）
   */
  async loadArchivedNews(yearMonth: string): Promise<RawNews[]> {
    const archivePath = path.join(this.archiveDir, `news-${yearMonth}.json`)
    try {
      const content = await fs.readFile(archivePath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return []
    }
  }

  /**
   * 读取归档的分析数据（按月份）
   */
  async loadArchivedAnalyses(yearMonth: string): Promise<NewsAnalysis[]> {
    const archivePath = path.join(this.archiveDir, `analyses-${yearMonth}.json`)
    try {
      const content = await fs.readFile(archivePath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return []
    }
  }

  /**
   * 列出所有可用的归档月份
   */
  async listArchiveMonths(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.archiveDir)
      const months = new Set<string>()

      files.forEach(file => {
        const match = file.match(/^(news|analyses)-(\d{4}-\d{2})\.json$/)
        if (match) {
          months.add(match[2])
        }
      })

      return Array.from(months).sort().reverse()
    } catch {
      return []
    }
  }

  /**
   * 获取指定月份范围内的所有新闻（包括归档）
   */
  async getNewsInRange(startMonth: string, endMonth: string): Promise<RawNews[]> {
    const allNews: RawNews[] = []
    const currentMonth = this.getCurrentYearMonth()

    // 加载当前月份的数据
    if (startMonth <= currentMonth && currentMonth <= endMonth) {
      const currentNews = await this.loadNews()
      allNews.push(...currentNews)
    }

    // 加载归档数据
    const archiveMonths = await this.listArchiveMonths()
    for (const month of archiveMonths) {
      if (month >= startMonth && month <= endMonth) {
        const archivedNews = await this.loadArchivedNews(month)
        allNews.push(...archivedNews)
      }
    }

    return allNews.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  }
}
