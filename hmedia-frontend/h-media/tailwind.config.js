module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: {
      center: true,
      screens: {
        xl: "1530px",
        "2xl": "1520px",
      },
    },
    extend: {
      colors: {
        brand: {
          gold: "#BFA242",
          dark: "#353535",
          red: "#BFA242",
        },
      },
      keyframes: {
        slideLeft: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "slide-left": "slideLeft 0.8s ease-out forwards",
        "slide-right": "slideRight 0.8s ease-out forwards",
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
