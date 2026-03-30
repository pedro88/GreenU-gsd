import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-pixel text-sm font-semibold tracking-wider uppercase transition-all duration-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-[3px] border-ink-800 text-ink-900 shadow-pixel hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#302818] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
        primary: 'border-[3px] border-ink-800 bg-terracotta-500 text-cream-50 shadow-pixel hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#302818] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
        secondary: 'border-[3px] border-ink-800 bg-forest-500 text-cream-50 shadow-pixel hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#302818] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
        ghost: 'border-[3px] border-ink-700 bg-cream-100 text-ink-800 shadow-pixel-sm hover:bg-cream-200 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#302818] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
        danger: 'border-[3px] border-ink-800 bg-terracotta-600 text-cream-50 shadow-pixel hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#302818] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
        outline: 'border-[3px] border-ink-700 bg-transparent text-ink-800 shadow-pixel-sm hover:bg-cream-100 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
      },
      size: {
        default: 'h-10 px-5 py-2.5',
        sm: 'h-8 px-3 py-1.5 text-xs shadow-pixel-sm',
        lg: 'h-12 px-7 py-3.5 text-base shadow-[4px_4px_0px_0px_#302818]',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }), loading && 'animate-pulse')}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-2 h-3 bg-current animate-pixel-blink" />
          Loading...
        </span>
      ) : (
        children
      )}
    </Comp>
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };