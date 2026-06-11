import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// ─── Variant definitions ──────────────────────────────────────────────────────

export type GlassVariant = "default" | "elevated" | "subtle" | "bordered" | "deep";
export type GlassAccent  = "none" | "mint" | "blue" | "purple" | "gold" | "pink" | "teal";
export type GlassRadius  = "sharp" | "rounded" | "soft";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Visual depth / blur intensity of the glass material.
   *
   * default   — standard frosted glass (blur-xl, bg-white/8)
   * elevated  — stronger blur + brighter surface for modal-like layers
   * subtle    — lighter tint for nested / secondary cards
   * bordered  — adds a vivid specular rim border, ideal for hero cards
   * deep      — darkest tint, for overlays or sidebar panels
   */
  variant?: GlassVariant;

  /**
   * Optional top-edge glow accent that matches the DebtZero accent system.
   * Rendered as an absolutely-positioned gradient bar so it never disturbs layout.
   */
  accent?: GlassAccent;

  /**
   * Corner radius — maps to DebtZero's global border-radius setting.
   * sharp   = 4px  | rounded = 16px  | soft = 24px
   */
  radius?: GlassRadius;

  /**
   * When true the card lifts slightly on hover and cursor becomes pointer.
   */
  interactive?: boolean;

  /**
   * Adds a glowing specular sheen pseudo-overlay on hover.
   */
  glow?: boolean;

  /**
   * Renders a faint inner top-edge highlight (the "light catches the rim" effect).
   * On by default for non-subtle variants.
   */
  specular?: boolean;
}

// ─── Style maps ──────────────────────────────────────────────────────────────

const variantStyles: Record<GlassVariant, string> = {
  default:  "bg-white/[0.08] backdrop-blur-xl  backdrop-saturate-[180%] shadow-glass",
  elevated: "bg-white/[0.14] backdrop-blur-2xl backdrop-saturate-[200%] shadow-glass-elevated",
  subtle:   "bg-white/[0.04] backdrop-blur-lg  backdrop-saturate-[160%] shadow-glass-subtle",
  bordered: "bg-white/[0.10] backdrop-blur-xl  backdrop-saturate-[180%] shadow-glass border-white/25",
  deep:     "bg-white/[0.05] backdrop-blur-3xl backdrop-saturate-[150%] shadow-glass-deep",
};

const radiusStyles: Record<GlassRadius, string> = {
  sharp:   "rounded-[4px]",
  rounded: "rounded-[16px]",
  soft:    "rounded-[24px]",
};

const accentGradients: Record<GlassAccent, string | null> = {
  none:   null,
  mint:   "from-[#3DFFC0]/60 via-[#3DFFC0]/20 to-transparent",
  blue:   "from-[#4DA6FF]/60 via-[#4DA6FF]/20 to-transparent",
  purple: "from-[#A78BFA]/60 via-[#A78BFA]/20 to-transparent",
  gold:   "from-[#F7C948]/60 via-[#F7C948]/20 to-transparent",
  pink:   "from-[#F472B6]/60 via-[#F472B6]/20 to-transparent",
  teal:   "from-[#2DD4BF]/60 via-[#2DD4BF]/20 to-transparent",
};

// ─── Component ───────────────────────────────────────────────────────────────

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      variant   = "default",
      accent    = "none",
      radius    = "rounded",
      interactive = false,
      glow        = false,
      specular,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const showSpecular = specular ?? variant !== "subtle";
    const accentClass  = accentGradients[accent];

    return (
      <div
        ref={ref}
        className={cn(
          // Base
          "relative overflow-hidden",
          "border border-white/[0.15]",
          // Variant (blur / bg / shadow)
          variantStyles[variant],
          // Radius
          radiusStyles[radius],
          // Interactive
          interactive && [
            "cursor-pointer",
            "transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            "hover:-translate-y-0.5 hover:scale-[1.01]",
            "hover:shadow-glass-elevated hover:border-white/25",
            "active:scale-[0.99] active:translate-y-0",
          ],
          // Glow hover
          glow && "hover:shadow-glass-glow",
          className
        )}
        {...props}
      >
        {/* ── Specular rim highlight ── */}
        {showSpecular && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px
                       bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />
        )}

        {/* ── Top-edge accent glow bar ── */}
        {accentClass && (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 h-[2px]",
              "bg-gradient-to-r",
              accentClass
            )}
          />
        )}

        {/* ── Diagonal sheen overlay ── */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0
                     bg-gradient-to-br from-white/[0.06] via-transparent to-transparent"
        />

        {/* ── Content ── */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
export type { GlassCardProps };
