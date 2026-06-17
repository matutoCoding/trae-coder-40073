/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0F4F9',
          100: '#D9E3EF',
          200: '#B3C7DF',
          300: '#8DABCF',
          400: '#678FBF',
          500: '#4173AF',
          600: '#2C5A96',
          700: '#1E3A5F',
          800: '#172C4A',
          900: '#0F1E35',
        },
        accent: {
          DEFAULT: '#E87722',
          50: '#FDF4EC',
          100: '#FAE3CC',
          500: '#E87722',
          600: '#D26918',
          700: '#B2580F',
        },
        success: { DEFAULT: '#2E7D32', light: '#E8F5E9', dark: '#1B5E20' },
        warning: { DEFAULT: '#F57C00', light: '#FFF3E0', dark: '#E65100' },
        danger:  { DEFAULT: '#C62828', light: '#FFEBEE', dark: '#B71C1C' },
        info:    { DEFAULT: '#0277BD', light: '#E1F5FE', dark: '#01579B' },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        }
      },
      fontFamily: {
        sans: ['"Source Han Sans SC"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 8px -2px rgba(30, 58, 95, 0.08)',
        'card-hover': '0 8px 24px -4px rgba(30, 58, 95, 0.15)',
        dropdown: '0 10px 25px -5px rgba(30, 58, 95, 0.12), 0 4px 10px -5px rgba(30, 58, 95, 0.08)',
        inner: 'inset 0 2px 4px 0 rgba(30, 58, 95, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-out',
        'slide-up': 'slideUp 200ms ease-out',
        'slide-down': 'slideDown 200ms ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        'hero-gradient': 'linear-gradient(135deg, #1E3A5F 0%, #2C5A96 50%, #4173AF 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(30,58,95,0.02) 0%, rgba(232,119,34,0.03) 100%)',
      },
    },
  },
  plugins: [],
};
