/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0e',
        navy: '#0d1b2a',
        'navy-light': '#122233',
        'navy-mid': '#0f2030',
        brass: '#c9a84c',
        'brass-dim': '#8a6e2f',
        'brass-glow': '#e8c56a',
        aqua: '#7ecfc0',
        'aqua-dim': '#4a9e92',
        negative: '#4a7fa8',
        'negative-bright': '#5b9cc4',
        muted: '#3a4a5a',
        'text-primary': '#e8dcc8',
        'text-secondary': '#8a9aaa',
        'text-dim': '#4a5a6a',
      },
      fontFamily: {
        sans: ['"DM Sans"', '"Jost"', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      animation: {
        'slide-in': 'slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.4s ease',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(24px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
