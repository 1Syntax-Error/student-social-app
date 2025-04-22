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
        // Brown theme colors
        "background": "#F8F7F6",
        "sidebar": {
          "DEFAULT": "#614B3B",
          "hover": "#725A49",
          "active": "#725A49"
        },
        // Primary colors - brown shades
        "primary": {
          DEFAULT: "#8B6F5C",
          50: "#F8F7F6",
          100: "#E5E1DD",
          200: "#D2C9C2",
          300: "#B4A194",
          400: "#9D8475",
          500: "#8B6F5C",
          600: "#725A49",
          700: "#614B3B",
          800: "#4A3C2F",
          900: "#3A2E24"
        },
        "card": {
          "primary": "#8B6F5C",
          "secondary": "#B4A194",
          "accent": "#9D8475"
        },
        "border": "#E5E1DD",
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
