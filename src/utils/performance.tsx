import React, { Suspense, LazyExoticComponent, ReactNode } from 'react'
import { initializeWebVitals } from '@hooks/usePerformanceMonitoring'

// Re-export initializeWebVitals for convenience
export { initializeWebVitals }

// Loading fallback component
export const PerformanceLoadingFallback: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  </div>
)

// Error boundary for lazy loaded components
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive">Something went wrong</h3>
              <p className="mt-2 text-muted-foreground">{this.state.error?.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Reload page
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

// Higher-order component for lazy loading with Suspense
export function withLazyLoading<P extends Record<string, any> = {}>(
  Component: LazyExoticComponent<React.ComponentType<any>>,
  loadingMessage = 'Loading...',
  fallback?: ReactNode
) {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Suspense fallback={<PerformanceLoadingFallback message={loadingMessage} />}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}

// Wrap lazy components with Suspense
export function wrapWithSuspense(
  Component: LazyExoticComponent<any>,
  loadingMessage = 'Loading...'
) {
  return (
    <Suspense fallback={<PerformanceLoadingFallback message={loadingMessage} />}>
      <Component />
    </Suspense>
  )
}

// Performance optimization: memoize expensive components
export function withMemo<P extends Record<string, any> = {}>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return React.memo(Component, propsAreEqual)
}

// Use callback to memoize functions
export { useCallback, useMemo, memo as withComponentMemo } from 'react'

// Bundle size analyzer helper (dev only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = document.querySelectorAll('script[src]')
    
    scripts.forEach((script) => {
      const src = script.getAttribute('src')
      if (src) {
        console.log(`Script: ${src}`)
      }
    })
    
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]')
    stylesheets.forEach((sheet) => {
      const href = sheet.getAttribute('href')
      if (href) {
        console.log(`Stylesheet: ${href}`)
      }
    })
  }
}

// Image optimization helper
export interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
  className?: string
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  loading = 'lazy',
  className,
}) => {
  const [imageSrc, setImageSrc] = React.useState<string>(src)
  const [isLoading, setIsLoading] = React.useState(true)

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    // Fallback to placeholder on error
    setImageSrc('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="rgba(0,0,0,0.5)" font-size="16" dy="10.5" x="50%25" y="50%25" text-anchor="middle"%3EImage not found%3C/text%3E%3C/svg%3E')
    setIsLoading(false)
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      onLoad={handleImageLoad}
      onError={handleImageError}
      className={`${className} ${isLoading ? 'opacity-0 transition-opacity' : 'opacity-100 transition-opacity'}`}
      style={{ transitionDuration: '0.3s' }}
    />
  )
}

// Request idle callback polyfill
export const scheduleIdleTask = (callback: () => void) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback)
  } else {
    setTimeout(callback, 0)
  }
}

// Intersection Observer for lazy rendering
export function useIntersectionObserver(ref: React.RefObject<HTMLElement>) {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [ref])

  return isVisible
}

