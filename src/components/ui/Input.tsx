import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Retro pixel-style text input with inset shadow and chunky border.
 * @param root0 - destructured props
 * @param root0.label - Label text displayed above the input
 * @param root0.error - Error message displayed below the input
 * @param root0.className - Additional CSS classes
 * @returns The retro input JSX
 */
export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="pixel-label">{label}</label>}
      <input {...props} className={`pixel-input ${className}`} />
      {error && (
        <p className="mt-1 font-pixel text-xs text-terracotta-700 font-semibold tracking-wide">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Retro pixel-style textarea with inset shadow and chunky border.
 * @param root0 - destructured props
 * @param root0.label - Label text displayed above the textarea
 * @param root0.error - Error message displayed below
 * @param root0.className - Additional CSS classes
 * @returns The retro textarea JSX
 */
export function Textarea({
  label,
  error,
  className = '',
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  return (
    <div className="w-full">
      {label && <label className="pixel-label">{label}</label>}
      <textarea {...props} className={`pixel-input resize-none min-h-[80px] ${className}`} />
      {error && (
        <p className="mt-1 font-pixel text-xs text-terracotta-700 font-semibold tracking-wide">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Retro pixel-style select dropdown with inset shadow and chunky border.
 * @param root0 - destructured props
 * @param root0.label - Label text displayed above the select
 * @param root0.error - Error message displayed below
 * @param root0.className - Additional CSS classes
 * @param root0.children - Select options
 * @returns The retro select JSX
 */
export function Select({
  label,
  error,
  className = '',
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }) {
  return (
    <div className="w-full">
      {label && <label className="pixel-label">{label}</label>}
      <select {...props} className={`pixel-input cursor-pointer ${className}`}>
        {children}
      </select>
      {error && (
        <p className="mt-1 font-pixel text-xs text-terracotta-700 font-semibold tracking-wide">
          {error}
        </p>
      )}
    </div>
  );
}
