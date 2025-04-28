/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        sm: "360px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        openSans: ["Open Sans", "sans-serif"],
        ubuntu: ["Ubuntu", "sans-serif"],
        ubuntuMedium: ["Ubuntu Medium", "sans-serif"],
      },
      fontStyle: {
        italic: ["italic"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
