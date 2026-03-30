import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Textarea component with retro pixel aesthetic
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block font-pixel text-xs font-semibold text-ink-600 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            'flex min-h-[120px] w-full resize-y',
            'px-4 py-3',
            'bg-cream-100 border-[3px] border-ink-700',
            'shadow-[inset_2px_2px_0px_0px_#E8DFD0,inset_-1px_-1px_0px_0px_#5C4B26]',
            'font-body text-sm text-ink-900 placeholder:text-ink-400',
            'focus:outline-none focus:border-ink-800 focus:shadow-[inset_3px_3px_0px_0px_#E8DFD0,inset_-1px_-1px_0px_0px_#5C4B26]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-75',
            error && 'border-terracotta-500 focus:border-terracotta-600',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="font-body text-xs text-terracotta-600">{error}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
