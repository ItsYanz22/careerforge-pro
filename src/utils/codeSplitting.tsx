import { lazy, Suspense } from 'react';
import { Loader } from 'lucide-react';

/**
 * Loading fallback component
 */
export const LoadingFallback = () => (
  <div className="flex items-center justify-center w-full h-full min-h-96">
    <Loader className="w-8 h-8 animate-spin text-primary-600" />
  </div>
);

/**
 * Lazy-loaded component wrapper with Suspense
 */
export const withSuspense = <P extends object>(
  Component: React.ComponentType<P>,
  fallback = <LoadingFallback />
) => {
  return (props: P) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};

/**
 * Dynamic imports for code splitting
 * These components are loaded on-demand
 */

// AI Coach Modal
export const AICoachModal = lazy(
  () => import('../components/ai/AICoachModal').then(m => ({ default: m.AICoachModal }))
);

// Job Matcher
export const JobMatcher = lazy(
  () => import('../components/ai/JobMatcher').then(m => ({ default: m.JobMatcher }))
);

// Analytics Dashboard
export const AnalyticsDashboard = lazy(
  () => import('../components/dashboard/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard }))
);

/**
 * Performance monitoring utilities
 */
export const performanceMetrics = {
  /**
   * Mark navigation start
   */
  markNavigationStart: (label: string) => {
    if (typeof window !== 'undefined' && window.performance?.mark) {
      window.performance.mark(`${label}-start`);
    }
  },

  /**
   * Mark navigation end and measure time
   */
  markNavigationEnd: (label: string) => {
    if (typeof window !== 'undefined' && window.performance?.measure) {
      try {
        window.performance.measure(label, `${label}-start`);
        const measure = window.performance.getEntriesByName(label)[0];
        console.log(`⏱️  ${label}: ${measure.duration.toFixed(2)}ms`);
      } catch (e) {
        console.error(`Failed to measure ${label}`, e);
      }
    }
  },

  /**
   * Track custom metric
   */
  trackMetric: (name: string, value: number) => {
    if ('sendBeacon' in navigator && typeof window !== 'undefined') {
      try {
        navigator.sendBeacon('/api/analytics/metrics', JSON.stringify({
          name,
          value,
          timestamp: Date.now(),
        }));
      } catch (e) {
        console.error('Failed to send metric', e);
      }
    }
  },
};

/**
 * Image optimization utility
 */
export const optimizedImageConfig = {
  quality: 80,
  format: 'webp',
  sizes: {
    thumbnail: 150,
    small: 300,
    medium: 600,
    large: 1200,
  },

  /**
   * Generate optimized image srcset
   */
  getSrcSet: (path: string) => {
    const sizes = optimizedImageConfig.sizes;
    return `
      ${path}?w=${sizes.small} 300w,
      ${path}?w=${sizes.medium} 600w,
      ${path}?w=${sizes.large} 1200w
    `.trim();
  },

  /**
   * Get next.js style image props
   */
  getImageProps: (src: string, alt: string) => ({
    src,
    alt,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    srcSet: optimizedImageConfig.getSrcSet(src),
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  }),
};
