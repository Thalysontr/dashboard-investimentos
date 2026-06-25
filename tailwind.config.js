/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F9FC',
        ink: '#1F2937',
        muted: '#94A3B8',
        line: '#EDF1F7',
        brand: {
          DEFAULT: '#1687F9',
          dark: '#0B63C4',
          light: '#E8F2FE',
          soft: '#F2F8FF',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '14px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.03), 0 6px 20px rgba(16,24,40,0.04)',
        soft: '0 8px 30px rgba(16,24,40,0.07)',
        brand: '0 8px 20px rgba(22,135,249,0.25)',
      },
    },
  },
  plugins: [],
}
