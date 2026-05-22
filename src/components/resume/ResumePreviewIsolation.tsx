import { ReactNode } from 'react';

interface ResumePreviewContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * ResumePreviewContainer
 *
 * Completely isolates the resume preview from the app's dark mode and theme system.
 * The resume must ALWAYS render as a white-background, black-text document
 * regardless of whether the dashboard is in dark mode.
 *
 * Strategy:
 * 1. Override all CSS custom properties to force light-mode values
 * 2. Set color-scheme: light to prevent browser dark-mode overrides
 * 3. Use !important-equivalent inline styles to beat specificity
 * 4. The .dark class on <html> does NOT affect elements with explicit inline styles
 */
export function ResumePreviewContainer({ children, className = '' }: ResumePreviewContainerProps) {
  return (
    <div
      data-resume-preview="true"
      className={`resume-preview-root ${className}`}
      style={{
        // Force light-mode CSS variable values — overrides .dark { --background: ... }
        '--background': '0 0% 100%',
        '--foreground': '0 0% 4%',
        '--card': '0 0% 100%',
        '--card-foreground': '0 0% 4%',
        '--popover': '0 0% 100%',
        '--popover-foreground': '0 0% 4%',
        '--secondary': '0 0% 96%',
        '--secondary-foreground': '0 0% 10%',
        '--muted': '0 0% 94%',
        '--muted-foreground': '0 0% 40%',
        '--border': '0 0% 88%',
        '--input': '0 0% 92%',
        // Force light color scheme — prevents browser from applying dark overrides
        colorScheme: 'light',
        // Explicit background/color to override any inherited dark styles
        backgroundColor: 'hsl(0 0% 96%)',
        color: 'hsl(0 0% 4%)',
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export function useResumePreviewContext(): boolean {
  if (typeof window === 'undefined') return false;
  return document.querySelector('[data-resume-preview="true"]') !== null;
}
