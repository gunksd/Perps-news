'use client'

import { useTranslations } from 'next-intl'
import { IndexData } from '@/lib/types/indices'
import { useEffect, useState } from 'react'

export default function IndexPanel() {
  const t = useTranslations()
  const [indices, setIndices] = useState<IndexData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIndices()
    const interval = setInterval(fetchIndices, 60000) // 每分钟刷新
    return () => clearInterval(interval)
  }, [])

  const fetchIndices = async () => {
    try {
      const response = await fetch('/api/indices')
      if (response.ok) {
        const data = await response.json()
        setIndices(data)
      }
    } catch (error) {
      console.error('Failed to fetch indices:', error)
    } finally {
      setLoading(false)
    }
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-positive'
    if (change < 0) return 'text-negative'
    return 'text-neutral'
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">{t('loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        {t('indices.title')}
      </h2>

      <div className="space-y-3">
        {indices.map((index) => (
          <div
            key={index.symbol}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {index.name}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {index.symbol}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {index.price.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <span className={`font-medium ${getChangeColor(index.change)}`}>
                  {index.change >= 0 ? '+' : ''}
                  {index.change.toFixed(2)}
                </span>
                <span className={`font-medium ${getChangeColor(index.changePercent)}`}>
                  {index.changePercent >= 0 ? '+' : ''}
                  {index.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
              {t('indices.realtime')} • {new Date(index.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
