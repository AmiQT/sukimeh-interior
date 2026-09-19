import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1B2B6B",
          50: "#E8EBFF",
          100: "#C5CCFF",
          200: "#8A96E8",
          300: "#5A6BD4",
          400: "#3547A8",
          500: "#1B2B6B",
          600: "#152256",
          700: "#101941",
          800: "#0A102C",
          900: "#050817",
        },
        accent: {
          DEFAULT: "#F97316",
          50: "#FFF3E8",
          100: "#FFE0C2",
          200: "#FFBE85",
          300: "#FF9B47",
          400: "#F97316",
          500: "#E05E00",
          600: "#B34B00",
          700: "#863800",
          800: "#592500",
          900: "#2C1300",
        },
        dark: "#0F1729",
        background: "#F8F9FF",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["Arial", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        btn: "8px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(27,43,107,0.12)",
        hover: "0 8px 32px rgba(27,43,107,0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
