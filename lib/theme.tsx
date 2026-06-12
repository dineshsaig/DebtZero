"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

/* ─── Types ──────────────────────────────────────────────────────── */

export type ColorMode = "dark" | "light" | "auto";
export type AccentColor = "mint" | "blue" | "purple" | "gold" | "pink" | "teal";
export type CardStyle = "flat" | "glass";
export type RadiusScale = "sharp" | "rounded" | "soft";

export interface AppearanceSettings {
  colorMode: ColorMode;
  accent: AccentColor;
  cardStyle: CardStyle;
  radius: RadiusScale;
  animations: boolean;
  compactMode: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
}

export const DEFAULT_SETTINGS: AppearanceSettings = {
  colorMode: "dark",
  accent: "mint",
  cardStyle: "flat",
  radius: "rounded",
  animations: true,
  compactMode: false,
  reducedMotion: false,
  highContrast: false,
};

/* ─── Accent token maps ──────────────────────────────────────────── */

export const ACCENT_TOKENS: Record<AccentColor, {
  primary: string;
  hover: string;
  glow: string;
  gradientFrom: string;
  gradientTo: string;
  rgb: string;
}> = {
  mint:   { primary: "#00C9A7", hover: "#33D4B8", glow: "rgba(0,201,167,0.25)",   gradientFrom: "#00C9A7", gradientTo: "#33D4B8", rgb: "0,201,167"   },
  blue:   { primary: "#3B82F6", hover: "#60A5FA", glow: "rgba(59,130,246,0.25)",  gradientFrom: "#3B82F6", gradientTo: "#60A5FA", rgb: "59,130,246"  },
  purple: { primary: "#A78BFA", hover: "#C4B5FD", glow: "rgba(167,139,250,0.25)", gradientFrom: "#A78BFA", gradientTo: "#C4B5FD", rgb: "167,139,250" },
  gold:   { primary: "#F5A623", hover: "#F7BC57", glow: "rgba(245,166,35,0.25)",  gradientFrom: "#F5A623", gradientTo: "#F7BC57", rgb: "245,166,35"  },
  pink:   { primary: "#F472B6", hover: "#F9A8D4", glow: "rgba(244,114,182,0.25)", gradientFrom: "#F472B6", gradientTo: "#F9A8D4", rgb: "244,114,182" },
  teal:   { primary: "#2DD4BF", hover: "#5EEAD4", glow: "rgba(45,212,191,0.25)",  gradientFrom: "#2DD4BF", gradientTo: "#5EEAD4", rgb: "45,212,191"  },
};

/* ─── Theme token maps ───────────────────────────────────────────── */

const DARK_TOKENS = {
  "--bg-base":        "#080F17",
  "--bg-primary":     "#0D1B2A",
  "--bg-surface":     "#1C2E40",
  "--bg-elevated":    "#253A50",
  "--bg-overlay":     "#2E4760",
  "--text-primary":   "#EDF2F7",
  "--text-secondary": "#C4D3DF",
  "--text-muted":     "#8DA0B3",
  "--text-faint":     "#5A7A8E",
  "--border-subtle":  "rgba(141,160,179,0.12)",
  "--border-default": "rgba(141,160,179,0.22)",
  "--scrollbar-thumb":"#253A50",
};

const LIGHT_TOKENS = {
  "--bg-base":        "#F0F4F8",
  "--bg-primary":     "#FFFFFF",
  "--bg-surface":     "#F7FAFC",
  "--bg-elevated":    "#EDF2F7",
  "--bg-overlay":     "#E2E8F0",
  "--text-primary":   "#0D1B2A",
  "--text-secondary": "#2D3748",
  "--text-muted":     "#4A5568",
  "--text-faint":     "#718096",
  "--border-subtle":  "rgba(0,0,0,0.06)",
  "--border-default": "rgba(0,0,0,0.12)",
  "--scrollbar-thumb":"#CBD5E0",
};

/* ─── Radius token maps ──────────────────────────────────────────── */

const RADIUS_TOKENS: Record<RadiusScale, Record<string, string>> = {
  sharp: {
    "--radius-sm": "4px",
    "--radius-md": "6px",
    "--radius-lg": "8px",
    "--radius-xl": "10px",
  },
  rounded: {
    "--radius-sm": "6px",
    "--radius-md": "10px",
    "--radius-lg": "16px",
    "--radius-xl": "24px",
  },
  soft: {
    "--radius-sm": "10px",
    "--radius-md": "16px",
    "--radius-lg": "24px",
    "--radius-xl": "32px",
  },
};

/* ─── Context ────────────────────────────────────────────────────── */

interface ThemeContextValue {
  settings: AppearanceSettings;
  update: <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => void;
  reset: () => void;
  effectiveMode: "dark" | "light";
}

const ThemeContext = createContext<ThemeContextValue>({
  settings: DEFAULT_SETTINGS,
  update: () => {},
  reset: () => {},
  effectiveMode: "dark",
});

export function useTheme() {
  return useContext(ThemeContext);
}

/* ─── Provider ───────────────────────────────────────────────────── */

