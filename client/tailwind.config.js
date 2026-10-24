
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F0F7F2',
          100: '#DCEDE2',
          200: '#BCDCC8',
          300: '#8FC3A5',
          400: '#5FA37F',
          500: '#3F8462',
          600: '#2F6A4E',
          700: '#285540',
          800: '#1E3A2B',
          900: '#132A1E',
          950: '#0B1D14',
        },
        mint: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
        },
        sand: '#F6F7F2',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: [
          '"Plus Jakarta Sans Variable"',
          '"Plus Jakarta Sans"',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px -18px rgba(15, 23, 42, 0.18)',
        soft: '0 8px 24px -14px rgba(19, 42, 30, 0.28)',
        float: '0 18px 48px -20px rgba(19, 42, 30, 0.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
        'fade-in': 'fade-in 0.25s ease-out both',
        'slide-in': 'slide-in 0.3s ease-out both',
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(to right, rgba(15, 118, 71, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 118, 71, 0.06) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
