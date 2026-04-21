/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Light mode
        "tr-peach": "#f7c6ae",
        "tr-cream": "#fdf5ea",
        "tr-paper": "#fffaf2",
        "tr-sand": "#f1e3cf",
        "tr-sky-card": "#d9e7f0",
        "tr-ink": "#2d2418",
        "tr-ink-soft": "#6b5b49",
        "tr-ink-mute": "#9a8a74",
        // Accents
        "tr-terra": "#c1694f",
        "tr-sage": "#7a9e7e",
        "tr-sky": "#87b5d4",
        "tr-sun": "#f2a65a",
        // Dark mode
        "tr-dark-bg": "#1a1209",
        "tr-dark-card": "#2a1f14",
        "tr-dark-sand": "#352616",
        "tr-dark-sky": "#2f3b3a",
        "tr-dark-ink": "#f5e8d4",
        "tr-dark-soft": "#c8b69a",
        "tr-dark-mute": "#8a7a63",
      },
      fontFamily: {
        playfair: ['"Playfair Display"', "serif"],
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      fontSize: {
        "temp-lg": ["168px", { lineHeight: "0.9", letterSpacing: "-0.05em" }],
        "temp-md": ["132px", { lineHeight: "0.9", letterSpacing: "-0.05em" }],
        "temp-sm": ["116px", { lineHeight: "0.9", letterSpacing: "-0.05em" }],
      },
    },
  },
  plugins: [],
};
