/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#8B5CF6",
          "purple-light": "#A78BFA",
          "purple-dark": "#6D28D9",
          "purple-bg": "#EDE9FE",
          lav: "#F3F0FA",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
        brand: ["Courier Prime", "monospace"],
      },
    },
  },
  plugins: [],
};
