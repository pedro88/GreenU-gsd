import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Badge component with retro pixel aesthetic
 * Compact, chunked borders, offset shadows
 */
const badgeVariants = cva(
  'inline-flex items-center font-pixel text-xs font-semibold border-[2px] border-ink-700 shadow-[2px_2px_0px_0px_#302818] transition-all duration-75',
  {
    variants: {
      variant: {
        default: 'bg-cream-500 text-ink-900',
        primary: 'bg-terracotta-500 text-cream-50',
        secondary: 'bg-forest-500 text-cream-50',
        success: 'bg-forest-400 text-cream-50',
        warning: 'bg-cream-400 text-ink-900',
        danger: 'bg-terracotta-600 text-cream-50',
        outline: 'bg-transparent text-ink-700 border-ink-600',
        ghost: 'bg-ink-100 text-ink-700',
      },
      size: {
        default: 'px-2 py-0.5',
        sm: 'px-1.5 py-0.5 text-[10px]',
        lg: 'px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };