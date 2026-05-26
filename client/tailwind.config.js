/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        // High-end premium dark palette scales
        slate: {
          950: '#030712', // Pure deep space canvas black
        }
      }
    },
  },
  plugins: [],
}