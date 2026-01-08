'use client'

import { useEffect, useRef } from 'react'

interface MiniChartProps {
  symbol: string
  currentPrice: number
  change: number
  height?: number
}

export default function MiniChart({ symbol, currentPrice, change, height = 80 }: MiniChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Generate simulated trend data based on current change
    const dataPoints = 50
    const data: number[] = []
    const basePrice = currentPrice - change // Starting price

    // Create a smooth curve trending towards current price
    for (let i = 0; i < dataPoints; i++) {
      const progress = i / (dataPoints - 1)
      const noise = (Math.random() - 0.5) * Math.abs(change) * 0.3 // Add some noise
      const trend = basePrice + (change * progress) + noise
      data.push(trend)
    }

    // Find min and max for scaling
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    // Draw line
    const color = change >= 0 ? '#10b981' : '#ef4444' // green or red
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()

    data.forEach((value, index) => {
      const x = (index / (dataPoints - 1)) * width
      const y = height - ((value - min) / range) * height

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Fill area under the line with gradient
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()

    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    if (change >= 0) {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)')
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0)')
    } else {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.2)')
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)')
    }

    ctx.fillStyle = gradient
    ctx.fill()

  }, [currentPrice, change])

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={height}
      className="w-full"
      style={{ display: 'block' }}
    />
  )
}
