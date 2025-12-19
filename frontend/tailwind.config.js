/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4A3B32', // Un marrón chocolate elegante
        secondary: '#D2B48C', // Marrón claro tipo galleta/pan
        accent: '#D4AF37', // Dorado para toques premium
        cream: '#FFFDD0', // Crema para fondos suaves
        danger: '#E53E3E',
        success: '#38A169',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'], // Para títulos elegantes
      }
    },
  },
  plugins: [],
}
