import { lazy } from 'react'
import { withLazyLoading } from '@utils/performance'

// Lazy load all modal components for performance
const AICoachModalLazy = lazy(() => import('@components/ai/AICoachModal').then(m => ({ default: m.AICoachModal })))
const JobMatcherLazy = lazy(() => import('@components/ai/JobMatcher').then(m => ({ default: m.JobMatcher })))
const AnalyticsDashboardLazy = lazy(() => import('@components/dashboard/AnalyticsDashboard'))
const ShareModalLazy = lazy(() => import('@components/resume/ShareModal'))
const ExportButtonLazy = lazy(() => import('@components/export/ExportButton').then(m => ({ default: m.ExportButton })))

// Export with Suspense boundaries
export const AICoachModalWithSuspense = withLazyLoading(
  AICoachModalLazy,
  'Loading AI Coach...'
)

export const JobMatcherWithSuspense = withLazyLoading(
  JobMatcherLazy,
  'Loading Job Matcher...'
)

export const AnalyticsDashboardWithSuspense = withLazyLoading(
  AnalyticsDashboardLazy,
  'Loading Analytics...'
)

export const ShareModalWithSuspense = withLazyLoading(
  ShareModalLazy,
  'Loading Share Options...'
)

export const ExportButtonWithSuspense = withLazyLoading(
  ExportButtonLazy,
  'Loading Export Options...'
)

// Export originals for backward compatibility
export { AICoachModalLazy, JobMatcherLazy, AnalyticsDashboardLazy, ShareModalLazy, ExportButtonLazy }
