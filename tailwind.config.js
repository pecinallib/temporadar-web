/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "tr-peach": "#f5c5a3",
        "tr-cream": "#fdf6ee",
        "tr-terra": "#c1694f",
        "tr-sage": "#7a9e7e",
        "tr-sky": "#87b5d4",
        "tr-brown": "#1a1209",
        "tr-card-dark": "#2a1f14",
      },
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
