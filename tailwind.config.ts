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
      colors: {
        // TravelMate core colors dari design.md
        'tm-ink': {
          900: '#152238',
          700: '#2C3E5C',
        },
        'tm-sea': {
          600: '#1D5C7A',
          100: '#DCEAF0',
        },
        'tm-stamp': {
          600: '#B8452F',
          100: '#F6E2DC',
        },
        'tm-parchment': {
          200: '#E8E2D0',
          50: '#F7F4EC',
        },
        'tm-sand': {
          400: '#C4B896',
        },
        'tm-success': {
          600: '#3F7D5C',
        },
        
        // UI/UX Pro Max travel colors
        'uupm-sky': {
          blue: '#0EA5E9',
          light: '#F0F9FF',
        },
        'uupm-accent': {
          orange: '#EA580C',
        },
        
        // Hybrid system variables
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
      },
      fontFamily: {
        // TravelMate typography
        'fraunces': ['var(--font-fraunces)', 'serif'],
        'inter': ['var(--font-inter)', 'sans-serif'],
        'ibm-plex-mono': ['var(--font-ibm-plex-mono)', 'monospace'],
        // UI/UX Pro Max typography
        'space-grotesk': ['var(--font-space-grotesk)', 'sans-serif'],
        'dm-sans': ['var(--font-dm-sans)', 'sans-serif'],
      },
      animation: {
        // UI/UX Pro Max animations
        'typing-dot': 'typingDot 1.4s infinite',
        'stream-text': 'streamText 0.05s steps(1) infinite',
        'card-unfold': 'cardUnfold 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.2s ease-out',
        'pulse-subtle': 'pulseSubtle 2s infinite',
      },
      keyframes: {
        typingDot: {
          '0%, 60%, 100%': { opacity: '0.4' },
          '30%': { opacity: '1' },
        },
        streamText: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        cardUnfold: {
          '0%': { 
            opacity: '0',
            transform: 'scaleY(0.95) translateY(8px)',
          },
          '100%': { 
            opacity: '1',
            transform: 'scaleY(1) translateY(0)',
          },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(8px)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      spacing: {
        // TravelMate spacing system
        'tm-1': '4px',
        'tm-2': '8px',
        'tm-3': '12px',
        'tm-4': '16px',
        'tm-5': '24px',
        'tm-6': '32px',
      },
      borderRadius: {
        // TravelMate radius system
        'tm-sm': '8px',
        'tm-md': '14px',
        'tm-pill': '999px',
      },
    },
  },
  plugins: [],
}
export default config