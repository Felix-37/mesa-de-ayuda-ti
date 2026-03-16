import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn CSS variable colors
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
        popover: { DEFAULT: "var(--popover)", foreground: "var(--popover-foreground)" },
        primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
        secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
        destructive: { DEFAULT: "var(--destructive)", foreground: "var(--destructive-foreground)" },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        // Project-specific: Navy Blue
        navy: {
          50: "#e7ecf3",
          100: "#c3cfe0",
          200: "#9bafc9",
          300: "#738fb3",
          400: "#5577a2",
          500: "#376091",
          600: "#2f5682",
          700: "#264970",
          800: "#1e3d5e",
          900: "#112a42",
          950: "#0b1a2b",
        },
        // Project-specific: Accent Yellow / Amber
        "accent-yellow": {
          50: "#fffbe6",
          100: "#fff4bf",
          200: "#ffed95",
          300: "#ffe56b",
          400: "#ffde4c",
          500: "#ffd833",
          600: "#ffc42e",
          700: "#ffab27",
          800: "#ff9321",
          900: "#ff6b14",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
