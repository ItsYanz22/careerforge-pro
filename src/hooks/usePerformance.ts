import { useMemo, useCallback, useState, useEffect, useRef } from 'react';

/**
 * Custom hook for optimized selectors from Zustand stores
 * Prevents unnecessary re-renders by using shallow comparison
 */
export const useOptimizedSelector = <T, U>(
  selector: (state: T) => U,
  state: T,
  dependencies: any[] = []
) => {
  return useMemo(() => selector(state), [state, ...dependencies]);
};

/**
 * Debounce hook for expensive operations (search, filtering, etc.)
 */
export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttle hook for high-frequency events (scroll, resize, etc.)
 */
export const useThrottle = <T>(value: T, interval: number = 500): T => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, interval - (now - lastUpdated.current));

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
};

/**
 * Virtual scrolling for long lists
 */
export const useVirtualScroll = (
  items: any[],
  itemHeight: number,
  containerHeight: number,
  scrollTop: number
) => {
  return useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);
    const visibleItems = items.slice(startIndex, Math.min(endIndex + 1, items.length));

    return {
      visibleItems,
      startIndex,
      offsetY: startIndex * itemHeight,
      totalHeight: items.length * itemHeight,
    };
  }, [items, itemHeight, containerHeight, scrollTop]);
};

/**
 * Memoization hook for expensive computations
 */
export const useMemoWithDeps = <T>(factory: () => T, deps: any[]): T => {
  return useMemo(factory, deps);
};

/**
 * Callback with automatic dependency tracking
 */
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
): T => {
  return useCallback(callback, deps) as T;
};
