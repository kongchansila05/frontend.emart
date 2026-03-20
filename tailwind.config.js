/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Battambang', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Brand — same in both themes
        brand: {
          50:  '#f5f4ff',
          100: '#e9e7ff',
          200: '#d3d0ff',
          300: '#b8b3ff',
          400: '#9e95f5',
          500: '#7367f0',
          600: '#6a5fe6',
          700: '#5b50d6',
          800: '#4b42b8',
          900: '#3d3596',
        },
        // Surface — driven by CSS variables, switches per theme
        surface: {
          1000: 'var(--surface-1000)',
          950: 'var(--surface-950)',
          900: 'var(--surface-900)',
          800: 'var(--surface-800)',
          750: 'var(--surface-750)',
          700: 'var(--surface-700)',
          600: 'var(--surface-600)',
          500: 'var(--surface-500)',
          400: 'var(--surface-400)',
          300: 'var(--surface-300)',
        },
      },
      animation: {
        'fade-in':   'fadeIn 0.25s ease forwards',
        'slide-up':  'slideUp 0.3s ease forwards',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: 0, transform: 'translateY(8px)'  }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideUp:  { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseDot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}