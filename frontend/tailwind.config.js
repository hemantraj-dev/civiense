/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          slate: '#172B36',
          ivory: '#F3F1E9',
          white: '#FFFFFF',
          teal: '#267C78',
          sage: '#83A69A',
          amber: '#D69A42',
          terracotta: '#C75C54',
          charcoal: '#263238',
          grey: '#738087',
          border: '#E2E4DF',
        },
        risk: {
          critical: '#B94B48',
          high: '#D18A35',
          medium: '#D2B64B',
          low: '#438A69',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Manrope', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
