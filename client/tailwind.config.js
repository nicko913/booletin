/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#4ADE80',
        surface: '#1A1A1A',
        muted: '#9CA3AF'
      },
      fontFamily: {
        mono: ['"DM Mono"', '"Roboto Mono"', 'monospace'],
        sans: ['"DM Sans"', 'Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}
