// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background color - light blue from the image
        "background": "#e6f7ff",
        // Primary colors - blue shades
        "primary": {
          DEFAULT: "#0284c7",
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc", 
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7", // Main button color
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e"
        },
        // Card and border colors
        "card": "#ffffff",
        "border": "#e2e8f0",
        // Text colors
        "text": {
          DEFAULT: "#0f172a",
          primary: "#0f172a",
          secondary: "#334155",
          muted: "#64748b"
        }
      },
      borderRadius: {
        "none": "0px",
        "sm": "0.25rem",
        "DEFAULT": "0.375rem",
        "md": "0.5rem", 
        "lg": "0.75rem",
        "xl": "1rem",
      },
      boxShadow: {
        "card": "0 2px 4px rgba(0, 0, 0, 0.05)",
        "card-hover": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      }
    },
  },
  plugins: [],
}