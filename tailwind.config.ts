import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        pitch: "#0E5F47",
        lime: "#D6F36A",
        ink: "#14213D",
        coral: "#F26D5B"
      },
      boxShadow: {
        soft: "0 12px 35px rgb(20 33 61 / 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
