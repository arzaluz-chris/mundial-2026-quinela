import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "sans-serif"]
      },
      colors: {
        pitch: "#0E5F47",
        pitchDark: "#0A4533",
        lime: "#D6F36A",
        ink: "#14213D",
        coral: "#F26D5B"
      },
      boxShadow: {
        soft: "0 12px 35px rgb(20 33 61 / 0.08)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)"
      }
    }
  },
  plugins: []
};

export default config;
