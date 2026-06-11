import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Backdrop blur ────────────────────────────────────────────────────
      // Tailwind ships blur-sm → blur-3xl.  These aliases make intent explicit.
      backdropBlur: {
        glass:       "24px",  // default card blur
        "glass-deep":"40px",  // heavy overlay blur
      },
 
      // ── Box shadows ──────────────────────────────────────────────────────
      // All shadows use semi-transparent black so they work on any canvas color.
      boxShadow: {
        // Standard glass card
        "glass":
          "0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.18)",
 
        // Elevated / hover state
        "glass-elevated":
          "0 16px 48px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.22)",
 
        // Nested / subtle variant
        "glass-subtle":
          "0 4px 16px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.10)",
 
        // Dark-panel / deep variant
        "glass-deep":
          "0 24px 64px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.08)",
 
        // Accent glow — applied via the `glow` prop on hover
        "glass-glow":
          "0 0 40px rgba(61,255,192,0.20), 0 16px 48px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.22)",
      },
 
      // ── Background opacity helpers ───────────────────────────────────────
      // Tailwind's default bg-white/N steps can feel coarse for glass effects.
      // These named values keep the component props predictable.
      backgroundColor: {
        "glass-default":  "rgba(255,255,255,0.08)",
        "glass-elevated": "rgba(255,255,255,0.14)",
        "glass-subtle":   "rgba(255,255,255,0.04)",
        "glass-deep":     "rgba(255,255,255,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
