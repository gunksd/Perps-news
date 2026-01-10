'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { RawNews } from '@/lib/types/news'
import { NewsAnalysis } from '@/lib/types/analysis'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface NewsCardProps {
  news: RawNews
  analysis?: NewsAnalysis | undefined
  locale: string
}

export default function NewsCard({ news, analysis, locale }: NewsCardProps) {
  const t = useTranslations()

  // 使用 useMemo 确保时间格式化在客户端一致
  const formattedTime = useMemo(() => {
    return new Date(news.time).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [news.time, locale])

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case '利多':
      case 'Bullish':
        return 'text-positive'
      case '利空':
      case 'Bearish':
        return 'text-negative'
      default:
        return 'text-neutral'
    }
  }

  const getDirectionBg = (direction: string) => {
    switch (direction) {
      case '利多':
      case 'Bullish':
        return 'bg-green-100 dark:bg-green-900/30'
      case '利空':
      case 'Bearish':
        return 'bg-red-100 dark:bg-red-900/30'
      default:
        return 'bg-gray-100 dark:bg-gray-800'
    }
  }

  const getBorderColor = (direction: string) => {
    switch (direction) {
      case '利多':
      case 'Bullish':
        return 'border-l-positive'
      case '利空':
      case 'Bearish':
        return 'border-l-negative'
      default:
        return 'border-l-muted'
    }
  }

  // 如果没有分析数据，使用原始新闻标题和默认值
  const title = (locale === 'en' && analysis?.title_en) ? analysis.title_en : news.title
  const summary = analysis
    ? (locale === 'zh' ? analysis.summary_cn : analysis.summary_en)
    : null

  const direction = analysis?.market_impact
    ? (locale === 'en' && analysis.market_impact.direction_en
        ? analysis.market_impact.direction_en
        : analysis.market_impact.direction)
    : (locale === 'zh' ? '待分析' : 'Pending')

  const logic = analysis?.market_impact
    ? (locale === 'en' && analysis.market_impact.logic_en
        ? analysis.market_impact.logic_en
        : analysis.market_impact.logic)
    : null

  const affectedMarkets = analysis?.market_impact?.affected_markets_en && locale === 'en'
    ? analysis.market_impact.affected_markets_en
    : (analysis?.market_impact?.affected_markets || [])

  // 生成股票链接
  const getStockUrl = (symbol: string, market: string) => {
    switch (market) {
      case 'US':
        return `https://finance.yahoo.com/quote/${symbol}`
      case 'CN':
        // A股：上海.SH / 深圳.SZ
        const code = symbol.replace('.SH', '').replace('.SZ', '')
        const exchange = symbol.includes('.SH') ? 'sh' : 'sz'
        return `https://xueqiu.com/S/${exchange}${code}`
      case 'HK':
        // 港股：去掉.HK，补齐5位数
        const hkCode = symbol.replace('.HK', '').padStart(5, '0')
        return `https://xueqiu.com/S/${hkCode}`
      default:
        return '#'
    }
  }

  return (
    <article
      id={`news-${news.id}`}
      className="group scroll-mt-24"
    >
      <Card
        className={cn(
          "relative overflow-hidden",
          "border-l-4 transition-all duration-200",
          "hover:shadow-lg hover:shadow-primary/5",
          "bg-gradient-to-br from-card via-card to-card/80",
          getBorderColor(direction)
        )}
      >
        {/* 背景渐变装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* 右上角装饰光斑 */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                {news.source.toUpperCase()}
              </span>
              <time className="text-sm text-muted-foreground" suppressHydrationWarning>
                {formattedTime}
              </time>
            </div>
            <span className={cn(
              "px-3 py-1 text-xs font-semibold rounded-full transition-all",
              "group-hover:scale-110",
              getDirectionBg(direction),
              getDirectionColor(direction)
            )}>
              {direction}
            </span>
          </div>

          <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          <div className="space-y-4">
            {summary && (
              <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t('news.analysis')}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {summary}
                </p>
              </div>
            )}

            {!analysis && news.content && (
              <div className="bg-muted/20 rounded-lg p-4 border border-border/30">
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  {locale === 'zh' ? '新闻内容' : 'Content'}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {news.content}
                </p>
              </div>
            )}

            {logic && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {t('news.impact')}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {logic}
                </p>

                {/* 相关股票标签 */}
                {analysis && analysis.related_stocks && analysis.related_stocks.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs font-medium text-muted-foreground">
                      {locale === 'zh' ? '相关股票:' : 'Related Stocks:'}
                    </span>
                    {analysis.related_stocks.map((stock, idx) => (
                      <a
                        key={idx}
                        href={getStockUrl(stock.symbol, stock.market)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full",
                          "bg-primary/10 text-primary",
                          "hover:bg-primary/20 hover:scale-105 transition-all",
                          "border border-primary/20"
                        )}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        {stock.symbol}
                        <span className="opacity-75">{stock.name}</span>
                      </a>
                    ))}
                  </div>
                )}

                {/* 受影响市场 */}
                {affectedMarkets.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {affectedMarkets.map((market, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md border border-border/50"
                      >
                        {market}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {news.url && (
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg",
                "text-sm font-medium text-primary",
                "bg-primary/5 hover:bg-primary/10",
                "border border-primary/20 hover:border-primary/40",
                "transition-all hover:scale-105"
              )}
            >
              {locale === 'zh' ? '查看原文' : 'Read More'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </CardContent>
      </Card>
    </article>
  )
}
