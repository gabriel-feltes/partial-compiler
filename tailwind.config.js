/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Inclui todos os arquivos React
  ],
  theme: {
    extend: {
      colors: {
        'dark-panel': '#2d3748', // Adiciona cor personalizada usada no projeto
      },
    },
  },
  plugins: [],
}