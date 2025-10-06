// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Modern calm theme colors - soft blue-gray palette
        "background": "#FAFBFC",
        "sidebar": {
          "DEFAULT": "#6B7A99",
          "hover": "#7A89A8",
          "active": "#5C6B89"
        },
        // Primary colors - slate blue shades
        "primary": {
          DEFAULT: "#6B7A99",
          50: "#F8F9FB",
          100: "#EEF1F6",
          200: "#DDE2EC",
          300: "#B8C2D6",
          400: "#8B94B8",
          500: "#6B7A99",
          600: "#5C6B89",
          700: "#4D5B75",
          800: "#3E4A5E",
          900: "#2F3947"
        },
        "accent": {
          "teal": "#5C9CA8",
          "sage": "#90B4A3",
          "peach": "#E8A598",
          "lavender": "#8B94B8"
        },
        "card": {
          "primary": "#6B7A99",
          "secondary": "#8B94B8",
          "accent": "#5C9CA8"
        },
        "border": "#E5E7EB",
        // Dark mode colors
        "dark": {
          "bg": "#1A1F2E",
          "surface": "#252B3B",
          "border": "#353B4D",
          "text": {
            "primary": "#E8EAF0",
            "secondary": "#B8BCC8"
          }
        }
      },
      borderRadius: {
        "none": "0px",
        "sm": "0.25rem",
        "DEFAULT": "0.375rem",
        "md": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        "card": "0 1px 3px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.12)",
        "soft": "0 2px 8px rgba(107, 122, 153, 0.15)",
      }
    },
  },
  plugins: [],
}
