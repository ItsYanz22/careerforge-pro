/**
 * Comprehensive Multi-Theme System
 * Defines all available theme palettes with semantic tokens
 * These tokens are mapped to CSS variables in globals.css
 */

export interface ThemePalette {
  id: string;
  label: string;
  description?: string;
  // Light mode HSL values
  primary_light: string;       // Main accent color (light)
  primary_dark: string;        // Main accent color (dark)
  accent_light: string;        // Secondary accent (light)
  accent_dark: string;         // Secondary accent (dark)
  muted_light: string;         // Muted accent (light)
  muted_dark: string;          // Muted accent (dark)
}

export const THEME_PALETTES: Record<string, ThemePalette> = {
  emerald: {
    id: 'emerald',
    label: 'Emerald',
    description: 'Vibrant green - our signature color',
    primary_light: '152 69% 31%',      // #059669
    primary_dark: '152 60% 42%',       // #34d399
    accent_light: '152 40% 94%',       // Light emerald bg
    accent_dark: '152 30% 14%',        // Dark emerald bg
    muted_light: '152 69% 66%',        // Lighter emerald
    muted_dark: '152 60% 52%',         // Lighter emerald dark
  },
  
  forest: {
    id: 'forest',
    label: 'Forest',
    description: 'Deep forest green',
    primary_light: '152 77% 34%',      // #166534
    primary_dark: '152 66% 45%',       // Lighter in dark mode
    accent_light: '152 49% 92%',       // Light forest accent
    accent_dark: '152 35% 16%',        // Dark forest accent
    muted_light: '152 67% 60%',        // Muted forest light
    muted_dark: '152 55% 50%',         // Muted forest dark
  },
  
  sage: {
    id: 'sage',
    label: 'Sage',
    description: 'Soft sage green',
    primary_light: '156 22% 42%',      // #4d7c5f
    primary_dark: '156 30% 55%',       // Lighter sage dark
    accent_light: '156 15% 90%',       // Light sage accent
    accent_dark: '156 20% 20%',        // Dark sage accent
    muted_light: '156 20% 65%',        // Muted sage light
    muted_dark: '156 25% 45%',         // Muted sage dark
  },
  
  slate: {
    id: 'slate',
    label: 'Slate',
    description: 'Professional slate gray',
    primary_light: '215 28% 37%',      // #334155
    primary_dark: '215 32% 60%',       // Lighter slate dark
    accent_light: '215 18% 92%',       // Light slate accent
    accent_dark: '215 22% 18%',        // Dark slate accent
    muted_light: '215 25% 65%',        // Muted slate light
    muted_dark: '215 30% 45%',         // Muted slate dark
  },
  
  graphite: {
    id: 'graphite',
    label: 'Graphite',
    description: 'Modern dark gray',
    primary_light: '0 0% 32%',         // #525252
    primary_dark: '0 0% 70%',          // Lighter graphite dark
    accent_light: '0 0% 90%',          // Light graphite accent
    accent_dark: '0 0% 20%',           // Dark graphite accent
    muted_light: '0 0% 60%',           // Muted graphite light
    muted_dark: '0 0% 50%',            // Muted graphite dark
  },
  
  blue: {
    id: 'blue',
    label: 'Blue',
    description: 'Professional blue',
    primary_light: '217 91% 60%',      // #3b82f6
    primary_dark: '217 92% 76%',       // Lighter blue dark
    accent_light: '217 100% 94%',      // Light blue accent
    accent_dark: '217 90% 25%',        // Dark blue accent
    muted_light: '217 89% 75%',        // Muted blue light
    muted_dark: '217 88% 55%',         // Muted blue dark
  },
  
  amber: {
    id: 'amber',
    label: 'Amber',
    description: 'Warm amber gold',
    primary_light: '38 92% 50%',       // #f59e0b
    primary_dark: '38 96% 65%',        // Lighter amber dark
    accent_light: '38 100% 92%',       // Light amber accent
    accent_dark: '38 88% 25%',         // Dark amber accent
    muted_light: '38 90% 70%',         // Muted amber light
    muted_dark: '38 92% 52%',          // Muted amber dark
  },
  
  indigo: {
    id: 'indigo',
    label: 'Indigo',
    description: 'Deep indigo',
    primary_light: '226 100% 55%',     // #6366f1
    primary_dark: '226 100% 72%',      // Lighter indigo dark
    accent_light: '226 100% 94%',      // Light indigo accent
    accent_dark: '226 100% 25%',       // Dark indigo accent
    muted_light: '226 99% 72%',        // Muted indigo light
    muted_dark: '226 98% 55%',         // Muted indigo dark
  },

  rose: {
    id: 'rose',
    label: 'Rose',
    description: 'Elegant rose',
    primary_light: '356 100% 64%',     // #f43f5e
    primary_dark: '356 100% 77%',      // Lighter rose dark
    accent_light: '356 100% 94%',      // Light rose accent
    accent_dark: '356 100% 28%',       // Dark rose accent
    muted_light: '356 99% 75%',        // Muted rose light
    muted_dark: '356 98% 62%',         // Muted rose dark
  },

  teal: {
    id: 'teal',
    label: 'Teal',
    description: 'Vibrant teal',
    primary_light: '180 100% 35%',     // #0891b2
    primary_dark: '180 100% 60%',      // Lighter teal dark
    accent_light: '180 100% 92%',      // Light teal accent
    accent_dark: '180 100% 18%',       // Dark teal accent
    muted_light: '180 99% 65%',        // Muted teal light
    muted_dark: '180 98% 48%',         // Muted teal dark
  },
};

export const DEFAULT_THEME = 'emerald';

export type ThemePaletteId = keyof typeof THEME_PALETTES;
