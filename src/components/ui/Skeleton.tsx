import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Skeleton loading components with retro pixel aesthetic
 * Animated pixel-style loading placeholders
 */
const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'text' | 'circular' | 'rectangular';
    shimmer?: boolean;
  }
>(({ className, variant = 'rectangular', shimmer = true, ...props }, ref) => {
  const variantClasses = {
    text: 'h-4 rounded-none',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'bg-ink-200 border-[2px] border-ink-300',
        variantClasses[variant],
        shimmer && 'animate-pulse',
        shimmer && 'bg-gradient-to-r',
        shimmer && 'bg-[length:200%_100%]',
        shimmer && 'animate-[shimmer_1.5s_ease-in-out_infinite]',
        className
      )}
      style={
        shimmer
          ? {
              backgroundImage:
                'linear-gradient(90deg, #E8DFD0 25%, #D4C5A9 50%, #E8DFD0 75%)',
            }
          : undefined
      }
      {...props}
    />
  );
});
Skeleton.displayName = 'Skeleton';

/**
 * Skeleton for card component
 */
const SkeletonCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'p-4 space-y-3',
      'bg-cream-50 border-[3px] border-ink-300',
      'shadow-[5px_5px_0px_0px_#D4C5A9]',
      className
    )}
    {...props}
  >
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
));
SkeletonCard.displayName = 'SkeletonCard';

/**
 * Skeleton for avatar with name
 */
const SkeletonUser = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-3', className)}
    {...props}
  >
    <Skeleton variant="circular" className="h-10 w-10" />
    <div className="space-y-2 flex-1">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
));
SkeletonUser.displayName = 'SkeletonUser';

/**
 * Skeleton for list item
 */
const SkeletonListItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-3 p-2', className)}
    {...props}
  >
    <Skeleton variant="circular" className="h-8 w-8" />
    <div className="space-y-1.5 flex-1">
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
    <Skeleton className="h-6 w-12" />
  </div>
));
SkeletonListItem.displayName = 'SkeletonListItem';

/**
 * Skeleton grid for multiple items
 */
interface SkeletonGridProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  columns?: number;
}

const SkeletonGrid = React.forwardRef<
  HTMLDivElement,
  SkeletonGridProps
>(({ className, count = 6, columns = 3, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      `grid gap-4`,
      columns === 1 && 'grid-cols-1',
      columns === 2 && 'grid-cols-1 sm:grid-cols-2',
      columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      columns === 4 && 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
      className
    )}
    {...props}
  >
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
));
SkeletonGrid.displayName = 'SkeletonGrid';

export { Skeleton, SkeletonCard, SkeletonUser, SkeletonListItem, SkeletonGrid };
