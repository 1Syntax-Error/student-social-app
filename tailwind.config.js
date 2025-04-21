/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'], // Use both class and data-theme attribute
  theme: {
    extend: {
      colors: {
        // Light theme colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Dark theme colors
        dark: {
          background: '#121212',
          surface: '#1e1e1e',
          primary: '#bb86fc',
          secondary: '#03dac6',
          error: '#cf6679',
          onBackground: '#e1e1e1',
          onSurface: '#ffffff',
          onPrimary: '#000000',
          onSecondary: '#000000',
          onError: '#000000',
        },
      },
      backgroundColor: {
        // Main page backgrounds
        'dark-page': '#121212',
        'dark-card': '#1e1e1e',
        'dark-elevated': '#2d2d2d',
      },
      textColor: {
        'dark-primary': '#e1e1e1',
        'dark-secondary': '#a0a0a0',
        'dark-muted': '#6c6c6c',
      },
      borderColor: {
        'dark-border': '#333333',
      },
    },
  },
  plugins: [],
}