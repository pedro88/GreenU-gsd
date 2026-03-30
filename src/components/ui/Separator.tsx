import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

/**
 * Separator component with retro pixel aesthetic
 * Chunky pixel-style divider line
 */
const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = 'horizontal', decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-ink-300',
        orientation === 'horizontal' ? 'h-[3px] w-full' : 'h-full w-[3px]',
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

/**
 * Decorative separator with pixel dots
 */
const SeparatorWithDots = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: 'horizontal' | 'vertical';
    dotCount?: number;
  }
>(({ className, orientation = 'horizontal', dotCount = 5, ...props }, ref) => {
  if (orientation === 'horizontal') {
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2', className)}
        {...props}
      >
        <div className="h-[2px] flex-1 bg-ink-300" />
        <div className="flex gap-2">
          {Array.from({ length: dotCount }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-ink-400"
              style={{ transform: 'rotate(45deg)' }}
            />
          ))}
        </div>
        <div className="h-[2px] flex-1 bg-ink-300" />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn('flex flex-col items-center gap-2', className)}
      {...props}
    >
      <div className="w-[2px] flex-1 bg-ink-300" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: dotCount }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 bg-ink-400"
            style={{ transform: 'rotate(45deg)' }}
          />
        ))}
      </div>
      <div className="w-[2px] flex-1 bg-ink-300" />
    </div>
  );
});
SeparatorWithDots.displayName = 'SeparatorWithDots';

export { Separator, SeparatorWithDots };
