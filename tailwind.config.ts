import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      /**
       * 8-Point Grid System Reference
       * Tailwind's default spacing uses 0.25rem (4px) as base unit
       * Our spacing scale (in Tailwind units):
       * - 1 = 4px (Micro - icon to text)
       * - 2 = 8px (Small - within groups)
       * - 4 = 16px (Medium - card inner padding, list items)
       * - 6 = 24px (Large - standard card padding)
       * - 8 = 32px (X-Large - section spacing mobile)
       * - 12 = 48px (2X-Large - section spacing desktop)
       * - 16 = 64px (3X-Large - major sections)
       */
      spacing: {
        // Add custom spacing if needed beyond Tailwind defaults
      },
      colors: {
        // Action Color (Primary) - Neon Lime für CTAs
        'neon-lime': '#DFFF00',

        // Accent Color (Secondary) - Digital Purple
        'digital-purple': '#6A00FF',

        // Neutrals
        'deep-petrol': '#0A1F1D',
        'soft-mint': '#E8F3E8',
        'mid-grey': '#A0B0A8',

        // Dark Mode Specific (leicht heller als deep-petrol)
        'card-dark': '#142927',
      },
      fontFamily: {
        headline: ['Montserrat', 'sans-serif'],
        body: ['Inter', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // Mobile-First Sizes (with optimized line-height)
        'h1-mobile': ['1.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h2-mobile': ['1.25rem', { lineHeight: '1.3', fontWeight: '700' }],
        'h3-mobile': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],

        // Desktop Sizes
        'h1-desktop': ['2.5rem', { lineHeight: '1.2', fontWeight: '800' }],
        'h2-desktop': ['2rem', { lineHeight: '1.25', fontWeight: '700' }],
        'h3-desktop': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
      },
      lineHeight: {
        'tight': '1.2',      // Headlines
        'snug': '1.4',       // Subheadings
        'relaxed': '1.6',    // Body text (improved readability)
        'loose': '1.8',      // Long-form content
      },
      letterSpacing: {
        'label': '0.05em',
      },
      boxShadow: {
        'card-light': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
      transitionDuration: {
        '200': '200ms',
      },
      backgroundImage: {
        'halftone': "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='currentColor' opacity='0.05'/%3E%3C/svg%3E\")",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-right': 'slideRight 3s ease-in-out infinite',
        'confetti-fall': 'confettiFall 4s ease-in forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        confettiFall: {
          '0%': {
            transform: 'translateY(0) rotate(0deg)',
            opacity: '1'
          },
          '100%': {
            transform: 'translateY(100vh) rotate(720deg)',
            opacity: '0'
          },
        },
      },
    },
  },
  plugins: [],
}

export default config
