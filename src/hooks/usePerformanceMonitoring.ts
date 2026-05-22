import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
  FCP: number | null // First Contentful Paint
  LCP: number | null // Largest Contentful Paint
  CLS: number | null // Cumulative Layout Shift
  FID: number | null // First Input Delay
  TTFB: number | null // Time to First Byte
  renderTime: number
}

export const usePerformanceMonitoring = (componentName: string) => {
  const startTimeRef = useRef<number>(Date.now())
  const metricsRef = useRef<PerformanceMetrics>({
    FCP: null,
    LCP: null,
    CLS: null,
    FID: null,
    TTFB: null,
    renderTime: 0,
  })

  useEffect(() => {
    const calculateMetrics = () => {
      // Get navigation timing
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paintEntries = performance.getEntriesByType('paint')

      // FCP (First Contentful Paint)
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
      if (fcpEntry) {
        metricsRef.current.FCP = Math.round(fcpEntry.startTime)
      }

      // TTFB (Time to First Byte)
      if (navTiming) {
        metricsRef.current.TTFB = Math.round(navTiming.responseStart - navTiming.fetchStart)
      }

      // Render time
      const renderTime = Date.now() - startTimeRef.current
      metricsRef.current.renderTime = renderTime

      // Log metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName}:`, {
          FCP: metricsRef.current.FCP,
          TTFB: metricsRef.current.TTFB,
          renderTime: `${renderTime}ms`,
        })
      }

      // Send to analytics in production
      if (process.env.NODE_ENV === 'production' && navigator.sendBeacon) {
        try {
          navigator.sendBeacon('/api/analytics/performance', JSON.stringify({
            component: componentName,
            metrics: metricsRef.current,
            timestamp: new Date().toISOString(),
          }))
        } catch (err) {
          console.error('Failed to send performance metrics:', err)
        }
      }
    }

    // Use requestIdleCallback for non-blocking measurement
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => calculateMetrics())
    } else {
      setTimeout(calculateMetrics, 0)
    }
  }, [componentName])

  return metricsRef.current
}

// Web Vitals monitoring using PerformanceObserver
export const initializeWebVitals = () => {
  try {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        const lcp = Math.round(lastEntry.startTime)
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Web Vitals] LCP: ${lcp}ms`)
        }
      })
      
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

      // CLS (Cumulative Layout Shift)
      const clsObserver = new PerformanceObserver((entryList) => {
        let clsValue = 0
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Web Vitals] CLS: ${clsValue.toFixed(3)}`)
        }
      })
      
      clsObserver.observe({ type: 'layout-shift', buffered: true })

      // FID (First Input Delay)
      const fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const fid = (entry as any).processingDuration
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Web Vitals] FID: ${Math.round(fid)}ms`)
          }
        }
      })
      
      fidObserver.observe({ type: 'first-input', buffered: true })
    }
  } catch (error) {
    console.error('Error initializing web vitals:', error)
  }
}
