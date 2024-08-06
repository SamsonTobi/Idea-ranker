/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        SF: ['SF-Rounded', 'sans-serif'],
      },
      fontWeight: {
        normal: 400,
        medium: 700,
        bold: 900,
        // Add more weights if you need them
      },
    },
  },
  plugins: [],
}