import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, label, error, id, ...props }, ref) => {
  const inputId = id || props.name;
  
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block font-pixel text-xs font-semibold uppercase tracking-widest text-ink-700">
          {label}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        className={cn(
          'flex h-10 w-full px-3 py-2 font-body text-sm text-ink-900',
          'bg-cream-50 border-[3px] border-ink-700',
          'shadow-[inset_2px_2px_0px_0px_#B09158,inset_-1px_-1px_0px_0px_#5C4B26]',
          'placeholder:text-ink-600',
          'focus:outline-none focus:border-terracotta-500 focus:shadow-[inset_2px_2px_0px_0px_#FF5526,inset_-1px_-1px_0px_0px_#CC3310]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-75',
          error && 'border-terracotta-600 focus:border-terracotta-700',
          className
        )}
        ref={ref}
        {...props}
      />
      {error && typeof error === 'string' && (
        <p className="font-body text-xs text-terracotta-600">{error}</p>
      )}
    </div>
  );
});
Input.displayName = 'Input';

export { Input };