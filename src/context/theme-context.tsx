/**
 * ThemeContext — thin wrapper around useUIStore.
 * Keeps backward compatibility for components that import useTheme()
 * while ensuring a single source of truth (useUIStore).
 */
import React, { createContext, useContext, useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';
import { globalTheme, themePalettes } from '../styles/theme';
import { THEME_PALETTES } from '../config/themeSystem';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextProps {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  theme: typeof globalTheme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme, activeTheme } = useUIStore();

  // Sync dark class and apply theme palette on every render and when dependencies change
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply dark/light class
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }

    // Apply the active theme palette CSS variables
    // First, try to get from the comprehensive THEME_PALETTES (supports all colors)
    let palette = THEME_PALETTES[activeTheme] || THEME_PALETTES['emerald'];
    
    // If using comprehensive palette, map to CSS variables
    if (palette) {
      const isDarkMode = theme === 'dark';
      const primaryColor = isDarkMode ? palette.primary_dark : palette.primary_light;
      const accentColor = isDarkMode ? palette.accent_dark : palette.accent_light;
      const mutedColor = isDarkMode ? palette.muted_dark : palette.muted_light;
      
      root.style.setProperty('--primary', primaryColor);
      root.style.setProperty('--primary-foreground', '0 0% 100%');
      root.style.setProperty('--accent', accentColor);
      root.style.setProperty('--accent-foreground', primaryColor);
      root.style.setProperty('--btn-primary-bg', primaryColor);
      root.style.setProperty('--btn-primary-hover-bg', isDarkMode ? palette.primary_light : palette.primary_dark);
      root.style.setProperty('--btn-primary-text', '0 0% 100%');
    }
    
    // Also apply from theme.ts if available for backward compatibility
    const legacyPalette = themePalettes[activeTheme];
    if (legacyPalette && legacyPalette.variables) {
      Object.entries(legacyPalette.variables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
    
    // Force reflow to ensure changes are applied
    void root.offsetHeight;
  }, [theme, activeTheme]);

  const setMode = (mode: ThemeMode) => {
    if (mode === 'dark' && theme !== 'dark') toggleTheme();
    if (mode === 'light' && theme !== 'light') toggleTheme();
    // 'system' — detect preference
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark && theme !== 'dark') toggleTheme();
      if (!prefersDark && theme !== 'light') toggleTheme();
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        mode: theme as ThemeMode,
        setMode,
        theme: globalTheme,
        isDark: theme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
