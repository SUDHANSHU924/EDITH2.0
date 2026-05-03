import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors from EDITH design
        'edith-dark': '#050505',
        'edith-darker': '#030213',
        'edith-cyan': '#00F0FF',
        'edith-blue': '#7B61FF',
        'edith-red': '#FF2A4B',
        'edith-red-light': '#FF4D6F',
        
        // Semantic colors matching dark theme
        background: '#050505',
        foreground: '#F5F5F5',
        card: '#0A0A12',
        'card-foreground': '#F5F5F5',
        
        primary: '#00F0FF',
        'primary-dark': '#0099CC',
        'primary-foreground': '#030213',
        
        secondary: '#7B61FF',
        'secondary-foreground': '#F5F5F5',
        
        accent: '#00F0FF',
        'accent-foreground': '#030213',
        
        muted: '#3D3D45',
        'muted-foreground': '#A0A0A8',
        
        destructive: '#FF2A4B',
        'destructive-foreground': '#FFFFFF',
        
        border: 'rgba(255, 255, 255, 0.08)',
        input: '#0A0A12',
        
        sidebar: '#050505',
        'sidebar-foreground': '#F5F5F5',
        'sidebar-primary': '#00F0FF',
        'sidebar-accent': '#1A1A22',
        'sidebar-border': 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'sidebar-collapsed': '72px',
        'sidebar-expanded': '272px',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { 'box-shadow': '0 0 8px rgba(0, 240, 255, 0.2)' },
          '50%': { 'box-shadow': '0 0 16px rgba(0, 240, 255, 0.4)' },
        },
        'pulse-glow': {
          '0%, 100%': { 'box-shadow': '0 0 8px rgba(0, 240, 255, 0.3), 0 0 16px rgba(0, 240, 255, 0.2)' },
          '50%': { 'box-shadow': '0 0 16px rgba(0, 240, 255, 0.5), 0 0 24px rgba(0, 240, 255, 0.3)' },
        },
      },
      backgroundImage: {
        'edith-gradient': 'linear-gradient(180deg, rgba(5,5,5,0.98) 0%, rgba(8,12,20,0.96) 100%)',
        'sidebar-gradient': 'linear-gradient(180deg, rgba(5,5,5,0.98) 0%, rgba(8,12,20,0.96) 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
