import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // A Sky Full of Lanterns Theme
        lantern: {
          // Midnight Blues - Base colors
          'midnight': '#0F172A',
          'midnight-dark': '#0A0F1E',
          'midnight-light': '#1E293B',
          
          // Soft Lilacs - Ethereal accents
          'lilac': '#C4B5FD',
          'lilac-dark': '#A78BFA',
          'lilac-light': '#DDD6FE',
          'lilac-pale': '#EDE9FE',
          
          // Warm Golds - Light accents
          'gold': '#FCD34D',
          'gold-dark': '#F59E0B',
          'gold-light': '#FDE68A',
          'gold-glow': '#FEF3C7',
          
          // Supporting colors
          'twilight': '#312E81',
          'dusk': '#4C1D95',
          'mist': '#E0E7FF',
        },
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-fast': 'float 2s ease-in-out infinite',
        'lantern-rise': 'lantern-rise 8s ease-out forwards',
        'lantern-glow': 'lantern-glow 2s ease-in-out infinite',
        'fade-in': 'fade-in 1.5s ease-out forwards',
        'shimmer': 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'lantern-rise': {
          '0%': { 
            transform: 'translateY(100vh) translateX(0) scale(0.8)',
            opacity: '0'
          },
          '10%': { 
            opacity: '1'
          },
          '100%': { 
            transform: 'translateY(-120vh) translateX(var(--drift-x, 0)) scale(1)',
            opacity: '0.3'
          },
        },
        'lantern-glow': {
          '0%, 100%': { 
            filter: 'brightness(1) drop-shadow(0 0 20px rgba(252, 211, 77, 0.6))',
          },
          '50%': { 
            filter: 'brightness(1.3) drop-shadow(0 0 30px rgba(252, 211, 77, 0.9))',
          },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'shimmer': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
