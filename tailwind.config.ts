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
        palantir: {
          50:  '#eef6ff',
          100: '#d9ecff',
          200: '#b3d9ff',
          300: '#80bfff',
          400: '#4d9fff',
          500: '#1a7fe6',
          600: '#0d5fbb',
          700: '#0a4a94',
          800: '#083a75',
          900: '#062b57',
          950: '#041a38',
        },
        night: {
          50:  '#f0f4f8',
          100: '#d9e2ec',
          200: '#9fb3c8',
          300: '#627d98',
          400: '#486581',
          500: '#334e68',
          600: '#243b53',
          700: '#1b2f3f',
          800: '#102a43',
          900: '#0d1f30',
          950: '#07121c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-in-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':  'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' },            '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231a7fe6' fill-opacity='0.04'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}

export default config
