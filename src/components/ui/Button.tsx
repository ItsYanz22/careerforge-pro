import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion, HTMLMotionProps } from 'framer-motion';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  icon?:     React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[hsl(var(--btn-primary-bg))] hover:bg-[hsl(var(--btn-primary-hover-bg))] ' +
    'text-[hsl(var(--btn-primary-text))] shadow-soft hover:shadow-accent ' +
    'active:bg-[hsl(var(--btn-primary-active-bg))]',
  secondary:
    'bg-[hsl(var(--btn-secondary-bg))] hover:bg-[hsl(var(--btn-secondary-hover-bg))] ' +
    'text-[hsl(var(--btn-secondary-text))] ' +
    'active:bg-[hsl(var(--btn-secondary-active-bg))]',
  ghost:
    'bg-[hsl(var(--btn-ghost-bg))] hover:bg-[hsl(var(--btn-ghost-hover-bg))] ' +
    'text-[hsl(var(--btn-ghost-text))] border border-[hsl(var(--btn-ghost-border))] ' +
    'active:bg-[hsl(var(--btn-ghost-active-bg))]',
  outline:
    'bg-transparent border border-[hsl(var(--border))] hover:bg-[hsl(var(--btn-ghost-hover-bg))] ' +
    'text-[hsl(var(--foreground))] ' +
    'active:bg-[hsl(var(--btn-ghost-active-bg))]',
  danger:
    'bg-[hsl(var(--btn-danger-bg))] hover:bg-[hsl(var(--btn-danger-hover-bg))] ' +
    'text-[hsl(var(--btn-danger-text))] shadow-soft ' +
    'active:bg-[hsl(var(--btn-danger-bg))]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 h-7',
  md: 'px-4 py-2   text-sm gap-2   h-9',
  lg: 'px-5 py-2.5 text-sm gap-2   h-11',
};

/**
 * Reusable Button component.
 * All variants use rounded-xl, subtle shadows, and smooth hover transitions.
 * Supports loading state, left/right icons, and full-width layout.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconRight,
      children,
      fullWidth = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? {} : { scale: 1.02 }}
        whileTap={isDisabled ? {} : { scale: 0.97 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center font-semibold rounded-xl',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/40 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
        ) : icon ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}

        {children && <span>{children}</span>}

        {!loading && iconRight && (
          <span className="flex-shrink-0">{iconRight}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
