/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,jsx,tsx}', './src/**/*.css'],
  theme: {
    extend: {
      colors: {
        doh: {
          blue: '#1e40af',
          'blue-light': '#3b82f6',
          'blue-dark': '#1e3a8a',
          yellow: '#eab308',
          red: '#dc2626',
          green: '#16a34a',
          gray: '#6b7280',
        }
      }
    }
  },
  plugins: []
};
