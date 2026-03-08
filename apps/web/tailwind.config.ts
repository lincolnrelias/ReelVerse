import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A12',
        surface: '#12121E',
        'surface-elevated': '#1C1C2E',
        'surface-highlight': '#252540',
        primary: '#6C5CE7',
        'primary-light': '#A29BFE',
        accent: '#FF6B9D',
        'accent-light': '#FF8EB3',
        neon: '#00F5D4',
        'text-primary': '#F0F0F5',
        'text-secondary': '#7B7B9B',
        success: '#00F5D4',
        warning: '#FFD93D',
        error: '#FF6B6B',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 20% 80%, rgba(108,92,231,0.15) 0%, transparent 50%), radial-gradient(at 80% 20%, rgba(255,107,157,0.1) 0%, transparent 50%), radial-gradient(at 50% 50%, rgba(0,245,212,0.05) 0%, transparent 50%)',
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out both',
        'score-count': 'score-count 1.2s ease-out both',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.5s ease-out both',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
