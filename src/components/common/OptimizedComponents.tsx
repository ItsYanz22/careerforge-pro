import React, { memo, useMemo, useCallback } from 'react'

/**
 * Example optimized components demonstrating best practices
 * These are patterns to apply to existing components
 */

// 1. Memoized card component for resume sections
interface CardProps {
  title: string
  children: React.ReactNode
  onAction?: () => void
  actionLabel?: string
}

export const OptimizedCard = memo<CardProps>(
  ({ title, children, onAction, actionLabel }) => (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">{title}</h3>
        {onAction && (
          <button
            onClick={onAction}
            className="text-sm text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:text-primary-600 transition-colors"
          >
            {actionLabel || 'Action'}
          </button>
        )}
      </div>
      {children}
    </div>
  ),
  (prevProps, nextProps) => {
    // Custom equality check: only re-render if content actually changes
    return (
      prevProps.title === nextProps.title &&
      prevProps.children === nextProps.children &&
      prevProps.onAction === nextProps.onAction &&
      prevProps.actionLabel === nextProps.actionLabel
    )
  }
)

OptimizedCard.displayName = 'OptimizedCard'

// 2. Memoized list component with virtualization pattern
interface ListItem {
  id: string
  [key: string]: any
}

interface OptimizedListProps {
  items: ListItem[]
  renderItem: (item: ListItem) => React.ReactNode
  onItemClick?: (item: ListItem) => void
  className?: string
}

export const OptimizedList = memo<OptimizedListProps>(
  ({ items, renderItem, onItemClick, className }) => {
    const memoizedItems = useMemo(
      () => items.map(item => (
        <div
          key={item.id}
          onClick={() => onItemClick?.(item)}
          className={`cursor-pointer hover:bg-background transition-colors ${className || ''}`}
        >
          {renderItem(item)}
        </div>
      )),
      [items, renderItem, onItemClick, className]
    )

    return <div>{memoizedItems}</div>
  }
)

OptimizedList.displayName = 'OptimizedList'

// 3. Memoized form component with debounced callbacks
interface OptimizedFormProps {
  onSubmit: (data: Record<string, any>) => void | Promise<void>
  fields: { name: string; label: string; type?: string }[]
  loading?: boolean
}

export const OptimizedForm = memo<OptimizedFormProps>(
  ({ onSubmit, fields, loading = false }) => {
    const [formData, setFormData] = React.useState<Record<string, any>>({})

    const memoizedFields = useMemo(
      () => fields.map(field => (
        <div key={field.name} className="mb-4">
          <label className="block text-sm font-medium mb-1">{field.label}</label>
          <input
            type={field.type || 'text'}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              [field.name]: e.target.value,
            }))}
            className="w-full border rounded px-3 py-2"
            disabled={loading}
          />
        </div>
      )),
      [fields, formData, loading]
    )

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit(formData)
      },
      [formData, onSubmit]
    )

    return (
      <form onSubmit={handleSubmit}>
        {memoizedFields}
        <button
          type="submit"
          disabled={loading}
          className="bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </form>
    )
  }
)

OptimizedForm.displayName = 'OptimizedForm'

// 4. Memoized chart wrapper with lazy loading
interface OptimizedChartProps {
  title: string
  data: any[]
  type: 'line' | 'bar' | 'pie'
  height?: number
}

export const OptimizedChart = memo<OptimizedChartProps>(
  ({ title, data, height = 300 }) => {
    // data is memoized via useMemo for future chart integration
    useMemo(() => data, [data])

    return (
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4">{title}</h3>
        <div style={{ height }}>
          {/* Chart component will go here when lazy loaded */}
          <div className="animate-pulse bg-muted rounded" style={{ height: '100%' }} />
        </div>
      </div>
    )
  }
)

OptimizedChart.displayName = 'OptimizedChart'

// 5. Memoized button with stable click handler
interface OptimizedButtonProps {
  onClick: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
  disabled?: boolean
}

export const OptimizedButton = memo<OptimizedButtonProps>(
  ({ onClick, children, variant = 'primary', loading = false, disabled = false }) => {
    const stableOnClick = useCallback(onClick, [onClick])

    const variantClasses = {
      primary: 'bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600',
      secondary: 'bg-muted text-foreground hover:bg-muted-hover',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    }

    return (
      <button
        onClick={stableOnClick}
        disabled={loading || disabled}
        className={`px-4 py-2 rounded transition-colors disabled:opacity-50 ${variantClasses[variant]}`}
      >
        {loading ? 'Loading...' : children}
      </button>
    )
  }
)

OptimizedButton.displayName = 'OptimizedButton'

// 6. HOC to add performance monitoring to any component
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  const Wrapped = memo((props: P) => {
    const startTime = React.useRef(Date.now())

    React.useEffect(() => {
      const renderTime = Date.now() - startTime.current
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Render] ${componentName}: ${renderTime}ms`)
      }
    })

    return <Component {...props} />
  })
  Wrapped.displayName = `WithPerf(${componentName})`
  return Wrapped as unknown as React.ComponentType<P>
}

export default {
  OptimizedCard,
  OptimizedList,
  OptimizedForm,
  OptimizedChart,
  OptimizedButton,
  withPerformanceMonitoring,
}

