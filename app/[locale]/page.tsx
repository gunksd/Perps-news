import { getTranslations } from 'next-intl/server'
import NewsCard from './components/NewsCard'
import IndexPanel from './components/IndexPanel'
import SummaryPanel from './components/SummaryPanel'
import Disclaimer from './components/Disclaimer'

async function getNewsData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/news`, {
      next: { revalidate: 300 } // ISR: 5分钟重新生成
    } as any)

    if (!response.ok) {
      throw new Error('Failed to fetch news')
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching news:', error)
    return []
  }
}

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
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
              {locale === 'zh' ? '今日最重要的20条新闻' : 'Top 20 Important News Today'}
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
