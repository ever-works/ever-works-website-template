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
<<<<<<< HEAD
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
=======
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  darkMode: ["class"],
  plugins: [
    require("@tailwindcss/typography"),
    heroui(),
    require("tailwindcss-animate"),
  ],
>>>>>>> f0f3251 (feat: integrate shadcn UI components and Stripe configuration)
} satisfies Config;
