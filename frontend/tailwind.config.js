/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#14281C',
        secondary: '#0B422A',
        tertiary: '#0C5537',
        accent: '#FBE00A',
        neutral: '#EFEFED',
        'base-100': '#ffffff',
        'base-200': '#f0f0f0',
      },
    },
  },
  plugins: [],
}