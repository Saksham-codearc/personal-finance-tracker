/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        coal: {
          950: '#080d0b',
          900: '#0b1411',
          850: '#101a16',
          800: '#13231c',
          700: '#1c3329',
        },
        mint: {
          50: '#eefdf5',
          100: '#d7f9e7',
          200: '#b1f2d1',
          300: '#77e5b2',
          400: '#36cf8c',
          500: '#12b876',
          600: '#07955f',
          700: '#08764f',
          800: '#0a5c40',
          900: '#094c36',
          950: '#032b1f',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px -16px rgba(15, 23, 42, 0.16)',
        float: '0 24px 80px -24px rgba(6, 78, 59, 0.35)',
        glow: '0 0 0 1px rgba(18, 184, 118, 0.08), 0 18px 50px -18px rgba(18, 184, 118, 0.4)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'slide-up': {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: 0, transform: 'scale(0.97)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'slide-up': 'slide-up 0.5s ease-out both',
        'scale-in': 'scale-in 0.2s ease-out both',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
