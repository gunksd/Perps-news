'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { IndexData } from '@/lib/types/indices'
import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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

// 带 3D 效果的指数卡片组件
function IndexCard3D({ index, locale, t }: { index: IndexData; locale: string; t: any }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePosition({ x, y })
  }

  const handleMouseEnter = () => setIsHovering(true)
  const handleMouseLeave = () => {
    setIsHovering(false)
    setMousePosition({ x: 0, y: 0 })
  }

  const isPositive = index.change >= 0
  const translateIndexName = (name: string): string => {
    return INDEX_NAME_TRANSLATIONS[locale]?.[name] || name
  }

  return (
    <div
      ref={cardRef}
      className="relative group"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '1000px' }}
    >
      <Card
        className={cn(
          "relative overflow-hidden backdrop-blur-sm",
          "transition-all duration-300 ease-out",
          "hover:shadow-2xl hover:shadow-primary/30 dark:hover:shadow-primary/20",
          "border-primary/20 dark:border-primary/30",
          "bg-gradient-to-br from-background via-background to-primary/5",
          isHovering && "scale-[1.02] -translate-y-1"
        )}
        style={{
          transform: isHovering
            ? `rotateX(${(mousePosition.y - 100) / 30}deg) rotateY(${(mousePosition.x - 100) / 30}deg)`
            : 'rotateX(0deg) rotateY(0deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* 光亮效果 - 跟随鼠标 */}
        {isHovering && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle 250px at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.25), transparent 70%)`,
            }}
          />
        )}

        {/* 边框光晕 */}
        <div
          className={cn(
            "absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            "bg-gradient-to-br from-primary/30 via-primary/10 to-primary/30",
            "blur-lg -z-10"
          )}
        />

        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground">
              {translateIndexName(index.name)}
            </h3>
            <span className="text-xs text-muted-foreground">
              {index.symbol}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {index.price.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <span className={cn(
                "font-medium px-2 py-0.5 rounded-md",
                isPositive
                  ? "text-positive bg-positive/10"
                  : "text-negative bg-negative/10"
              )}>
                {index.change >= 0 ? '+' : ''}
                {index.change.toFixed(2)}
              </span>
              <span className={cn(
                "font-medium",
                isPositive ? "text-positive" : "text-negative"
              )}>
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

          {/* 底部光条效果 */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-all duration-500",
              "bg-gradient-to-r from-transparent via-primary to-transparent"
            )}
            style={{
              transform: 'translateZ(10px)',
            }}
          />

          <div className="mt-3 text-xs text-muted-foreground">
            {t('indices.realtime')} • {new Date(index.timestamp).toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function IndexPanel() {
  const t = useTranslations()
  const params = useParams()
  const locale = params?.locale as string || 'zh'
  const [indices, setIndices] = useState<IndexData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIndices()
    // 指数数据从新浪API实时获取，但有浏览器缓存，降低轮询频率
    const interval = setInterval(fetchIndices, 300000) // 每5分钟刷新（降低从1分钟）
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

  if (loading) {
    return (
      <Card className="p-6 border-primary/20">
        <p className="text-center text-muted-foreground">{t('loading')}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        {t('indices.title')}
      </h2>

      <div className="space-y-3">
        {indices.map((index) => (
          <IndexCard3D key={index.symbol} index={index} locale={locale} t={t} />
        ))}
      </div>
    </div>
  )
}
