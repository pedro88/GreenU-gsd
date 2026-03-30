import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Alert component with retro pixel aesthetic
 * Inline message boxes with icon and variant styles
 */
const alertVariants = cva(
  'relative w-full p-4 flex gap-3',
  {
    variants: {
      variant: {
        default: 'bg-cream-100 border-[3px] border-ink-600',
        success: 'bg-forest-100 border-[3px] border-forest-600',
        warning: 'bg-cream-300 border-[3px] border-terracotta-600',
        danger: 'bg-terracotta-100 border-[3px] border-terracotta-600',
        info: 'bg-ink-100 border-[3px] border-ink-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
}

/**
 * Alert icon component
 */
const AlertIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex-shrink-0 w-6 h-6 flex items-center justify-center',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
AlertIcon.displayName = 'AlertIcon';

/**
 * Alert content component
 */
const AlertContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1 space-y-1', className)}
    {...props}
  />
));
AlertContent.displayName = 'AlertContent';

/**
 * Alert title component
 */
const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h4
    ref={ref}
    className={cn(
      'font-pixel text-sm font-bold uppercase tracking-wider',
      className
    )}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

/**
 * Alert description component
 */
const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('font-body text-sm', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        alertVariants({ variant }),
        'shadow-[3px_3px_0px_0px_#302818]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Alert.displayName = 'Alert';

/**
 * Pre-built alert variants with icons
 */
const SuccessAlert = React.forwardRef<
  HTMLDivElement,
  Omit<AlertProps, 'variant' | 'icon'>
>(({ className, ...props }, ref) => (
  <Alert
    ref={ref}
    variant="success"
    className={className}
    icon={
      <svg
        className="w-5 h-5 text-forest-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="square" d="M9 12l2 2 4-4" />
        <path strokeLinecap="square" d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.12 0 4.07.74 5.62 1.98" />
      </svg>
    }
    {...props}
  />
));
SuccessAlert.displayName = 'SuccessAlert';

const WarningAlert = React.forwardRef<
  HTMLDivElement,
  Omit<AlertProps, 'variant' | 'icon'>
>(({ className, ...props }, ref) => (
  <Alert
    ref={ref}
    variant="warning"
    className={className}
    icon={
      <svg
        className="w-5 h-5 text-terracotta-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="square" d="M12 9v2m0 4h.01M12 3l9.5 16.5H2.5L12 3z" />
      </svg>
    }
    {...props}
  />
));
WarningAlert.displayName = 'WarningAlert';

const DangerAlert = React.forwardRef<
  HTMLDivElement,
  Omit<AlertProps, 'variant' | 'icon'>
>(({ className, ...props }, ref) => (
  <Alert
    ref={ref}
    variant="danger"
    className={className}
    icon={
      <svg
        className="w-5 h-5 text-terracotta-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="square" d="M18 6L6 18M6 6l12 12" />
      </svg>
    }
    {...props}
  />
));
DangerAlert.displayName = 'DangerAlert';

const InfoAlert = React.forwardRef<
  HTMLDivElement,
  Omit<AlertProps, 'variant' | 'icon'>
>(({ className, ...props }, ref) => (
  <Alert
    ref={ref}
    variant="info"
    className={className}
    icon={
      <svg
        className="w-5 h-5 text-ink-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="square" d="M12 8v4m0 4h.01M12 3v2m0 14v2m6-2h-2M6 12H4m14-4h-2m-4 14h-2M12 6V4m0 14v2" />
      </svg>
    }
    {...props}
  />
));
InfoAlert.displayName = 'InfoAlert';

export {
  Alert,
  AlertIcon,
  AlertContent,
  AlertTitle,
  AlertDescription,
  alertVariants,
  SuccessAlert,
  WarningAlert,
  DangerAlert,
  InfoAlert,
};
