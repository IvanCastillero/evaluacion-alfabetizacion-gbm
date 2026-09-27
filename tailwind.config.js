/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gbm: {
          blue: '#002F6C',
          teal: '#00A3E0',
          dark: '#0B1B3D',
          light: '#F4F7FC',
          yellow: '#FFB81C',
          green: '#00875A',
          amber: '#FFAB00',
          red: '#DE350B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
