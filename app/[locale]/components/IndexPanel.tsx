'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { IndexData } from '@/lib/types/indices'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import chart component (client-side only)
const MiniChart = dynamic(() => import('./MiniChart'), { ssr: false })

// 指数名字翻译映射
const INDEX_NAME_TRANSLATIONS: Record<string, Record<string, string>> = {
  'zh': {
    '中证500': '中证500',
    '上证指数': '上证指数',
    '纳斯达克指数': '纳斯达克指数',
    'CSI 500': '中证500',
    'Shanghai Composite': '上证指数',
    'NASDAQ Composite': '纳斯达克指数'
  },
  'en': {
    '中证500': 'CSI 500',
    '上证指数': 'Shanghai Composite',
    '纳斯达克指数': 'NASDAQ Composite',
    'CSI 500': 'CSI 500',
    'Shanghai Composite': 'Shanghai Composite',
    'NASDAQ Composite': 'NASDAQ Composite'
  }
}

export default function IndexPanel() {
  const t = useTranslations()
  const params = useParams()
  const locale = params?.locale as string || 'zh'
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

  // 翻译指数名字
  const translateIndexName = (name: string): string => {
    return INDEX_NAME_TRANSLATIONS[locale]?.[name] || name
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
                {translateIndexName(index.name)}
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

            {/* Mini Trend Chart */}
            <div className="mt-3 -mx-2">
              <MiniChart
                symbol={index.symbol}
                currentPrice={index.price}
                change={index.change}
              />
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
