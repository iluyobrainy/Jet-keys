// components/ui/performance-monitor.tsx
"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Activity, Clock, Zap, Database } from 'lucide-react'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  networkLatency: number
  cacheHitRate: number
  errorRate: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    cacheHitRate: 0,
    errorRate: 0,
  })

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const measurePerformance = () => {
      const newMetrics: PerformanceMetrics = {
        loadTime: 0,
        renderTime: 0,
        memoryUsage: 0,
        networkLatency: 0,
        cacheHitRate: 0,
        errorRate: 0,
      }

      // Measure page load time
      if (performance.timing) {
        newMetrics.loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
      }

      // Measure memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory
        newMetrics.memoryUsage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      }

      // Measure network latency
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        newMetrics.networkLatency = navigation.responseEnd - navigation.requestStart
      }

      // Calculate cache hit rate (mock data for now)
      newMetrics.cacheHitRate = Math.random() * 100

      // Calculate error rate (mock data for now)
      newMetrics.errorRate = Math.random() * 5

      setMetrics(newMetrics)
    }

    measurePerformance()

    // Update metrics every 5 seconds
    const interval = setInterval(measurePerformance, 5000)

    return () => clearInterval(interval)
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const getPerformanceColor = (value: number, type: 'loadTime' | 'memory' | 'latency' | 'cache' | 'error') => {
    switch (type) {
      case 'loadTime':
        return value < 1000 ? 'bg-green-500' : value < 3000 ? 'bg-yellow-500' : 'bg-red-500'
      case 'memory':
        return value < 50 ? 'bg-green-500' : value < 80 ? 'bg-yellow-500' : 'bg-red-500'
      case 'latency':
        return value < 200 ? 'bg-green-500' : value < 500 ? 'bg-yellow-500' : 'bg-red-500'
      case 'cache':
        return value > 80 ? 'bg-green-500' : value > 60 ? 'bg-yellow-500' : 'bg-red-500'
      case 'error':
        return value < 1 ? 'bg-green-500' : value < 3 ? 'bg-yellow-500' : 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <Activity className="h-4 w-4" />
      </button>

      {isVisible && (
        <Card className="w-80 mt-2 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance Monitor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span className="text-xs">Load Time</span>
              </div>
              <Badge className={`text-xs ${getPerformanceColor(metrics.loadTime, 'loadTime')}`}>
                {metrics.loadTime.toFixed(0)}ms
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3" />
                <span className="text-xs">Memory</span>
              </div>
              <Badge className={`text-xs ${getPerformanceColor(metrics.memoryUsage, 'memory')}`}>
                {metrics.memoryUsage.toFixed(1)}%
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-3 w-3" />
                <span className="text-xs">Network</span>
              </div>
              <Badge className={`text-xs ${getPerformanceColor(metrics.networkLatency, 'latency')}`}>
                {metrics.networkLatency.toFixed(0)}ms
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3" />
                <span className="text-xs">Cache Hit</span>
              </div>
              <Badge className={`text-xs ${getPerformanceColor(metrics.cacheHitRate, 'cache')}`}>
                {metrics.cacheHitRate.toFixed(1)}%
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3" />
                <span className="text-xs">Error Rate</span>
              </div>
              <Badge className={`text-xs ${getPerformanceColor(metrics.errorRate, 'error')}`}>
                {metrics.errorRate.toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}




