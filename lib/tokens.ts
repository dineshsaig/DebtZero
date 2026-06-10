/**
 * DebtZero Design Tokens
 * Single source of truth for colors, spacing, typography, and motion.
 * Used by components and utilities across the app.
 */

export const colors = {
  // Surface hierarchy (dark → light)
  bgBase:     "#080F17",
  bgPrimary:  "#0D1B2A",
  bgSurface:  "#1C2E40",
  bgElevated: "#253A50",
  bgOverlay:  "#2E4760",

  // Text
  textPrimary:   "#EDF2F7",
  textSecondary: "#C4D3DF",
  textMuted:     "#8DA0B3",
  textFaint:     "#5A7A8E",

  // Brand accent
  mint:          "#00C9A7",
  mintLight:     "#33D4B8",
  mintDark:      "#00A88C",
  mintGlow:      "rgba(0, 201, 167, 0.25)",

  // Semantic
  ember:         "#FF6B6B",  // debt / danger
  emberLight:    "#FF8E8E",
  gold:          "#F5A623",  // savings / goals
  goldLight:     "#F7BC57",

  // Borders
  borderSubtle:  "rgba(141, 160, 179, 0.12)",
  borderDefault: "rgba(141, 160, 179, 0.22)",
  borderMint:    "rgba(0, 201, 167, 0.35)",
} as const;

export const typography = {
  fontDisplay: '"DM Serif Display", Georgia, serif',
  fontSans:    '"Inter", system-ui, sans-serif',
  fontMono:    '"JetBrains Mono", Menlo, monospace',

  scale: {
    "2xs":  "0.625rem",  // 10px
    xs:     "0.75rem",   // 12px
    sm:     "0.875rem",  // 14px
    base:   "1rem",      // 16px
    lg:     "1.125rem",  // 18px
    xl:     "1.25rem",   // 20px
    "2xl":  "1.5rem",    // 24px
    "3xl":  "1.875rem",  // 30px
    "4xl":  "2.25rem",   // 36px
    "5xl":  "3rem",      // 48px
  },

  weight: {
    light:    300,
    regular:  400,
    medium:   500,
    semibold: 600,
    bold:     700,
  },

  tracking: {
    tight:   "-0.035em",
    snug:    "-0.02em",
    normal:  "0",
    wide:    "0.06em",
    wider:   "0.1em",
  },
} as const;

export const spacing = {
  // Base 4px grid
  1:   "0.25rem",
  2:   "0.5rem",
  3:   "0.75rem",
  4:   "1rem",
  5:   "1.25rem",
  6:   "1.5rem",
  8:   "2rem",
  10:  "2.5rem",
  12:  "3rem",
  16:  "4rem",
  20:  "5rem",
  24:  "6rem",
  section: "5rem",
} as const;

export const radius = {
  sm:  "6px",
  md:  "10px",
  lg:  "16px",
  xl:  "24px",
  "2xl": "32px",
  full: "9999px",
} as const;

export const shadow = {
  mintGlow: "0 0 20px rgba(0, 201, 167, 0.3)",
  mintSm:   "0 0 8px rgba(0, 201, 167, 0.2)",
  card:     "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)",
  cardHover:"0 2px 6px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.4)",
} as const;

export const animation = {
  duration: {
    fast:    "150ms",
    default: "200ms",
    slow:    "400ms",
    xslow:   "800ms",
  },
  easing: {
    default: "ease",
    out:     "ease-out",
    spring:  "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },
} as const;

export const breakpoints = {
  sm:  "640px",
  md:  "768px",
  lg:  "1024px",
  xl:  "1280px",
  "2xl": "1536px",
} as const;

export const layout = {
  maxWidth:      "1200px",
  sidebarWidth:  "260px",
  headerHeight:  "64px",
  contentPadX:   "1.5rem",
} as const;

/** Semantic color aliases — what each color means in context */
export const semantic = {
  debtColor:     colors.ember,      // active debt indicator
  paidColor:     colors.mint,       // paid-off / positive progress
  savingsColor:  colors.gold,       // savings / goals
  neutralColor:  colors.textMuted,  // inactive / neutral state
  warningColor:  "#F59E0B",
  errorColor:    colors.ember,
} as const;
