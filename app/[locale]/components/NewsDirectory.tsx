'use client'

import { useTranslations } from 'next-intl'
import { RawNews } from '@/lib/types/news'
import { NewsAnalysis } from '@/lib/types/analysis'
import { cn } from '@/lib/utils'

interface NewsDirectoryProps {
  newsItems: Array<{ news: RawNews; analysis?: NewsAnalysis }>
  locale: string
}

export default function NewsDirectory({ newsItems, locale }: NewsDirectoryProps) {
  const t = useTranslations()

  const scrollToNews = (newsId: string) => {
    const element = document.getElementById(`news-${newsId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // 添加高亮效果
      element.classList.add('highlight-pulse')
      setTimeout(() => {
        element.classList.remove('highlight-pulse')
      }, 2000)
    }
  }

  const getDirectionIcon = (direction?: string) => {
    if (!direction) return '○'
    switch (direction) {
      case '利多':
      case 'Bullish':
        return '↑'
      case '利空':
      case 'Bearish':
        return '↓'
      default:
        return '●'
    }
  }

  const getDirectionColor = (direction?: string) => {
    if (!direction) return 'text-muted-foreground'
    switch (direction) {
      case '利多':
      case 'Bullish':
        return 'text-positive'
      case '利空':
      case 'Bearish':
        return 'text-negative'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          {locale === 'zh' ? '新闻目录' : 'News Directory'}
        </h3>
        <span className="text-sm text-muted-foreground">
          {newsItems.length} {locale === 'zh' ? '条' : 'items'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {newsItems.map((item, index) => {
          const direction = item.analysis?.market_impact
            ? (locale === 'en' && item.analysis.market_impact.direction_en
                ? item.analysis.market_impact.direction_en
                : item.analysis.market_impact.direction)
            : undefined

          return (
            <button
              key={item.news.id}
              onClick={() => scrollToNews(item.news.id)}
              className={cn(
                "group flex items-start gap-3 p-3 rounded-lg text-left",
                "transition-all duration-200",
                "hover:bg-primary/5 hover:shadow-sm",
                "border border-transparent hover:border-primary/20"
              )}
            >
              {/* 序号和方向图标 */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <span className="text-xs font-medium text-muted-foreground w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center">
                  {index + 1}
                </span>
                <span className={cn("text-lg font-bold", getDirectionColor(direction))}>
                  {getDirectionIcon(direction)}
                </span>
              </div>

              {/* 新闻标题 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {item.news.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {item.news.source.toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.news.time).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                  </span>
                </div>
              </div>

              {/* 箭头指示 */}
              <svg
                className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )
        })}
      </div>
    </div>
  )
}
