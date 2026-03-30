import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

/**
 * Avatar component with retro pixel aesthetic
 * Chunky bordered avatar with fallback initials
 */
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden',
      'border-[3px] border-ink-700',
      'shadow-[3px_3px_0px_0px_#302818]',
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center',
      'bg-cream-300 font-pixel text-sm font-bold text-ink-800',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

/**
 * Avatar with level badge overlay
 */
interface AvatarWithBadgeProps extends React.ComponentPropsWithoutRef<typeof Avatar> {
  level?: number;
  badgePosition?: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left';
}

const AvatarWithBadge = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  AvatarWithBadgeProps
>(({ className, level, badgePosition = 'bottom-right', children, ...props }, ref) => {
  const positionClasses = {
    'bottom-right': 'bottom-0 right-0 translate-x-1/4 translate-y-1/4',
    'top-right': 'top-0 right-0 translate-x-1/4 -translate-y-1/4',
    'bottom-left': 'bottom-0 left-0 -translate-x-1/4 translate-y-1/4',
    'top-left': 'top-0 left-0 -translate-x-1/4 -translate-y-1/4',
  };

  return (
    <div className="relative inline-flex">
      <Avatar ref={ref} className={className} {...props}>
        {children}
      </Avatar>
      {level !== undefined && (
        <div
          className={cn(
            'absolute flex items-center justify-center',
            'min-w-[20px] h-5 px-1',
            'bg-terracotta-500 border-[2px] border-ink-800',
            'shadow-[2px_2px_0px_0px_#302818]',
            'font-pixel text-[10px] font-bold text-cream-50',
            positionClasses[badgePosition]
          )}
        >
          {level}
        </div>
      )}
    </div>
  );
});
AvatarWithBadge.displayName = 'AvatarWithBadge';

export { Avatar, AvatarImage, AvatarFallback, AvatarWithBadge };
