import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

/**
 * Progress bar component with retro pixel aesthetic
 * Segmented pixel-style progress indicator
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-6 w-full overflow-hidden',
      'bg-ink-100 border-[3px] border-ink-700',
      'shadow-[inset_2px_2px_0px_0px_#5C4B26,inset_-1px_-1px_0px_0px_#B09158]',
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        'h-full transition-all duration-300',
        'bg-gradient-to-r from-forest-500 to-forest-400',
        'shadow-[inset_2px_2px_0px_0px_#1A661A,inset_-1px_-1px_0px_0px_#78BF78]'
      )}
      style={{ width: `${value || 0}%` }}
    />
    {/* Pixel grid overlay for retro effect */}
    <div 
      className="absolute inset-0 pointer-events-none opacity-10"
      style={{
        backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 7px, #302818 7px, #302818 8px)',
      }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

/**
 * Progress bar with label showing percentage
 */
interface ProgressWithLabelProps extends React.ComponentPropsWithoutRef<typeof Progress> {
  label?: string;
  showPercentage?: boolean;
}

const ProgressWithLabel = React.forwardRef<
  React.ElementRef<typeof Progress>,
  ProgressWithLabelProps
>(({ className, value, label, showPercentage = true, ...props }, ref) => {
  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="font-pixel text-xs font-semibold text-ink-700 uppercase tracking-wider">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="font-pixel text-xs font-bold text-ink-800">
              {Math.round(value || 0)}%
            </span>
          )}
        </div>
      )}
      <Progress ref={ref} value={value} {...props} />
    </div>
  );
});
ProgressWithLabel.displayName = 'ProgressWithLabel';

export { Progress, ProgressWithLabel };
