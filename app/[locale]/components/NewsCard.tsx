'use client'

import { useTranslations } from 'next-intl'
import { RawNews } from '@/lib/types/news'
import { NewsAnalysis } from '@/lib/types/analysis'

interface NewsCardProps {
  news: RawNews
  analysis?: NewsAnalysis | undefined
  locale: string
}

export default function NewsCard({ news, analysis, locale }: NewsCardProps) {
  const t = useTranslations()

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

  // 如果没有分析数据，使用原始新闻标题和默认值
  const title = analysis && locale === 'en' && analysis.title_en ? analysis.title_en : news.title
  const summary = analysis ? (locale === 'zh' ? analysis.summary_cn : analysis.summary_en) : null
  const direction = analysis
    ? (locale === 'en' && analysis.market_impact.direction_en
        ? analysis.market_impact.direction_en
        : analysis.market_impact.direction)
    : (locale === 'zh' ? '待分析' : 'Pending')
  const logic = analysis
    ? (locale === 'en' && analysis.market_impact.logic_en
        ? analysis.market_impact.logic_en
        : analysis.market_impact.logic)
    : null
  const affectedMarkets = analysis
    ? (locale === 'en' && analysis.market_impact.affected_markets_en
        ? analysis.market_impact.affected_markets_en
        : analysis.market_impact.affected_markets)
    : []

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
    <article className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
            {news.source.toUpperCase()}
          </span>
          <time className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(news.time).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')}
          </time>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded ${getDirectionBg(direction)} ${getDirectionColor(direction)}`}>
          {direction}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
        {title}
      </h3>

      <div className="space-y-3">
        {summary && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('news.analysis')}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {summary}
            </p>
          </div>
        )}

        {!analysis && news.content && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {locale === 'zh' ? '新闻内容' : 'Content'}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
              {news.content}
            </p>
          </div>
        )}

        {logic && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('news.impact')}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {logic}
            </p>

            {/* 相关股票标签 */}
            {analysis && analysis.related_stocks && analysis.related_stocks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {locale === 'zh' ? '相关股票:' : 'Related Stocks:'}
                </span>
                {analysis.related_stocks.map((stock, idx) => (
                  <a
                    key={idx}
                    href={getStockUrl(stock.symbol, stock.market)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
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
              <div className="flex flex-wrap gap-2 mt-2">
                {affectedMarkets.map((market, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
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
          className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {locale === 'zh' ? '查看原文' : 'Read More'}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </article>
  )
}
