import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary: Navy Blue
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
        // Accent: Yellow / Amber
        accent: {
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
        // White / Backgrounds
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
