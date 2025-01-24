/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,tsx}", "./components/**/*.{js,ts,tsx}"],

  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Create a custom color that uses a CSS custom value
        background: "hsl(var(--background))",
      },
    },
  },
  plugins: [],
};
