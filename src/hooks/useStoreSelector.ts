import React from 'react'
import { useShallow } from 'zustand/react/shallow'

/**
 * Zustand selector memoization hook
 * 
 * Usage:
 * const selectedData = useStoreSelector(resumeStore, (state) => state.selectedResume)
 * const { title, sections } = useStoreSelector(resumeStore, (state) => ({
 *   title: state.title,
 *   sections: state.sections,
 * }), { shallow: true })
 */

interface SelectorOptions {
  shallow?: boolean
  equalityFn?: (a: any, b: any) => boolean
}

/**
 * Hook for memoized store selectors with support for shallow comparison
 * Prevents unnecessary re-renders when store values haven't actually changed
 */
export function useStoreSelector<T, U>(
  store: any,
  selector: (state: T) => U,
  options?: SelectorOptions
) {
  if (options?.shallow) {
    // Use Zustand's built-in shallow comparison
    return store(useShallow(selector))
  }

  if (options?.equalityFn) {
    return store(selector, options.equalityFn)
  }

  // Default: use strict equality
  return store(selector)
}

/**
 * Create a memoized selector from a store
 * Returns a function that can be used directly with the store
 */
export function createMemoSelector<T, U>(selector: (state: T) => U) {
  let prev: U | undefined
  let prevProps: T | undefined

  return (state: T) => {
    if (prev === undefined || state !== prevProps) {
      prev = selector(state)
      prevProps = state
    }
    return prev
  }
}

/**
 * Batch multiple store subscriptions to prevent cascading updates
 */
export function useBatchStoreSelector<T>(store: any, selectors: Record<string, (state: T) => any>) {
  const result: Record<string, any> = {}

  for (const [key, selector] of Object.entries(selectors)) {
    result[key] = store(selector)
  }

  return result
}

/**
 * Debounced store selector - prevents rapid re-renders from store updates
 */
export function useDebouncedStoreSelector<T, U>(
  store: any,
  selector: (state: T) => U,
  debounceMs = 300
) {
  const [value, setValue] = React.useState<U | undefined>()

  React.useEffect(() => {
    const unsubscribe = store.subscribe(
      (state: T) => selector(state),
      (newValue: U) => {
        // Debounced update
        const timeout = setTimeout(() => setValue(newValue), debounceMs)
        return () => clearTimeout(timeout)
      }
    )

    return () => unsubscribe()
  }, [store, selector, debounceMs])

  return value
}
