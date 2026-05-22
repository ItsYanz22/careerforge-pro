import { FontConfig, FontType } from '@types';

export const FONTS: Record<FontType, FontConfig> = {
  inter: {
    name: 'Inter',
    id: 'inter',
    family: 'Inter, sans-serif',
    googleFontName: 'Inter',
    isPremium: false,
  },
  manrope: {
    name: 'Manrope',
    id: 'manrope',
    family: 'Manrope, sans-serif',
    googleFontName: 'Manrope',
    isPremium: false,
  },
  plusjakarta: {
    name: 'Plus Jakarta Sans',
    id: 'plusjakarta',
    family: 'Plus Jakarta Sans, sans-serif',
    googleFontName: 'Plus+Jakarta+Sans',
    isPremium: false,
  },
  satoshi: {
    name: 'Satoshi',
    id: 'satoshi',
    family: 'Satoshi, sans-serif',
    isPremium: true,
  },
  generalsans: {
    name: 'General Sans',
    id: 'generalsans',
    family: 'General Sans, sans-serif',
    isPremium: true,
  },
  roboto: {
    name: 'Roboto',
    id: 'roboto',
    family: 'Roboto, sans-serif',
    googleFontName: 'Roboto',
    isPremium: false,
  },
  opensans: {
    name: 'Open Sans',
    id: 'opensans',
    family: 'Open Sans, sans-serif',
    googleFontName: 'Open+Sans',
    isPremium: false,
  },
  lato: {
    name: 'Lato',
    id: 'lato',
    family: 'Lato, sans-serif',
    googleFontName: 'Lato',
    isPremium: false,
  },
  sourcesanspro: {
    name: 'Source Sans Pro',
    id: 'sourcesanspro',
    family: 'Source Sans Pro, sans-serif',
    googleFontName: 'Source+Sans+Pro',
    isPremium: false,
  },
  ibmplexsans: {
    name: 'IBM Plex Sans',
    id: 'ibmplexsans',
    family: 'IBM Plex Sans, sans-serif',
    googleFontName: 'IBM+Plex+Sans',
    isPremium: false,
  },
  merriweather: {
    name: 'Merriweather',
    id: 'merriweather',
    family: 'Merriweather, serif',
    googleFontName: 'Merriweather',
    isPremium: true,
  },
  playfair: {
    name: 'Playfair Display',
    id: 'playfair',
    family: 'Playfair Display, serif',
    googleFontName: 'Playfair+Display',
    isPremium: true,
  },
  lora: {
    name: 'Lora',
    id: 'lora',
    family: 'Lora, serif',
    googleFontName: 'Lora',
    isPremium: true,
  },
  librebaskerville: {
    name: 'Libre Baskerville',
    id: 'librebaskerville',
    family: 'Libre Baskerville, serif',
    googleFontName: 'Libre+Baskerville',
    isPremium: true,
  },
  cormorant: {
    name: 'Cormorant Garamond',
    id: 'cormorant',
    family: 'Cormorant Garamond, serif',
    googleFontName: 'Cormorant+Garamond',
    isPremium: true,
  },
  poppins: {
    name: 'Poppins',
    id: 'poppins',
    family: 'Poppins, sans-serif',
    googleFontName: 'Poppins',
    isPremium: false,
  },
  montserrat: {
    name: 'Montserrat',
    id: 'montserrat',
    family: 'Montserrat, sans-serif',
    googleFontName: 'Montserrat',
    isPremium: false,
  },
  outfit: {
    name: 'Outfit',
    id: 'outfit',
    family: 'Outfit, sans-serif',
    googleFontName: 'Outfit',
    isPremium: true,
  },
  urbanist: {
    name: 'Urbanist',
    id: 'urbanist',
    family: 'Urbanist, sans-serif',
    googleFontName: 'Urbanist',
    isPremium: true,
  },
  spacegrotesk: {
    name: 'Space Grotesk',
    id: 'spacegrotesk',
    family: 'Space Grotesk, sans-serif',
    googleFontName: 'Space+Grotesk',
    isPremium: true,
  },
};

export const FONT_SIZES = {
  heading: '16px',
  subheading: '14px',
  body: '11px',
  caption: '10px',
};

export const FONT_WEIGHTS = {
  normal: 400,
  semibold: 600,
  bold: 700,
};

export default FONTS;
