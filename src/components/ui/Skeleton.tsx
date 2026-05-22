import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

/**
 * Shimmer skeleton for loading states.
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', width, height }) => (
  <div
    className={`skeleton ${className}`}
    style={{ width, height }}
  />
);

/** Resume card skeleton */
export const ResumeCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-card rounded-2xl border border-border dark:border-border overflow-hidden">
    <Skeleton className="h-32 w-full rounded-none" />
    <div className="p-5 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 flex-1 rounded-xl" />
        <Skeleton className="h-8 flex-1 rounded-xl" />
      </div>
    </div>
  </div>
);

/** Dashboard stats skeleton */
export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-card rounded-2xl border border-border dark:border-border p-6 flex items-center gap-4">
    <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
    <div className="space-y-2 flex-1">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-6 w-16" />
    </div>
  </div>
);

/** Subscription plan card skeleton */
export const PlanCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-card rounded-2xl border border-border dark:border-border p-8 space-y-4">
    <Skeleton className="h-5 w-20" />
    <Skeleton className="h-8 w-24" />
    <div className="space-y-2 pt-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded-full flex-shrink-0" />
          <Skeleton className="h-3 flex-1" />
        </div>
      ))}
    </div>
    <Skeleton className="h-10 w-full rounded-xl mt-4" />
  </div>
);

/** ATS score skeleton */
export const ATSSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-6">
      <Skeleton className="w-24 h-24 rounded-full flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
    {[1, 2, 3].map((i) => (
      <div key={i} className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    ))}
  </div>
);

export default Skeleton;