const STORAGE_KEY = "debtzero-appearance";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppearanceSettings>(DEFAULT_SETTINGS);
  const [systemDark, setSystemDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppearanceSettings>;
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
    setMounted(true);
  }, []);

  // Listen for system dark mode
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const effectiveMode: "dark" | "light" =
    settings.colorMode === "auto"
      ? systemDark ? "dark" : "light"
      : settings.colorMode;

  // Apply CSS tokens to :root whenever settings change
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const accent = ACCENT_TOKENS[settings.accent];
    const isDark = effectiveMode === "dark";
    const isGlass = settings.cardStyle === "glass";

    // Color mode tokens
    const colorTokens = isDark ? DARK_TOKENS : LIGHT_TOKENS;
    for (const [k, v] of Object.entries(colorTokens)) {
      root.style.setProperty(k, v);
    }

    // Accent tokens
    root.style.setProperty("--accent-primary",       accent.primary);
    root.style.setProperty("--accent-hover",         accent.hover);
    root.style.setProperty("--accent-glow",          accent.glow);
    root.style.setProperty("--accent-gradient-from", accent.gradientFrom);
    root.style.setProperty("--accent-gradient-to",   accent.gradientTo);
    root.style.setProperty("--accent-rgb",           accent.rgb);
    // Keep legacy mint vars pointing at primary for backwards compat
    root.style.setProperty("--accent-mint",          accent.primary);
    root.style.setProperty("--accent-mint-light",    accent.hover);
    root.style.setProperty("--accent-mint-glow",     accent.glow);
    root.style.setProperty("--border-mint",          `rgba(${accent.rgb},0.35)`);

    // Radius tokens
    for (const [k, v] of Object.entries(RADIUS_TOKENS[settings.radius])) {
      root.style.setProperty(k, v);
    }

    /* ── Card style ───────────────────────────────────────────────
     * Glass cards now derive a layered look from the active accent:
     * a faint accent-tinted background wash, a brighter top-edge
     * highlight border, and a soft accent-colored ambient shadow —
     * matching the 6-accent glass dashboard mockups.
     */
    if (isGlass) {
      root.style.setProperty(
        "--card-bg",
        isDark
          ? `linear-gradient(160deg, rgba(${accent.rgb},0.10), rgba(255,255,255,0.03))`
          : `linear-gradient(160deg, rgba(${accent.rgb},0.08), rgba(255,255,255,0.55))`
      );
      root.style.setProperty("--card-backdrop", "blur(20px) saturate(1.6)");
      root.style.setProperty(
        "--card-border",
        isDark
          ? `rgba(${accent.rgb},0.22)`
          : `rgba(${accent.rgb},0.18)`
      );
      root.style.setProperty(
        "--card-glass-highlight",
        isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.65)"
      );
      root.style.setProperty(
        "--card-glass-shadow",
        isDark
          ? `0 8px 32px rgba(0,0,0,0.45), 0 0 24px rgba(${accent.rgb},0.08)`
          : `0 8px 32px rgba(${accent.rgb},0.12), 0 1px 2px rgba(0,0,0,0.04)`
      );
      root.style.setProperty(
        "--card-glass-tint",
        `rgba(${accent.rgb},0.06)`
      );
    } else {
      root.style.setProperty("--card-bg", "var(--bg-surface)");
      root.style.setProperty("--card-backdrop", "none");
      root.style.setProperty("--card-border", "var(--border-subtle)");
      root.style.setProperty("--card-glass-highlight", "transparent");
      root.style.setProperty("--card-glass-shadow", "var(--shadow-card, none)");
      root.style.setProperty("--card-glass-tint", "transparent");
    }

    /* ── Ambient page glow ───────────────────────────────────────
     * Soft radial accent bloom behind the page, visible through
     * glass cards — matches the colored ambient backdrop in each
     * of the 6 accent mockups.
     */
    root.style.setProperty(
      "--page-glow",
      isGlass
        ? `radial-gradient(circle at 15% 0%, rgba(${accent.rgb},${isDark ? "0.16" : "0.10"}), transparent 60%)`
        : "none"
    );

    // Compact mode
    root.style.setProperty("--space-card", settings.compactMode ? "1rem" : "1.5rem");
    root.style.setProperty("--font-size-base", settings.compactMode ? "14px" : "16px");

    // Animations
    root.style.setProperty(
      "--transition-speed",
      settings.animations && !settings.reducedMotion ? "0.15s" : "0s"
    );

    // High contrast
    if (settings.highContrast) {
      root.style.setProperty("--border-subtle",  "rgba(141,160,179,0.35)");
      root.style.setProperty("--border-default", "rgba(141,160,179,0.55)");
    }

    // Data attributes for CSS targeting
    root.setAttribute("data-theme", effectiveMode);
    root.setAttribute("data-card", settings.cardStyle);
    root.setAttribute("data-radius", settings.radius);
    root.setAttribute("data-compact", settings.compactMode ? "true" : "false");

    // Persist
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings, effectiveMode, mounted]);

  const update = useCallback(
    <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // Avoid flash of wrong theme
  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ settings, update, reset, effectiveMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
