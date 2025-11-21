/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep Plum/Burgundy (previously dustyPink) - Base: #6B1F41
        'wedding-dustyPink': {
          50: '#fdf2f7',
          100: '#fce7f0',
          200: '#facde3',
          300: '#f5a3cc',
          400: '#ed6ba8',
          500: '#de3d87',
          600: '#c62167',
          700: '#a81653',
          800: '#8b1445',
          900: '#6B1F41',
        },
        // Gold/Mustard (previously roseGold) - Base: #D4A056
        'wedding-roseGold': {
          50: '#fdfaf4',
          100: '#faf3e6',
          200: '#f5e5c4',
          300: '#edd19a',
          400: '#e3b870',
          500: '#D4A056',
          600: '#c18940',
          700: '#a06e35',
          800: '#835930',
          900: '#6e4a2a',
        },
        // Mauve/Light Purple (previously lavender) - Base: #D591B9
        'wedding-lavender': {
          50: '#fdf4f9',
          100: '#fce9f4',
          200: '#fad5ea',
          300: '#f6b4d9',
          400: '#ee88c0',
          500: '#D591B9',
          600: '#c556a1',
          700: '#a93f85',
          800: '#8c366e',
          900: '#74305c',
        },
        // Cream/Beige (NEW) - Base: #F5EED7
        'wedding-cream': {
          50: '#fefdfb',
          100: '#fefcf7',
          200: '#fdf9ed',
          300: '#fbf4dc',
          400: '#f8edc4',
          500: '#F5EED7',
          600: '#e4d5a8',
          700: '#ccb97a',
          800: '#b09b57',
          900: '#947f42',
        },
        // Deep Purple/Violet (NEW) - Base: #3B1147
        'wedding-deepPurple': {
          50: '#faf5fc',
          100: '#f4ebf9',
          200: '#e8d6f2',
          300: '#d5b3e7',
          400: '#bb84d7',
          500: '#9d53c3',
          600: '#8237ad',
          700: '#6b2890',
          800: '#592375',
          900: '#3B1147',
        },
        // Gray (unchanged)
        'wedding-gray': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', '"Playfair Display"', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slow-pan': {
          '0%': { transform: 'scale(1) translateY(0)' },
          '100%': { transform: 'scale(1.05) translateY(-6px)' },
        },
        'float-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'underline-pulse': {
          '0%, 100%': { textDecorationColor: 'rgba(212, 160, 86, 0.35)' },
          '50%': { textDecorationColor: 'rgba(212, 160, 86, 0.9)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.7s ease-out both',
        'slow-pan': 'slow-pan 14s ease-in-out infinite alternate',
        'float-soft': 'float-soft 6s ease-in-out infinite',
        'underline-pulse': 'underline-pulse 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}