/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        /* Button semantic tokens */
        'btn-primary-bg': 'hsl(var(--btn-primary-bg))',
        'btn-primary-text': 'hsl(var(--btn-primary-text))',
        'btn-secondary-bg': 'hsl(var(--btn-secondary-bg))',
        'btn-secondary-text': 'hsl(var(--btn-secondary-text))',
        'btn-ghost-bg': 'hsl(var(--btn-ghost-bg))',
        'btn-ghost-text': 'hsl(var(--btn-ghost-text))',
        'btn-muted-bg': 'hsl(var(--btn-muted-bg))',
        'btn-muted-text': 'hsl(var(--btn-muted-text))',
      },
      borderRadius: {
        '2xl': '1rem',
        xl: '0.75rem',
        lg: '0.625rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      boxShadow: {
        'soft':    '0 2px 8px -2px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)',
        'card':    '0 4px 16px -4px rgba(0,0,0,0.08), 0 0 2px rgba(0,0,0,0.04)',
        'premium': '0 8px 32px -8px rgba(0,0,0,0.12), 0 0 4px rgba(0,0,0,0.04)',
        'hover':   '0 12px 40px -8px rgba(0,0,0,0.16), 0 0 4px rgba(0,0,0,0.04)',
        'accent':  '0 4px 14px var(--shadow-accent)',
        'glow':    '0 0 20px var(--glow-color)',
      },
      transitionDuration: {
        '250': '250ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      fontFamily: {
        sans:      ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        manrope:   ['Manrope', 'sans-serif'],
        jakarta:   ['"Plus Jakarta Sans"', 'sans-serif'],
        roboto:    ['Roboto', 'sans-serif'],
        opensans:  ['"Open Sans"', 'sans-serif'],
        lato:      ['Lato', 'sans-serif'],
        montserrat:['Montserrat', 'sans-serif'],
        poppins:   ['Poppins', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'fade-out':   'fadeOut 0.2s ease-in',
        'slide-up':   'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in':   'scaleIn 0.2s ease-out',
        'scale-out':  'scaleOut 0.2s ease-in',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer':    'shimmerAnimation 2s infinite',
        'bounce-in':  'bounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'rotate-spin':'rotateSpin 20s linear infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeOut:   { from: { opacity: '1' }, to: { opacity: '0' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        scaleOut:  { from: { opacity: '1', transform: 'scale(1)' }, to: { opacity: '0', transform: 'scale(0.96)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.8' } },
        shimmerAnimation: { 
          '0%': { backgroundPosition: '-200% 0' }, 
          '100%': { backgroundPosition: '200% 0' } 
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.8) translateY(20px)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1) translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px var(--glow-color)' },
          '50%': { boxShadow: '0 0 30px var(--glow-color)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        rotateSpin: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss/plugin')(function ({ addComponents, addUtilities, matchUtilities, theme, e }) {
      addComponents({
        /* ─── Resume-specific components ─────────────────────────────────── */
        '.resume-page': {
          '@apply w-full bg-white p-8 shadow-card': '',
          aspectRatio: '210 / 297',
          color: 'black',
          colorScheme: 'light',
        },
        '.resume-section': { '@apply mb-4': '' },
        '.resume-heading': {
          '@apply font-bold text-sm border-b border-gray-900 pb-1 mb-2 uppercase tracking-wider': '',
        },
        '.resume-subheading': { '@apply font-semibold text-xs mb-1': '' },
        '.resume-text': { '@apply text-xs leading-relaxed': '' },
        
        /* ─── Premium card components ────────────────────────────────────── */
        '.card': {
          '@apply bg-card text-card-foreground rounded-2xl border border-border shadow-soft': '',
        },
        '.card-premium': {
          '@apply bg-card text-card-foreground rounded-2xl border border-border shadow-premium': '',
        },
        '.card-hover': {
          '@apply transition-all duration-200': '',
          '&:hover': {
            '@apply shadow-card -translate-y-0.5': '',
          },
        },
        '.card-glass': {
          '@apply bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl': '',
        },

        /* ─── Premium button variants ────────────────────────────────────── */
        '.btn-base': {
          '@apply inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background': '',
        },
        '.btn-primary': {
          '@apply btn-base bg-primary text-primary-foreground shadow-accent hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0': '',
        },
        '.btn-secondary': {
          '@apply btn-base bg-secondary text-secondary-foreground hover:bg-muted': '',
        },
        '.btn-accent': {
          '@apply btn-base bg-accent text-accent-foreground hover:bg-primary': '',
        },
        '.btn-ghost': {
          '@apply btn-base bg-transparent text-foreground hover:bg-muted': '',
        },
        '.btn-outline': {
          '@apply btn-base border-2 border-primary text-primary hover:bg-primary/5': '',
        },

        /* ─── Input & Form components ────────────────────────────────────── */
        '.input-base': {
          '@apply w-full px-3 py-2 rounded-lg bg-input text-foreground border border-border transition-all duration-150': '',
          '&:focus': { '@apply border-primary ring-2 ring-primary/20': '' },
          '&::placeholder': { '@apply text-muted-foreground': '' },
        },
        '.input-lg': {
          '@apply input-base px-4 py-3 text-base': '',
        },
        '.textarea-base': {
          '@apply input-base resize-vertical min-h-24': '',
        },

        /* ─── Badge components ───────────────────────────────────────────── */
        '.badge-base': {
          '@apply inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide': '',
        },
        '.badge-primary': {
          '@apply badge-base bg-primary text-primary-foreground': '',
        },
        '.badge-accent': {
          '@apply badge-base bg-accent text-accent-foreground': '',
        },
        '.badge-muted': {
          '@apply badge-base bg-muted text-muted-foreground': '',
        },

        /* ─── Surface & Background ──────────────────────────────────────── */
        '.surface-base': {
          '@apply bg-background text-foreground': '',
        },
        '.surface-card': {
          '@apply bg-card text-card-foreground rounded-2xl border border-border': '',
        },
        '.surface-muted': {
          '@apply bg-muted text-muted-foreground': '',
        },
        '.surface-glass': {
          '@apply glass backdrop-blur-xl bg-background/70': '',
        },

        /* ─── Semantic text utilities ────────────────────────────────────── */
        '.text-xl': {
          '@apply text-3xl font-bold leading-tight': '',
        },
        '.text-sm-muted': {
          '@apply text-sm text-muted-foreground': '',
        },
        '.text-balance': {
          'text-wrap': 'balance',
        },
      });

      addUtilities({
        '.glass': {
          '@apply bg-background/70 backdrop-blur-md border border-border/50 rounded-2xl': '',
        },
        '.glass-sm': {
          '@apply bg-background/60 backdrop-blur-sm border border-border/30': '',
        },
        '.glass-lg': {
          '@apply bg-background/50 backdrop-blur-2xl border border-border/20': '',
        },

        /* Premium shadow utilities */
        '.shadow-premium': {
          'box-shadow': '0 8px 32px -8px rgba(0,0,0,0.12), 0 0 4px rgba(0,0,0,0.04)',
        },
        '.shadow-hover': {
          'box-shadow': '0 12px 40px -8px rgba(0,0,0,0.16), 0 0 4px rgba(0,0,0,0.04)',
        },
        '.shadow-accent': {
          'box-shadow': '0 4px 14px var(--shadow-accent)',
        },

        /* Gradient backgrounds */
        '.gradient-hero': { 'background': 'var(--gradient-hero)' },
        '.gradient-primary': { 'background': 'var(--gradient-primary)' },
        '.gradient-subtle': { 'background': 'var(--gradient-subtle)' },

        /* Text decorations */
        '.underline-accent': {
          '@apply underline decoration-primary decoration-2 underline-offset-2': '',
        },

        /* Hover elevation */
        '.hover-lift': {
          '@apply transition-all duration-200 hover:-translate-y-1': '',
        },
        '.hover-glow': {
          '@apply transition-all duration-200 hover:shadow-accent': '',
        },

        /* Focus ring utilities */
        '.ring-focus': {
          '@apply outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2': '',
        },

        /* Animation modifiers */
        '.animate-delay-100': {
          'animation-delay': '100ms',
        },
        '.animate-delay-200': {
          'animation-delay': '200ms',
        },
        '.animate-delay-300': {
          'animation-delay': '300ms',
        },
      });

      /* Match utilities for animation delays */
      matchUtilities(
        {
          'animate-delay': (value) => ({
            animationDelay: value,
          }),
        },
        {
          values: theme('transitionDelay'),
        }
      );

      addUtilities({
        '.text-balance': { 'text-wrap': 'balance' },
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      });
    }),
  ],
}
