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
        'wedding-dustyPink': {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        'wedding-roseGold': {
          50: '#fdf7f0',
          100: '#fbeee0',
          200: '#f6d5b7',
          300: '#f0bb8d',
          400: '#ea9f63',
          500: '#e4853a',
          600: '#d6672e',
          700: '#b85425',
          800: '#9a421e',
          900: '#7c3318',
        },
        'wedding-lavender': {
          50: '#f8f6ff',
          100: '#f1ecff',
          200: '#e0d4ff',
          300: '#cfbbff',
          400: '#bea2ff',
          500: '#ad89ff',
          600: '#9c70ff',
          700: '#8b57ff',
          800: '#7a3eff',
          900: '#6925ff',
        },
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
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}