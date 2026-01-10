'use client'

import { useState } from 'react'
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
  const [isExpanded, setIsExpanded] = useState(false)

  const scrollToNews = (newsId: string) => {
    const element = document.getElementById(`news-${newsId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // 添加高亮效果
      element.classList.add('highlight-pulse')
      setTimeout(() => {
        element.classList.remove('highlight-pulse')
      }, 2000)
      // 关闭目录
      setIsExpanded(false)
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
    <>
      {/* 收缩状态 - 顶部栏 */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className={cn(
            "w-full mb-4 p-4 rounded-xl",
            "bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10",
            "border-2 border-primary/20",
            "hover:border-primary/40",
            "transition-colors",
            "group"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-foreground">
                  {locale === 'zh' ? '📑 新闻目录' : '📑 News Directory'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {locale === 'zh' ? `点击展开 ${newsItems.length} 条新闻` : `Click to expand ${newsItems.length} items`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* 快速统计 */}
              <div className="hidden sm:flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="text-positive font-bold">↑</span>
                  <span className="text-muted-foreground">
                    {newsItems.filter(item => {
                      const dir = item.analysis?.market_impact?.direction
                      const dirEn = item.analysis?.market_impact?.direction_en
                      return dir === '利多' || dirEn === 'Bullish'
                    }).length}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-negative font-bold">↓</span>
                  <span className="text-muted-foreground">
                    {newsItems.filter(item => {
                      const dir = item.analysis?.market_impact?.direction
                      const dirEn = item.analysis?.market_impact?.direction_en
                      return dir === '利空' || dirEn === 'Bearish'
                    }).length}
                  </span>
                </span>
              </div>

              {/* 展开图标 */}
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </button>
      )}

      {/* 展开状态 - 弹出式面板 */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
          onClick={() => setIsExpanded(false)}
        >
          {/* 背景遮罩 */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

          {/* 目录内容 */}
          <div
            className={cn(
              "relative w-full max-w-4xl max-h-[70vh]",
              "bg-card/95 backdrop-blur-md rounded-2xl",
              "border-2 border-primary/30 shadow-2xl shadow-primary/20",
              "animate-in slide-in-from-top-10 duration-300"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {locale === 'zh' ? '新闻目录' : 'News Directory'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {locale === 'zh' ? '点击新闻快速跳转' : 'Click to jump to news'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsExpanded(false)}
                  className={cn(
                    "p-2 rounded-lg",
                    "hover:bg-muted transition-colors",
                    "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 目录列表 */}
            <div className="overflow-y-auto p-6 max-h-[calc(70vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                        "group flex items-start gap-3 p-3 rounded-xl text-left",
                        "transition-colors",
                        "hover:bg-primary/10",
                        "border border-border/50 hover:border-primary/30"
                      )}
                    >
                      {/* 序号和方向图标 */}
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <span className="text-xs font-medium text-muted-foreground w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
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
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {item.news.source.toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.news.time).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                          </span>
                        </div>
                      </div>

                      {/* 箭头指示 */}
                      <svg
                        className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1"
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
          </div>
        </div>
      )}
    </>
  )
}
