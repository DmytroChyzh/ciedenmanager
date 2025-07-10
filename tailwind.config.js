/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#651FFF',
        'primary-hover': '#7435ff',
        orange: '#FF9102',
        'orange-hover': '#ffc81f',
        bluegrey: '#b4beca',
        green: '#8AC34A',
        red: '#F44436',
        dark: '#212121',
        'secondary-text': '#a6a6a6',
        divider: '#c3cbd4',
        disabled: '#b4beca',
        'bg-grey': '#f0f2f4',
        'dark-bg': '#212121',
        'dark-card': '#292929',
        'dark-text': '#fff',
        'dark-accent': '#651FFF',
        'dark-orange': '#FF9102',
      },
    },
  },
  plugins: [],
}; 