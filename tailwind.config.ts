import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'dark--theme': {
          DEFAULT: "var(--dark-theme)",
          50: "var(--dark-theme-50)",
          100: "var(--dark-theme-100)",
          200: "var(--dark-theme-200)",
          300: "var(--dark-theme-300)",
          400: "var(--dark-theme-400)",
          500: "var(--dark-theme-500)",
          600: "var(--dark-theme-600)",
          700: "var(--dark-theme-700)",
          800: "var(--dark-theme-800)",
          900: "var(--dark-theme-900)",
          950: "var(--dark-theme-950)",
        },
        'light--theme': {
          light: "var(--light-theme-light)",
          DEFAULT: "var(--light-theme)",
          dark: "var(--light-theme-dark)",
        },
       
      },
    },
  },
  darkMode: "class",
  plugins: [require("@tailwindcss/typography"), heroui()],
} satisfies Config;
