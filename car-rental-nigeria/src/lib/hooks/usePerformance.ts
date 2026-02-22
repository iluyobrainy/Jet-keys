// lib/hooks/usePerformance.ts
"use client"

import { useEffect, useCallback } from 'react'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage?: number
  networkLatency?: number
}

export function usePerformance() {
  const measurePerformance = useCallback(() => {
    if (typeof window === 'undefined') return null

    const metrics: PerformanceMetrics = {
      loadTime: 0,
      renderTime: 0,
    }

    // Measure page load time
    if (performance.timing) {
      metrics.loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
    }

    // Measure memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory
      metrics.memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize
    }

    // Measure network latency
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      metrics.networkLatency = navigation.responseEnd - navigation.requestStart
    }

    return metrics
  }, [])

  const logPerformance = useCallback((componentName: string) => {
    const metrics = measurePerformance()
    if (metrics) {
      console.log(`Performance metrics for ${componentName}:`, metrics)
      
      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        // You can integrate with analytics services here
        // Example: analytics.track('performance', { component: componentName, ...metrics })
      }
    }
  }, [measurePerformance])

  const measureRenderTime = useCallback((componentName: string) => {
    const start = performance.now()
    
    return () => {
      const end = performance.now()
      const renderTime = end - start
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`)
      }
      
      return renderTime
    }
  }, [])

  return {
    measurePerformance,
    logPerformance,
    measureRenderTime,
  }
}

// Hook for monitoring component performance
export function useComponentPerformance(componentName: string) {
  const { measureRenderTime, logPerformance } = usePerformance()

  useEffect(() => {
    const endMeasure = measureRenderTime(componentName)
    
    return () => {
      endMeasure()
    }
  }, [componentName, measureRenderTime])

  useEffect(() => {
    logPerformance(componentName)
  }, [componentName, logPerformance])
}




