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
        // DebtZero core palette
        navy: {
          950: "#080F17",
          900: "#0D1B2A",
          800: "#1C2E40",
          700: "#253A50",
          600: "#2E4760",
        },
        ash: {
          400: "#8DA0B3",
          300: "#A8BBCC",
          200: "#C4D3DF",
          100: "#DDE8F0",
        },
        ice: {
          DEFAULT: "#EDF2F7",
          50: "#F7FAFC",
        },
        mint: {
          DEFAULT: "#00C9A7",
          light: "#33D4B8",
          dark: "#00A88C",
          glow: "rgba(0, 201, 167, 0.25)",
        },
        ember: {
          DEFAULT: "#FF6B6B",
          light: "#FF8E8E",
          dark: "#E55555",
        },
        gold: {
          DEFAULT: "#F5A623",
          light: "#F7BC57",
        },
      },
      fontFamily: {
        display: ["DM Serif Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "mint-glow": "0 0 20px rgba(0, 201, 167, 0.3)",
        "mint-sm": "0 0 8px rgba(0, 201, 167, 0.2)",
        card: "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)",
        "card-hover": "0 2px 6px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.4)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "navy-gradient":
          "linear-gradient(135deg, #0D1B2A 0%, #1C2E40 100%)",
        "mint-gradient":
          "linear-gradient(135deg, #00C9A7 0%, #00A88C 100%)",
        "hero-grid":
          "linear-gradient(rgba(0,201,167,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,201,167,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "48px 48px",
      },
      animation: {
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "slide-up": "slideUp 0.5s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        "progress-fill": "progressFill 1.2s ease-out forwards",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(0,201,167,0.2)" },
          "50%": { boxShadow: "0 0 24px rgba(0,201,167,0.5)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        progressFill: {
          from: { width: "0%" },
          to: { width: "var(--progress-width)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
