/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f0ff",
          100: "#ede5ff",
          200: "#d4c4f7",
          300: "#b89def",
          400: "#8b6bc0",
          500: "#6b4d9e",
          600: "#553d7e",
          700: "#4A2D7A",
          800: "#3A1D6A",
          900: "#2D1B4E",
          950: "#1A0F30",
        },
        surface: {
          DEFAULT: "#ffffff",
          secondary: "#f9fafb",
          tertiary: "#f3f4f6",
        },
        "surface-dark": {
          DEFAULT: "#111827",
          secondary: "#1f2937",
          tertiary: "#374151",
        },
      },
      fontFamily: {
        sans: ["Inter_400Regular", "system-ui", "-apple-system", "sans-serif"],
        "sans-medium": ["Inter_500Medium", "system-ui", "-apple-system", "sans-serif"],
        "sans-semibold": ["Inter_600SemiBold", "system-ui", "-apple-system", "sans-serif"],
        "sans-bold": ["Inter_700Bold", "system-ui", "-apple-system", "sans-serif"],
        serif: ["PlayfairDisplay_400Regular", "Georgia", "serif"],
        "serif-bold": ["PlayfairDisplay_700Bold", "Georgia", "serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
