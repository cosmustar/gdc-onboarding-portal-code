/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#101F3D', 800: '#102B4E', 700: '#203A65', 600: '#2D4C80' },
        accent: { DEFAULT: '#3977CE', 600: '#2F66B5', 50: '#EEF4FC', 100: '#DCE8F8' },
        canvas: '#F3F6FA',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,31,61,0.04), 0 1px 3px rgba(16,31,61,0.06)',
        drawer: '-8px 0 32px rgba(16,31,61,0.18)',
      },
      keyframes: {
        'slide-in': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        'slide-in': 'slide-in 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        'fade-in': 'fade-in 160ms ease-out',
      },
    },
  },
  plugins: [],
};
