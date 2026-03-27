/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f4ff',
          100: '#e2deff',
          500: '#5b5bd6',
          600: '#4343b0'
        }
      }
    }
  },
  plugins: []
};

