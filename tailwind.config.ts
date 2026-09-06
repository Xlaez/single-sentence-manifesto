import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: "#FAF8F5",
          100: "#F5F2EC",
          200: "#EDE7DC",
          300: "#DFD7C7",
          400: "#C9BEA7",
          900: "#1A1918",
        },
        ink: {
          DEFAULT: "#181716",
          muted: "#59544D",
          faint: "#8A847A",
          border: "#D6CEBF",
        },
        stamp: {
          red: "#BA2D25",
          redHover: "#9E231C",
          gold: "#C68E17",
        }
      },
      fontFamily: {
        typewriter: ["'Courier Prime'", "Courier", "'Courier New'", "monospace"],
        editorial: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        brutal: "4px 4px 0px 0px #181716",
        "brutal-sm": "2px 2px 0px 0px #181716",
        "brutal-lg": "6px 6px 0px 0px #181716",
        "brutal-red": "4px 4px 0px 0px #BA2D25",
      },
      animation: {
        "blink-cursor": "blink 1s step-start infinite",
        "pulse-subtle": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        }
      }
    },
  },
  plugins: [],
};

export default config;
