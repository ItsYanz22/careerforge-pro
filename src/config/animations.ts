/**
 * Motion & Animation Presets
 * ─────────────────────────────────────────────────────────────────────────
 * Centralized animation configurations for Framer Motion
 * Used throughout app for consistent motion and feel
 */

export const motionPresets = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 16 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },

  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  scaleInCenter: {
    initial: { opacity: 0, scale: 0.85 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.85 },
    transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] },
  },

  // Slide animations
  slideInLeft: {
    initial: { opacity: 0, x: -32 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
    transition: { duration: 0.35, ease: 'easeOut' },
  },
  slideInRight: {
    initial: { opacity: 0, x: 32 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 24 },
    transition: { duration: 0.35, ease: 'easeOut' },
  },

  // Stagger animations (for lists/grids)
  stagger: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  },
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  },

  // Hover animations
  hoverLift: {
    whileHover: { y: -4, transition: { duration: 0.2 } },
  },
  hoverScale: {
    whileHover: { scale: 1.05, transition: { duration: 0.2 } },
  },
  hoverGlow: {
    whileHover: {
      boxShadow: '0 20px 40px var(--shadow-accent)',
      transition: { duration: 0.2 },
    },
  },

  // Tap animations
  tapScale: {
    whileTap: { scale: 0.95 },
  },

  // Pulse animations
  pulse: {
    animate: {
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  pulseBorder: {
    animate: {
      boxShadow: [
        '0 0 0 0 var(--glow-color)',
        '0 0 0 12px rgba(0,0,0,0)',
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeOut',
      },
    },
  },

  // Shimmer/Loading animations
  shimmer: {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        duration: 1.6,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  },

  // Float animations (for decorative elements)
  float: {
    animate: {
      y: [0, -12, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  floatSlow: {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },

  // Page transitions
  pageTransitionIn: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },

  // Modal animations
  modalBackdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  modalContent: {
    initial: { opacity: 0, scale: 0.95, y: 16 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 16 },
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },

  // Dropdown/Menu animations
  menuContainer: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.15 },
  },
  menuItem: {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.2 },
  },

  // Success/Error animations
  successBounce: {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
  },
  shake: {
    animate: {
      x: [-10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.4 },
    },
  },

  // Rotate animations
  spin: {
    animate: {
      rotate: 360,
      transition: { duration: 2, repeat: Infinity, ease: 'linear' },
    },
  },
  rotateSlow: {
    animate: {
      rotate: 360,
      transition: { duration: 8, repeat: Infinity, ease: 'linear' },
    },
  },

  // Breadcrumb animations
  breadcrumb: {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.2 },
  },

  // Number counter (for stats)
  number: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// Easing presets
export const easings = {
  smooth: [0.4, 0, 0.2, 1],
  bouncy: [0.34, 1.56, 0.64, 1],
  sharp: [0.4, 0, 0.6, 1],
  gentle: [0.25, 0.46, 0.45, 0.94],
};

// Transition durations (in seconds)
export const durations = {
  instant: 0.1,
  fast: 0.15,
  base: 0.2,
  slow: 0.3,
  slower: 0.4,
  verySlow: 0.6,
};

// Delay presets
export const delays = {
  none: 0,
  xs: 0.05,
  sm: 0.1,
  md: 0.15,
  lg: 0.2,
  xl: 0.3,
};

// Viewport-triggered animation configs
export const viewportConfig = {
  once: true,
  margin: '-50px',
  amount: 'some' as const,
};

export const viewportConfigStrict = {
  once: true,
  margin: '-80px',
  amount: 'some' as const,
};
