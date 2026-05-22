import { forwardRef } from 'react';
import logoImg from '../../assets/logo.jpg';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'horizontal' | 'vertical';
  showText?: boolean;
}

const sizeMap = {
  sm: { img: 'w-6 h-6', text: 'text-sm' },
  md: { img: 'w-8 h-8', text: 'text-base' },
  lg: { img: 'w-10 h-10', text: 'text-lg' },
  xl: { img: 'w-14 h-14', text: 'text-xl' },
};

export const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ className = '', size = 'md', variant = 'icon', showText }, ref) => {
    const s = sizeMap[size];

    const imgEl = (
      <img
        src={logoImg}
        alt="CareerForge Pro"
        className={`${s.img} rounded-xl object-cover shadow-soft flex-shrink-0 transition-all duration-200`}
        onError={(e) => {
          // Fallback to SVG mark if image fails
          const target = e.currentTarget as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement | null;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
    );

    const fallbackEl = (
      <div
        style={{ display: 'none' }}
        className={`${s.img} rounded-xl flex items-center justify-center flex-shrink-0 shadow-soft bg-[hsl(var(--primary))] dark:bg-[hsl(var(--primary))]`}
      >
        <svg viewBox="0 0 24 24" className="w-2/3 h-2/3 text-[hsl(var(--primary-foreground))]" fill="currentColor">
          <path d="M3 17L12 6L21 17" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="6" r="1.5" fill="currentColor" />
        </svg>
      </div>
    );

    if (variant === 'icon') {
      return (
        <div ref={ref} className={`flex-shrink-0 ${className}`}>
          {imgEl}
          {fallbackEl}
        </div>
      );
    }

    if (variant === 'horizontal') {
      return (
        <div ref={ref} className={`flex items-center gap-2.5 flex-shrink-0 ${className}`}>
          {imgEl}
          {fallbackEl}
          <span className={`font-bold tracking-tight whitespace-nowrap text-foreground ${s.text}`}>
            CareerForge Pro
          </span>
        </div>
      );
    }

    if (variant === 'vertical') {
      return (
        <div ref={ref} className={`flex flex-col items-center gap-2 ${className}`}>
          {imgEl}
          {fallbackEl}
          <span className={`font-bold tracking-tight text-center text-foreground ${s.text}`}>
            CareerForge
          </span>
        </div>
      );
    }

    return null;
  }
);

Logo.displayName = 'Logo';
