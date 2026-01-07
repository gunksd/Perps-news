'use client'

import { useTranslations } from 'next-intl'
import { RawNews } from '@/lib/types/news'
import { NewsAnalysis } from '@/lib/types/analysis'

interface NewsCardProps {
  news: RawNews
  analysis: NewsAnalysis
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

  const summary = locale === 'zh' ? analysis.summary_cn : analysis.summary_en
  const direction = analysis.market_impact.direction

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
        {news.title}
      </h3>

      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('news.analysis')}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {summary}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('news.impact')}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {analysis.market_impact.logic}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {analysis.market_impact.affected_markets.map((market, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
              >
                {market}
              </span>
            ))}
          </div>
        </div>
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
