import { getTranslations, setRequestLocale } from 'next-intl/server'
import NewsCard from './components/NewsCard'
import IndexPanel from './components/IndexPanel'
import SummaryPanel from './components/SummaryPanel'
import Disclaimer from './components/Disclaimer'
import { routing } from '@/i18n/routing'
import { FileStore } from '@/lib/storage/fileStore'
import { RawNews } from '@/lib/types/news'
import { NewsAnalysis } from '@/lib/types/analysis'

// 新闻来源权重
const SOURCE_WEIGHTS: Record<string, number> = {
  'xinhua': 10, 'cctv': 9, 'fed': 8, 'people': 7,
  'jin10': 6, 'cls': 6, 'sina': 5, 'default': 3
}

// 财经关键词
const FINANCIAL_KEYWORDS = {
  high: ['降息', '加息', '降准', 'GDP', 'CPI', 'PPI', 'PMI', '通胀', '央行', '美联储'],
  medium: ['财政政策', '货币政策', '利率', '汇率', '股市', '债券', 'IPO', '财报', '业绩'],
  standard: ['经济', '金融', '市场', '行业', '企业', '增长', '预期', '改革']
}

function calculateKeywordScore(newsItem: RawNews): number {
  const text = `${newsItem.title} ${newsItem.content}`.toLowerCase()
  let score = 0
  for (const keyword of FINANCIAL_KEYWORDS.high) {
    if (text.includes(keyword.toLowerCase())) score += 3
  }
  for (const keyword of FINANCIAL_KEYWORDS.medium) {
    if (text.includes(keyword.toLowerCase())) score += 2
  }
  for (const keyword of FINANCIAL_KEYWORDS.standard) {
    if (text.includes(keyword.toLowerCase())) score += 1
  }
  return Math.min(score, 10)
}

function calculateImportance(newsItem: RawNews, analysis: NewsAnalysis | undefined): number {
  let score = 0
  score += SOURCE_WEIGHTS[newsItem.source] || SOURCE_WEIGHTS['default']
  if (analysis) {
    score += (analysis.confidence || 0) * 10
    if (analysis.market_impact?.direction === '利多' || analysis.market_impact?.direction === '利空') {
      score += 5
    } else if (analysis.market_impact?.direction === '中性') {
      score += 2
    }
  }

  // 时效性评分（改进：使用平滑衰减）
  const hoursAgo = (Date.now() - new Date(newsItem.time).getTime()) / (1000 * 60 * 60)
  if (hoursAgo < 2) score += 8       // 2小时内：非常新
  else if (hoursAgo < 6) score += 6  // 6小时内：很新
  else if (hoursAgo < 12) score += 4 // 12小时内：较新
  else if (hoursAgo < 24) score += 2 // 24小时内：一天内
  else if (hoursAgo < 48) score += 1 // 48小时内：两天内

  score += calculateKeywordScore(newsItem)
  return score
}

async function getNewsData() {
  try {
    const store = new FileStore()
    await store.init()

    // 改为获取最近48小时的新闻，避免凌晨空白
    const news = await store.getRecentNews(48)
    const analyses = await store.loadAnalyses()

    const combined = news.map(newsItem => {
      const analysis = analyses.find(a => a.newsId === newsItem.id)
      return {
        news: newsItem,
        analysis,
        importance: calculateImportance(newsItem, analysis)
      }
    })
    // 移除 .filter(item => item.analysis) - 允许显示未分析的新闻

    const topNews = combined
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 30) // 增加到30条以显示更多新闻
      .map(({ news, analysis }) => ({ news, analysis }))

    return topNews
  } catch (error) {
    console.error('Error loading news:', error)
    return []
  }
}

// 生成静态参数
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  // 启用静态渲染
  setRequestLocale(locale)

  const t = await getTranslations()
  const newsData = await getNewsData()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 左侧：指数面板 + 市场总结（独立滚动） */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
            <IndexPanel />
            <SummaryPanel />
          </div>
        </div>

        {/* 右侧：新闻流（自然延伸） */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('news.title')}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {locale === 'zh' ? '最近48小时的重要新闻' : 'Top News in Last 48 Hours'}
            </span>
          </div>

          <div className="space-y-4">
            {newsData.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {locale === 'zh' ? '暂无新闻数据' : 'No news available'}
                </p>
              </div>
            ) : (
              <>
                {newsData.map((item: any) => (
                  <NewsCard
                    key={item.news.id}
                    news={item.news}
                    analysis={item.analysis}
                    locale={locale}
                  />
                ))}
              </>
            )}
          </div>

          <div className="mt-6">
            <Disclaimer />
          </div>
        </div>
      </div>
    </div>
  )
}

// ISR配置
export const revalidate = 300 // 5分钟
