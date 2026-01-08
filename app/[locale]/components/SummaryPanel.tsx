'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

interface Summary {
  index: string
  timestamp: string
  period: string
  short_term: {
    direction: string
    logic: string
  }
  medium_term: {
    direction: string
    logic: string
  }
  confidence: number
}

export default function SummaryPanel() {
  const t = useTranslations()
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummaries()
    const interval = setInterval(fetchSummaries, 300000) // 每5分钟刷新
    return () => clearInterval(interval)
  }, [])

  const fetchSummaries = async () => {
    try {
      const response = await fetch('/api/summary')
      if (response.ok) {
        const data = await response.json()
        setSummaries(data)
      }
    } catch (error) {
      console.error('Failed to fetch summaries:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDirectionColor = (direction: string) => {
    if (direction === '偏多' || direction === 'Bullish') return 'text-positive'
    if (direction === '偏空' || direction === 'Bearish') return 'text-negative'
    return 'text-neutral'
  }

  const getDirectionBg = (direction: string) => {
    if (direction === '偏多' || direction === 'Bullish') return 'bg-green-100 dark:bg-green-900/30 text-positive'
    if (direction === '偏空' || direction === 'Bearish') return 'bg-red-100 dark:bg-red-900/30 text-negative'
    return 'bg-gray-100 dark:bg-gray-800 text-neutral'
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">{t('loading')}</p>
      </div>
    )
  }

  if (summaries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {t('summary.title', { defaultValue: '今日市场总结' })}
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400">
          {t('summary.empty', { defaultValue: '暂无市场总结' })}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        {t('summary.title', { defaultValue: '今日市场总结' })}
      </h2>

      <div className="space-y-3">
        {summaries.map((summary, index) => (
          <div
            key={`${summary.index}-${index}`}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {summary.index}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {summary.period}
              </span>
            </div>

            {/* 短期影响 */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('summary.short_term', { defaultValue: '短期影响' })}:
                </span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${getDirectionBg(summary.short_term.direction)}`}>
                  {summary.short_term.direction}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {summary.short_term.logic}
              </p>
            </div>

            {/* 中期影响 */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('summary.medium_term', { defaultValue: '中期影响' })}:
                </span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${getDirectionBg(summary.medium_term.direction)}`}>
                  {summary.medium_term.direction}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {summary.medium_term.logic}
              </p>
            </div>

            {/* 置信度 */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{t('summary.confidence', { defaultValue: '置信度' })}:</span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${summary.confidence * 100}%` }}
                />
              </div>
              <span>{(summary.confidence * 100).toFixed(0)}%</span>
            </div>

            <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              {t('summary.generated_at', { defaultValue: '生成于' })} {new Date(summary.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
