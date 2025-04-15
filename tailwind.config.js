/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-green': '#4CAF50',
        'light-green': '#81C784',
        'dark-green': '#388E3C',
      },
    },
  },
  plugins: [],
}