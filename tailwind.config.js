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
        // Світла тема: фіолетово-біло-чорна
        primary: '#651FFF',
        'primary-hover': '#7435ff',
        'primary-light': '#ede7ff',
        'primary-muted': '#f3f0ff',
        
        // Темна тема: помаранчево-біло-світло-сіра
        'dark-primary': '#FF9102',
        'dark-primary-hover': '#ffa726',
        'dark-primary-light': '#fff3e0',
        'dark-primary-muted': '#fff8e1',
        
        // Загальні кольори
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
        
        // Темна тема
        'dark-bg': '#1a1a1a',
        'dark-card': '#2a2a2a',
        'dark-text': '#ffffff',
        'dark-text-muted': '#a0a0a0',
        'dark-accent': '#FF9102',
        'dark-orange': '#FF9102',
        'dark-border': '#404040',
        'dark-hover': '#333333',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'slideInLeft': 'slideInLeft 0.3s ease-out',
        'slideInRight': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}; 