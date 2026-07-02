/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'brand-cyan': '#00f0ff',
        'brand-pink': '#ff007f',
        'brand-purple': '#a855f7',
        'brand-gold': '#d4af37',
        'brand-neon': '#ff007f'
      },
      // add any custom utilities or animations later
    }
  },
  plugins: []
};
