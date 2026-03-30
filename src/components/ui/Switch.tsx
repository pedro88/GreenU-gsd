import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

/**
 * Switch (Toggle) component with retro pixel aesthetic
 * Chunky pill-shaped toggle with pixel slider
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center',
      'border-[3px] border-ink-700',
      'shadow-[3px_3px_0px_0px_#302818]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2',
      'focus-visible:ring-offset-cream-50',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=unchecked]:bg-cream-200',
      'data-[state=checked]:bg-forest-500',
      'transition-all duration-75',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'pointer-events-none h-4 w-4',
        'bg-cream-50 border-[2px] border-ink-700',
        'shadow-[2px_2px_0px_0px_#302818]',
        'data-[state=unchecked]:translate-x-0.5',
        'data-[state=checked]:translate-x-[22px]',
        'flex items-center justify-center',
        'transition-all duration-75',
        '[&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-forest-600'
      )}
    >
      <SwitchPrimitive.Thumb asChild>
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="hidden data-[state=checked]:block text-cream-50"
        >
          <rect x="4" y="4" width="16" height="16" rx="0" />
        </svg>
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Thumb>
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
