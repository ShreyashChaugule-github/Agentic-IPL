/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          50:  '#f0fdf0',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        ipl: {
          gold:    'var(--ipl-gold)',
          amber:   'var(--ipl-amber)',
          red:     'var(--ipl-red)',
          navy:    'var(--ipl-navy)',
          dark:    'var(--ipl-dark)',
          surface: 'var(--ipl-surface)',
          border:  'var(--ipl-border)',
          text:    'var(--ipl-text)',
          muted:   'var(--ipl-muted)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body:    ['var(--font-body)', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'pulse-fast':  'pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in':    'slideIn 0.5s ease-out',
        'fade-up':     'fadeUp 0.6s ease-out',
        'score-pop':   'scorePop 0.4s ease-out',
        'wave':        'wave 1.5s ease-in-out infinite',
        'agent-enter': 'agentEnter 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        slideIn:    { from: { transform: 'translateX(-20px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        fadeUp:     { from: { transform: 'translateY(16px)', opacity: '0' }, to: { transform: 'translateY(0)',  opacity: '1' } },
        scorePop:   { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.15)' }, '100%': { transform: 'scale(1)' } },
        wave:       { '0%,100%': { transform: 'scaleY(1)' }, '50%': { transform: 'scaleY(1.5)' } },
        agentEnter: { from: { transform: 'translateX(-30px) scale(0.96)', opacity: '0' }, to: { transform: 'translateX(0) scale(1)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
