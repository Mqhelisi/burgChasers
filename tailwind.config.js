/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#1a1625',
          100: '#2d2438',
          200: '#40324b',
          300: '#53405e',
          400: '#664e71',
          500: '#795c84',
          600: '#8c6a97',
          700: '#9f78aa',
          800: '#b286bd',
          900: '#c594d0',
        },
        accent: {
          50: '#0f1419',
          100: '#1e282f',
          200: '#2d3c45',
          300: '#3c505b',
          400: '#4b6471',
          500: '#5a7887',
          600: '#698c9d',
          700: '#78a0b3',
          800: '#87b4c9',
          900: '#96c8df',
        },
        dark: {
          50: '#f8fafc',
          100: '#e8eaed',
          200: '#d1d5db',
          300: '#9ca3af',
          400: '#6b7280',
          500: '#4b5563',
          600: '#374151',
          700: '#1f2937',
          800: '#111827',
          900: '#0a0e14',
          950: '#030406',
        }
      },
      fontFamily: {
        display: ['Poppins', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.8s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
