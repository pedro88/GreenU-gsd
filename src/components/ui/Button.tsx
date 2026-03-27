import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

/**
 * Retro pixel-style button matching the Sega/SNES era aesthetic.
 * Chunky borders, offset shadow, press effect on click.
 * @param root0 - destructured props
 * @param root0.variant - Color variant (primary=orange, secondary=green, ghost=cream, danger=red)
 * @param root0.size - Size (sm, md, lg)
 * @param root0.loading - Shows a pixel blinking cursor when true
 * @param root0.className - Additional CSS classes
 * @param root0.children - Button content
 * @param root0.disabled - Whether the button is disabled
 * @returns The retro button JSX
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = {
    primary: 'btn-pixel-primary',
    secondary: 'btn-pixel-secondary',
    ghost: 'btn-pixel-ghost',
    danger: 'btn-pixel-primary',
  }[variant];

  const sizeClass = {
    sm: 'btn-pixel-sm',
    md: '',
    lg: 'text-base px-7 py-3.5',
  }[size];

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`btn-pixel ${variantClass} ${sizeClass} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-2 h-3 bg-current animate-pixel-blink" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
