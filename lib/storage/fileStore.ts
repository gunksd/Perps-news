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

  constructor(dataDir: string = './data') {
    this.dataDir = dataDir
  }

  /**
   * 初始化存储目录
   */
  async init(): Promise<void> {
    await fs.mkdir(this.dataDir, { recursive: true })
  }

  /**
   * 保存新闻数据
   */
  async saveNews(news: RawNews[]): Promise<void> {
    const filePath = path.join(this.dataDir, 'news.json')
    const existing = await this.loadNews()

    // 合并去重
    const newsMap = new Map(existing.map(n => [n.id, n]))
    news.forEach(n => newsMap.set(n.id, n))

    const merged = Array.from(newsMap.values())
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    await fs.writeFile(filePath, JSON.stringify(merged, null, 2), 'utf-8')
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
   * 保存分析结果
   */
  async saveAnalyses(analyses: NewsAnalysis[]): Promise<void> {
    const filePath = path.join(this.dataDir, 'analyses.json')
    const existing = await this.loadAnalyses()

    const analysisMap = new Map(existing.map(a => [a.newsId, a]))
    analyses.forEach(a => analysisMap.set(a.newsId, a))

    const merged = Array.from(analysisMap.values())

    await fs.writeFile(filePath, JSON.stringify(merged, null, 2), 'utf-8')
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
}
