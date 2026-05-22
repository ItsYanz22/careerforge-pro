/**
 * Performance Configuration
 * Settings for optimizing CareerForge Pro application performance
 */

export const performanceConfig = {
  // Code Splitting
  codeSplitting: {
    enabled: true,
    chunks: {
      vendor: true,
      router: true,
      charts: true,
      animation: true,
      icons: true,
      state: true,
    },
  },

  // Lazy Loading
  lazyLoading: {
    enabled: true,
    modals: true,
    pages: true,
    components: true,
  },

  // Memoization
  memoization: {
    enabled: true,
    components: true,
    selectors: true,
    callbacks: true,
  },

  // Image Optimization
  imageOptimization: {
    enabled: true,
    lazy: true,
    responsive: true,
    webp: true,
  },

  // Performance Monitoring
  monitoring: {
    enabled: process.env.NODE_ENV === 'production',
    trackFCP: true,
    trackLCP: true,
    trackCLS: true,
    trackFID: true,
    trackTTFB: true,
    reportingEndpoint: '/api/analytics/performance',
  },

  // Caching
  caching: {
    enabled: true,
    staleWhileRevalidate: true,
    ttl: {
      resume: 3600, // 1 hour
      job: 1800, // 30 minutes
      analytics: 300, // 5 minutes
      user: 3600, // 1 hour
    },
  },

  // Bundle Analysis
  bundleAnalysis: {
    enabled: process.env.ANALYZE_BUNDLE === 'true',
    visualization: 'treemap', // 'treemap' | 'sunburst' | 'list'
  },

  // Performance Targets (ms)
  targets: {
    FCP: 1800, // First Contentful Paint
    LCP: 2500, // Largest Contentful Paint
    CLS: 0.1, // Cumulative Layout Shift
    FID: 100, // First Input Delay
    TTFB: 600, // Time to First Byte
    pageLoad: 3000, // Total page load
    apiResponse: 1000, // API response time
  },

  // Optimization Levels
  optimizationLevel: process.env.NODE_ENV === 'production' ? 'aggressive' : 'balanced',

  // Feature Flags for A/B Testing
  features: {
    prefetching: true,
    preconnect: true,
    dns_prefetch: true,
    resource_hints: true,
  },
}

// Development-only debugging
export const debugConfig = {
  logPerformanceMetrics: process.env.NODE_ENV === 'development',
  logComponentRenders: process.env.NODE_ENV === 'development',
  logStoreUpdates: process.env.NODE_ENV === 'development',
  logApiCalls: process.env.NODE_ENV === 'development',
  logBundleSize: process.env.NODE_ENV === 'development' && process.env.ANALYZE_BUNDLE === 'true',
  logCacheOperations: process.env.NODE_ENV === 'development',
}

// Get current performance targets
export function getPerformanceTarget(metric: keyof typeof performanceConfig.targets): number {
  return performanceConfig.targets[metric]
}

// Check if metric meets target
export function meetsPerformanceTarget(metric: keyof typeof performanceConfig.targets, value: number): boolean {
  const target = performanceConfig.targets[metric]
  return value <= target
}

// Report performance issue
export function reportPerformanceIssue(
  metric: string,
  value: number,
  target: number,
  context: Record<string, any> = {}
) {
  if (performanceConfig.monitoring.enabled) {
    const issue = {
      metric,
      value,
      target,
      exceeded: value > target,
      excessAmount: value - target,
      severity: value > target * 2 ? 'critical' : value > target * 1.5 ? 'warning' : 'info',
      timestamp: new Date().toISOString(),
      context,
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Performance Issue] ${metric}: ${value}ms (target: ${target}ms)`, issue)
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      navigator.sendBeacon(performanceConfig.monitoring.reportingEndpoint, JSON.stringify(issue))
    }
  }
}
