'use client'

import React, { useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface IndexCardProps {
  name: string
  value: string
  change: string
  changePercent: string
  className?: string
}

export function IndexCard({ name, value, change, changePercent, className }: IndexCardProps) {
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

  const isPositive = parseFloat(change) >= 0

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative group perspective-1000",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Card
        className={cn(
          "relative overflow-hidden",
          "transition-all duration-300 ease-out",
          "hover:shadow-2xl hover:shadow-primary/20",
          "border-primary/20 dark:border-primary/10",
          isHovering && "scale-[1.02] -translate-y-1"
        )}
        style={{
          transform: isHovering
            ? `rotateX(${(mousePosition.y - 100) / 20}deg) rotateY(${(mousePosition.x - 100) / 20}deg)`
            : 'rotateX(0deg) rotateY(0deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* 光亮效果 */}
        {isHovering && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(circle 200px at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15), transparent 80%)`,
            }}
          />
        )}

        {/* 边框光晕 */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            "bg-gradient-to-br from-primary/20 via-transparent to-primary/20",
            "blur-xl -z-10"
          )}
        />

        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                {name}
              </h3>
              <div
                className={cn(
                  "px-2 py-0.5 rounded text-xs font-medium",
                  isPositive
                    ? "bg-positive/10 text-positive dark:bg-positive/20"
                    : "bg-negative/10 text-negative dark:bg-negative/20"
                )}
              >
                {isPositive ? '↑' : '↓'} {changePercent}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-bold tracking-tight">
                {value}
              </div>
              <div
                className={cn(
                  "text-sm font-medium",
                  isPositive ? "text-positive" : "text-negative"
                )}
              >
                {isPositive ? '+' : ''}{change}
              </div>
            </div>

            {/* 3D 深度效果 */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                transform: 'translateZ(10px)',
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
