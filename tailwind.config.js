/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        positive: '#10b981',
        negative: '#ef4444',
        neutral: '#6b7280',
      }
    },
  },
  plugins: [],
}
