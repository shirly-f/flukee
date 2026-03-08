/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          DEFAULT: '#5F7A6B',
          light: '#8A9E94',
          muted: '#9BAFA4',
        },
        sand: {
          DEFAULT: '#F8F6F2',
          dark: '#F0EDE8',
        },
        rose: {
          DEFAULT: '#C9A9A6',
          light: '#E8D5D3',
        },
        charcoal: {
          DEFAULT: '#4A4540',
          light: '#6B6560',
        },
        cream: '#FDFCFA',
      },
      fontFamily: {
        serif: ['Frank Ruhl Libre', 'Georgia', 'serif'],
        sans: ['Assistant', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '24px',
      },
      boxShadow: {
        'soft': '0 4px 16px rgba(74, 69, 64, 0.06)',
        'card': '0 6px 24px rgba(74, 69, 64, 0.08)',
      },
      transitionDuration: {
        '300': '300ms',
      },
    },
  },
  plugins: [],
}
