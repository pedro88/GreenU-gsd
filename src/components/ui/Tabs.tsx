import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

/**
 * Tabs component with retro pixel aesthetic
 * Pixel-bordered tabs with inset active state
 */
const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex items-center gap-1 p-1',
      'bg-ink-100 border-[3px] border-ink-700',
      'shadow-[inset_2px_2px_0px_0px_#5C4B26,inset_-1px_-1px_0px_0px_#D4C5A9]',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center',
      'px-4 py-2',
      'font-pixel text-xs font-semibold uppercase tracking-wider',
      'text-ink-600',
      'border-[2px] border-transparent',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:bg-cream-50 data-[state=active]:border-ink-700',
      'data-[state=active]:text-ink-900 data-[state=active]:shadow-[2px_2px_0px_0px_#302818]',
      'hover:text-ink-800',
      'transition-all duration-75',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-3 p-4',
      'bg-cream-50 border-[3px] border-ink-700',
      'shadow-[5px_5px_0px_0px_#302818]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500',
      'data-[state=active]:animate-in data-[state=inactive]:animate-out',
      'data-[state=active]:fade-in-0 data-[state=inactive]:fade-out-0',
      'data-[state=active]:slide-in-from-top-1 data-[state=inactive]:slide-out-to-top-1',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
