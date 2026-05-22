import { useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useUIStore } from '../stores/uiStore';
import { THEME_PALETTES, ThemePaletteId } from '../config/themeSystem';

/**
 * Hook: Applies dynamic theme CSS variables based on user's selected theme palette
 * Updates --accent-primary, --accent-secondary, --accent-muted, --accent-glow
 * Supports both light and dark modes
 */
export function useAccentColor() {
  const { preferences } = useSettingsStore();
  const { theme } = useUIStore(); // 'light' | 'dark'

  useEffect(() => {
    const accentColorId = (preferences?.appearance?.accentColor || 'emerald') as ThemePaletteId;
    const palette = THEME_PALETTES[accentColorId];
    
    if (!palette) return;

    const isDarkMode = theme === 'dark';
    const root = document.documentElement;

    // Extract HSL values based on mode
    const primaryHSL = isDarkMode ? palette.primary_dark : palette.primary_light;
    const accentHSL = isDarkMode ? palette.accent_dark : palette.accent_light;
    const mutedHSL = isDarkMode ? palette.muted_dark : palette.muted_light;

    // Apply semantic token CSS variables
    // These variables are used by components via Tailwind's theme configuration
    root.style.setProperty('--accent-primary', primaryHSL);
    root.style.setProperty('--accent-secondary', accentHSL);
    root.style.setProperty('--accent-muted', mutedHSL);
    
    // Glow effect for focus states
    root.style.setProperty('--accent-glow', `${primaryHSL} / 0.2`);

    // Keep data attribute for legacy selectors and debugging
    root.setAttribute('data-accent-color', accentColorId);
    root.setAttribute('data-theme-mode', isDarkMode ? 'dark' : 'light');

  }, [preferences?.appearance?.accentColor, theme]);
}
