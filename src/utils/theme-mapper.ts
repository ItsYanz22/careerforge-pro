import { FontType, ThemeType, SpacingConfig } from '../types';

export const getThemeColors = (theme: ThemeType = 'emerald') => {
  const themes: Record<string, { primary: string, background: string, text: string }> = {
    // Green Collection
    emerald: { primary: '#10b981', background: '#ecfdf5', text: '#064e3b' },
    forest: { primary: '#16a34a', background: '#f0fdf4', text: '#14532d' },
    sage: { primary: '#8A9A5B', background: '#f8f9f5', text: '#2c331d' },
    mint: { primary: '#34d399', background: '#f0fdfa', text: '#065f46' },
    olive: { primary: '#65a30d', background: '#f7fee7', text: '#3f6212' },
    
    // Neutral Collection
    monochrome: { primary: '#18181b', background: '#f4f4f5', text: '#000000' },
    graphite: { primary: '#3f3f46', background: '#fafafa', text: '#27272a' },
    warmstone: { primary: '#78716c', background: '#fafaf9', text: '#44403c' },
    softivory: { primary: '#d6d3d1', background: '#fffbeb', text: '#57534e' },
    midnight: { primary: '#0f172a', background: '#f8fafc', text: '#020617' },
    
    // Luxury Collection
    gold: { primary: '#d97706', background: '#fffbeb', text: '#78350f' },
    deepemerald: { primary: '#047857', background: '#ecfdf5', text: '#022c22' },
    platinum: { primary: '#9ca3af', background: '#f9fafb', text: '#374151' },
    charcoal: { primary: '#334155', background: '#f8fafc', text: '#0f172a' },
    pearl: { primary: '#e2e8f0', background: '#ffffff', text: '#334155' },

    // Modern Startup Collection
    moderngreen: { primary: '#14b8a6', background: '#f0fdfa', text: '#134e4a' },
    slateemerald: { primary: '#0ea5e9', background: '#f0f9ff', text: '#0c4a6e' },
    darksage: { primary: '#4d7c0f', background: '#f7fee7', text: '#3f6212' },
    frostedmint: { primary: '#6ee7b7', background: '#ecfdf5', text: '#064e3b' },
    matteforest: { primary: '#15803d', background: '#f0fdf4', text: '#14532d' },

    // Legacy
    light: { primary: '#3b82f6', background: '#eff6ff', text: '#1e3a8a' },
    dark: { primary: '#8b5cf6', background: '#f5f3ff', text: '#4c1d95' },
    professional: { primary: '#0f172a', background: '#f8fafc', text: '#020617' },
    creative: { primary: '#ec4899', background: '#fdf2f8', text: '#831843' },
    minimalist: { primary: '#52525b', background: '#fafafa', text: '#18181b' },
  };
  return themes[theme] || themes.emerald;
};

export const getFontFamily = (font: FontType = 'inter') => {
  const fonts: Record<string, string> = {
    // Modern Professional
    inter: 'Inter, sans-serif',
    manrope: 'Manrope, sans-serif',
    plusjakarta: '"Plus Jakarta Sans", sans-serif',
    satoshi: 'Satoshi, sans-serif',
    generalsans: '"General Sans", sans-serif',
    
    // Corporate
    roboto: 'Roboto, sans-serif',
    opensans: '"Open Sans", sans-serif',
    lato: 'Lato, sans-serif',
    sourcesanspro: '"Source Sans Pro", sans-serif',
    ibmplexsans: '"IBM Plex Sans", sans-serif',
    
    // Elegant
    merriweather: 'Merriweather, serif',
    playfair: '"Playfair Display", serif',
    lora: 'Lora, serif',
    librebaskerville: '"Libre Baskerville", serif',
    cormorant: '"Cormorant Garamond", serif',
    
    // Creative
    poppins: 'Poppins, sans-serif',
    montserrat: 'Montserrat, sans-serif',
    outfit: 'Outfit, sans-serif',
    urbanist: 'Urbanist, sans-serif',
    spacegrotesk: '"Space Grotesk", sans-serif',
  };
  return fonts[font as keyof typeof fonts] || fonts.inter;
};

export const getSpacingStyles = (spacing?: SpacingConfig) => {
  const defaultSpacing = {
    lineHeight: 1.5,
    padding: '32px',
    gap: '20px',
    bulletGap: '8px',
  };

  if (!spacing) return defaultSpacing;

  return {
    lineHeight: spacing.lineHeight === 'compact' ? 1.3 : spacing.lineHeight === 'spacious' ? 1.7 : 1.5,
    padding: spacing.margins?.top || '32px',
    gap: spacing.sectionGap || '20px',
    bulletGap: spacing.bulletPointGap || '8px',
  };
};
