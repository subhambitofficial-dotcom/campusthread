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
        background: "#06070d",
        card: "#12131e",
        border: "#1f2235",
        brand: {
          cyan: "#00f0ff",
          pink: "#ff007f",
          neon: "#39ff14",
          gold: "#d4af37",
          purple: "#a855f7",
          grey: "#1e2238"
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "grid-line": "linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)"
      },
      animation: {
        "pulse-glow": "pulseGlow 2s infinite ease-in-out",
        "float": "float 6s infinite ease-in-out",
        "shimmer": "shimmer 2.5s infinite linear",
        "glitch": "glitch 1s infinite linear alternate-reverse"
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      }
    },
  },
  plugins: [],
};

export default config;
