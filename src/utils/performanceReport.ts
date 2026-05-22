/**
 * Performance Report Generator
 * Analyzes and generates performance metrics reports
 */

export interface PerformanceReport {
  timestamp: string
  metrics: {
    FCP?: number
    LCP?: number
    CLS?: number
    FID?: number
    TTFB?: number
    renderTime: number
    bundleSize: {
      total: number
      main: number
      vendors: number
      chunks: Record<string, number>
    }
  }
  status: 'good' | 'needs-improvement' | 'poor'
  recommendations: string[]
  score: number // 0-100
}

export class PerformanceReportGenerator {
  private metrics: Map<string, any> = new Map()

  addMetric(key: string, value: number) {
    this.metrics.set(key, value)
  }

  addBundleSize(sizes: Record<string, number>) {
    this.metrics.set('bundleSize', sizes)
  }

  generateReport(): PerformanceReport {
    const report: PerformanceReport = {
      timestamp: new Date().toISOString(),
      metrics: {
        renderTime: this.metrics.get('renderTime') || 0,
        bundleSize: this.metrics.get('bundleSize') || {
          total: 0,
          main: 0,
          vendors: 0,
          chunks: {},
        },
      },
      status: 'good',
      recommendations: [],
      score: 100,
    }

    // Analyze metrics
    if (this.metrics.has('FCP')) {
      report.metrics.FCP = this.metrics.get('FCP')
      if (report.metrics.FCP! > 1800) {
        report.recommendations.push('FCP is slow. Consider optimizing critical rendering path')
        report.score -= 10
      }
    }

    if (this.metrics.has('LCP')) {
      report.metrics.LCP = this.metrics.get('LCP')
      if (report.metrics.LCP! > 2500) {
        report.recommendations.push('LCP is slow. Optimize largest contentful paint element')
        report.score -= 15
      }
    }

    if (this.metrics.has('CLS')) {
      report.metrics.CLS = this.metrics.get('CLS')
      if (report.metrics.CLS! > 0.1) {
        report.recommendations.push('High layout shift detected. Add size constraints to elements')
        report.score -= 10
      }
    }

    // Check bundle size
    if (report.metrics.bundleSize.total > 500) {
      report.recommendations.push('Total bundle size > 500KB. Consider code splitting and lazy loading')
      report.score -= 20
    }

    // Determine overall status
    if (report.score >= 85) {
      report.status = 'good'
    } else if (report.score >= 70) {
      report.status = 'needs-improvement'
    } else {
      report.status = 'poor'
    }

    return report
  }

  displayReport(report: PerformanceReport): void {
    console.log('\n' + '='.repeat(50))
    console.log('📊 PERFORMANCE REPORT')
    console.log('='.repeat(50))
    console.log(`Timestamp: ${report.timestamp}`)
    console.log(`Status: ${report.status.toUpperCase()}`)
    console.log(`Score: ${report.score}/100\n`)

    console.log('📈 Metrics:')
    if (report.metrics.FCP) console.log(`  • FCP: ${report.metrics.FCP}ms`)
    if (report.metrics.LCP) console.log(`  • LCP: ${report.metrics.LCP}ms`)
    if (report.metrics.CLS) console.log(`  • CLS: ${report.metrics.CLS}`)
    if (report.metrics.FID) console.log(`  • FID: ${report.metrics.FID}ms`)
    if (report.metrics.TTFB) console.log(`  • TTFB: ${report.metrics.TTFB}ms`)
    console.log(`  • Render Time: ${report.metrics.renderTime}ms`)

    console.log('\n📦 Bundle Size:')
    console.log(`  • Total: ${(report.metrics.bundleSize.total / 1024).toFixed(2)}KB`)
    console.log(`  • Main: ${(report.metrics.bundleSize.main / 1024).toFixed(2)}KB`)
    console.log(`  • Vendors: ${(report.metrics.bundleSize.vendors / 1024).toFixed(2)}KB`)

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:')
      report.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`)
      })
    }

    console.log('\n' + '='.repeat(50) + '\n')
  }

  exportAsJSON(report: PerformanceReport): string {
    return JSON.stringify(report, null, 2)
  }

  exportAsCSV(reports: PerformanceReport[]): string {
    const headers = ['Timestamp', 'Status', 'Score', 'FCP', 'LCP', 'CLS', 'Bundle Size (KB)', 'Render Time (ms)']
    const rows = reports.map(r => [
      r.timestamp,
      r.status,
      r.score,
      r.metrics.FCP || 'N/A',
      r.metrics.LCP || 'N/A',
      r.metrics.CLS || 'N/A',
      (r.metrics.bundleSize.total / 1024).toFixed(2),
      r.metrics.renderTime,
    ])

    return [headers, ...rows]
      .map(row => row.join(','))
      .join('\n')
  }
}

// Singleton instance
export const performanceReporter = new PerformanceReportGenerator()

// Helper function to generate and display report
export function generateAndDisplayPerformanceReport() {
  const report = performanceReporter.generateReport()
  performanceReporter.displayReport(report)
  return report
}
