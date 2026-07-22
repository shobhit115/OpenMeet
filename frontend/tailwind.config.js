/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        slideUp: {
          '0%': { bottom: '-50px', opacity: '0' },
          '100%': { bottom: '20px', opacity: '1' },
        }
      },
      animation: {
        slideUp: 'slideUp 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}