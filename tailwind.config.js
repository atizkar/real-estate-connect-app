/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan all JS/JSX/TS/TSX files in src/
  ],
  theme: {
    extend: {
      fontFamily: { // Add the Inter font family
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


