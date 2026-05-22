/**
 * ThemeContext — thin wrapper around useUIStore.
 * Keeps backward compatibility for components that import useTheme()
 * while ensuring a single source of truth (useUIStore).
 */
import React, { createContext, useContext, useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';
import { globalTheme, themePalettes } from '../styles/theme';

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
    const palette = themePalettes[activeTheme] || themePalettes['emerald'];
    if (palette && palette.variables) {
      Object.entries(palette.variables).forEach(([key, value]) => {
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
