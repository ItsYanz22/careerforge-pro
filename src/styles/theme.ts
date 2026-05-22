export type ThemePalette = {
  id: string;
  name: string;
  variables: {
    '--primary': string;
    '--primary-foreground': string;
    '--accent': string;
    '--accent-foreground': string;
    '--gradient-start': string;
    '--gradient-middle': string;
    '--gradient-end': string;
    '--glow-color': string;
    '--ring-color': string;
  };
};

export const themePalettes: Record<string, ThemePalette> = {
  emerald: {
    id: 'emerald',
    name: 'Emerald Professional',
    variables: {
      '--primary': '152 69% 31%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '152 40% 94%',
      '--accent-foreground': '152 69% 31%',
      '--gradient-start': '152 69% 31%',
      '--gradient-middle': '152 69% 41%',
      '--gradient-end': '152 69% 66%',
      '--glow-color': '152 69% 31% / 0.2',
      '--ring-color': '152 69% 31%',
    },
  },
  forest: {
    id: 'forest',
    name: 'Forest Minimal',
    variables: {
      '--primary': '142 72% 29%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '142 40% 94%',
      '--accent-foreground': '142 72% 29%',
      '--gradient-start': '142 72% 29%',
      '--gradient-middle': '142 60% 45%',
      '--gradient-end': '142 40% 65%',
      '--glow-color': '142 72% 29% / 0.2',
      '--ring-color': '142 72% 29%',
    },
  },
  gold: {
    id: 'gold',
    name: 'Gold Executive',
    variables: {
      '--primary': '43 74% 49%',
      '--primary-foreground': '0 0% 12%',
      '--accent': '43 40% 94%',
      '--accent-foreground': '43 74% 49%',
      '--gradient-start': '43 74% 49%',
      '--gradient-middle': '43 60% 60%',
      '--gradient-end': '43 80% 75%',
      '--glow-color': '43 74% 49% / 0.2',
      '--ring-color': '43 74% 49%',
    },
  },
  monochrome: {
    id: 'monochrome',
    name: 'Monochrome ATS',
    variables: {
      '--primary': '0 0% 20%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '0 0% 94%',
      '--accent-foreground': '0 0% 20%',
      '--gradient-start': '0 0% 20%',
      '--gradient-middle': '0 0% 40%',
      '--gradient-end': '0 0% 70%',
      '--glow-color': '0 0% 20% / 0.2',
      '--ring-color': '0 0% 20%',
    },
  },
  slate: {
    id: 'slate',
    name: 'Slate & Emerald',
    variables: {
      '--primary': '215 25% 27%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '152 69% 31%',
      '--accent-foreground': '0 0% 100%',
      '--gradient-start': '215 25% 27%',
      '--gradient-middle': '215 20% 40%',
      '--gradient-end': '152 69% 31%',
      '--glow-color': '215 25% 27% / 0.2',
      '--ring-color': '215 25% 27%',
    },
  },
  sapphire: {
    id: 'sapphire',
    name: 'Sapphire Blue',
    variables: {
      '--primary': '217 91% 60%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '206 100% 50%',
      '--accent-foreground': '0 0% 100%',
      '--gradient-start': '217 91% 60%',
      '--gradient-middle': '212 97% 46%',
      '--gradient-end': '206 100% 50%',
      '--glow-color': '217 91% 60% / 0.2',
      '--ring-color': '217 91% 60%',
    },
  },
  violet: {
    id: 'violet',
    name: 'Violet Dream',
    variables: {
      '--primary': '280 85% 44%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '280 100% 80%',
      '--accent-foreground': '280 85% 44%',
      '--gradient-start': '280 85% 44%',
      '--gradient-middle': '260 95% 54%',
      '--gradient-end': '240 100% 66%',
      '--glow-color': '280 85% 44% / 0.2',
      '--ring-color': '280 85% 44%',
    },
  },
  rose: {
    id: 'rose',
    name: 'Rose Modern',
    variables: {
      '--primary': '355 86% 61%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '355 100% 84%',
      '--accent-foreground': '355 86% 61%',
      '--gradient-start': '355 86% 61%',
      '--gradient-middle': '333 81% 59%',
      '--gradient-end': '1 84% 60%',
      '--glow-color': '355 86% 61% / 0.2',
      '--ring-color': '355 86% 61%',
    },
  },
  teal: {
    id: 'teal',
    name: 'Teal Aqua',
    variables: {
      '--primary': '162 95% 44%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '162 100% 86%',
      '--accent-foreground': '162 95% 44%',
      '--gradient-start': '162 95% 44%',
      '--gradient-middle': '174 100% 42%',
      '--gradient-end': '186 100% 46%',
      '--glow-color': '162 95% 44% / 0.2',
      '--ring-color': '162 95% 44%',
    },
  },
};

export const globalTheme = {
  typography: {
    fonts: {
      inter: 'Inter, sans-serif',
      manrope: 'Manrope, sans-serif',
      plusJakarta: '"Plus Jakarta Sans", sans-serif',
      roboto: 'Roboto, sans-serif',
      openSans: '"Open Sans", sans-serif',
      poppins: 'Poppins, sans-serif',
      lora: 'Lora, serif',
      merriweather: 'Merriweather, serif'
    }
  },
  spacing: {
    compact: {
      lineHeight: 1.3,
      sectionSpacing: '12px',
      paragraphSpacing: '4px',
    },
    balanced: {
      lineHeight: 1.5,
      sectionSpacing: '20px',
      paragraphSpacing: '8px',
    },
    spacious: {
      lineHeight: 1.7,
      sectionSpacing: '28px',
      paragraphSpacing: '12px',
    }
  }
};

export type GlobalTheme = typeof globalTheme;
