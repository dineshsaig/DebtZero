"use client";

import {
  useTheme,
  ACCENT_TOKENS,
  type AccentColor,
  type CardStyle,
  type RadiusScale,
  type ColorMode,
} from "@/lib/theme";

export default function SettingsPage() {
  const { settings, update, reset, effectiveMode } = useTheme();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>

      {/* Page header */}
      <div style={{ background: "var(--bg-base)", borderBottom: "1px solid var(--border-subtle)", padding: "1.5rem 0" }}>
        <div className="section-wrapper">
          <h1 style={{ fontSize: "1.375rem", fontWeight: 700, letterSpacing: "-0.025em", margin: 0 }}>
            Appearance
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
            Customize how DebtZero looks and feels
          </p>
        </div>
      </div>

      <div className="section-wrapper" style={{ padding: "2rem 1.5rem", maxWidth: "760px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* ── Color Mode ── */}
          <SettingsSection title="Theme" description="Choose between dark, light, or follow your system setting.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
              {([
                { value: "dark",  label: "Dark",  icon: "🌙", preview: ["#0D1B2A", "#1C2E40", "#253A50"] },
                { value: "light", label: "Light", icon: "☀️", preview: ["#FFFFFF", "#F7FAFC", "#EDF2F7"] },
                { value: "auto",  label: "Auto",  icon: "💻", preview: ["#0D1B2A", "#FFFFFF", "#8DA0B3"] },
              ] as { value: ColorMode; label: string; icon: string; preview: string[] }[]).map((mode) => (
                <ModeCard
                  key={mode.value}
                  label={mode.label}
                  icon={mode.icon}
                  preview={mode.preview}
                  active={settings.colorMode === mode.value}
                  onClick={() => update("colorMode", mode.value)}
                />
              ))}
            </div>
          </SettingsSection>

          {/* ── Accent Color ── */}
          <SettingsSection title="Accent Color" description="Sets the primary interactive color across the app.">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {(Object.entries(ACCENT_TOKENS) as [AccentColor, typeof ACCENT_TOKENS[AccentColor]][]).map(
                ([key, token]) => (
                  <AccentSwatch
                    key={key}
                    name={key}
                    color={token.primary}
                    glow={token.glow}
                    active={settings.accent === key}
                    onClick={() => update("accent", key)}
                  />
                )
              )}
            </div>

            {/* Live preview of accent */}
            <div style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "var(--bg-elevated)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}>
              <button className="btn-primary" style={{ fontSize: "0.8rem", padding: "0.45rem 1rem" }}>
                Primary button
              </button>
              <div style={{
                width: 120, height: 4,
                background: "var(--bg-surface)",
                borderRadius: 2,
                overflow: "hidden",
              }}>
                <div style={{
                  width: "60%", height: "100%",
                  background: `linear-gradient(90deg, var(--accent-primary), var(--accent-hover))`,
                  boxShadow: `0 0 8px var(--accent-glow)`,
                  borderRadius: 2,
                }} />
              </div>
              <span className="badge badge-mint" style={{ fontSize: "0.65rem" }}>
                {settings.accent}
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: 600 }}>
                {ACCENT_TOKENS[settings.accent].primary}
              </span>
            </div>
          </SettingsSection>

          {/* ── Card Style ── */}
          <SettingsSection title="Card Style" description="Choose between solid flat cards or frosted glass.">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <CardStyleOption
                value="flat"
                label="Flat"
                description="Clean, opaque surface. Clear and focused."
                active={settings.cardStyle === "flat"}
                isDark={effectiveMode === "dark"}
                onClick={() => update("cardStyle", "flat")}
              />
              <CardStyleOption
                value="glass"
                label="Glass"
                description="Frosted glass with blur. Layered and modern."
                active={settings.cardStyle === "glass"}
                isDark={effectiveMode === "dark"}
                onClick={() => update("cardStyle", "glass")}
              />
            </div>
          </SettingsSection>

          {/* ── Border Radius ── */}
          <SettingsSection title="Border Radius" description="Controls the roundness of cards, buttons, and inputs.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
              {([
                { value: "sharp",   label: "Sharp",   px: "8px",  demo: 4  },
                { value: "rounded", label: "Rounded", px: "16px", demo: 10 },
                { value: "soft",    label: "Soft",    px: "24px", demo: 18 },
              ] as { value: RadiusScale; label: string; px: string; demo: number }[]).map((r) => (
                <RadiusOption
                  key={r.value}
                  label={r.label}
                  px={r.px}
                  demo={r.demo}
                  active={settings.radius === r.value}
                  onClick={() => update("radius", r.value)}
                />
              ))}
            </div>
          </SettingsSection>

          {/* ── Behavior Toggles ── */}
          <SettingsSection title="Behavior" description="Fine-tune motion, density, and accessibility.">
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              <Toggle
                label="Animations"
                description="Smooth transitions and hover effects"
                value={settings.animations}
                onChange={(v) => update("animations", v)}
              />
              <Toggle
                label="Compact mode"
                description="Reduce padding and font size for more content density"
                value={settings.compactMode}
                onChange={(v) => update("compactMode", v)}
              />
              <Toggle
                label="Reduce motion"
                description="Minimize movement for vestibular sensitivity"
                value={settings.reducedMotion}
                onChange={(v) => update("reducedMotion", v)}
              />
              <Toggle
                label="High contrast"
                description="Increase border visibility for low-vision accessibility"
                value={settings.highContrast}
                onChange={(v) => update("highContrast", v)}
                last
              />
            </div>
          </SettingsSection>

          {/* ── Token reference ── */}
          <SettingsSection title="Current tokens" description="Live CSS custom property values for the active theme.">
            <TokenGrid effectiveMode={effectiveMode} settings={settings} />
          </SettingsSection>

          {/* Reset */}
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "0.5rem" }}>
            <button
              className="btn-secondary"
              onClick={reset}
              style={{ fontSize: "0.875rem", color: "var(--accent-ember)", borderColor: "rgba(255,107,107,0.3)" }}
            >
              Reset to defaults
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: "var(--card-bg, var(--bg-surface))",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      padding: "var(--space-card, 1.5rem)",
      backdropFilter: "var(--card-backdrop, none)",
      WebkitBackdropFilter: "var(--card-backdrop, none)",
    }}>
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.2rem" }}>{title}</div>
        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{description}</div>
      </div>
      {children}
    </div>
  );
}

function ModeCard({
  label, icon, preview, active, onClick,
}: {
  label: string; icon: string; preview: string[]; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.6rem",
        padding: "0.875rem 0.75rem",
        borderRadius: "var(--radius-md)",
        border: `1px solid ${active ? "var(--accent-primary)" : "var(--border-subtle)"}`,
        background: active ? "rgba(var(--accent-rgb,0,201,167),0.08)" : "var(--bg-elevated)",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {/* Mini theme preview */}
      <div style={{ display: "flex", gap: "3px" }}>
        {preview.map((c, i) => (
          <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: c, border: "1px solid rgba(255,255,255,0.08)" }} />
        ))}
      </div>
      <span style={{ fontSize: "1rem" }}>{icon}</span>
      <span style={{ fontSize: "0.8rem", fontWeight: active ? 600 : 500, color: active ? "var(--accent-primary)" : "var(--text-muted)" }}>
        {label}
      </span>
    </button>
  );
}

function AccentSwatch({
  name, color, glow, active, onClick,
}: {
  name: string; color: string; glow: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={name}
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: color,
        border: `2px solid ${active ? "var(--text-primary)" : "transparent"}`,
        outline: active ? `3px solid ${color}` : "none",
        outlineOffset: 2,
        boxShadow: active ? `0 0 12px ${glow}` : "none",
        cursor: "pointer",
        transition: "all 0.15s",
        flexShrink: 0,
      }}
    />
  );
}

function CardStyleOption({
  value, label, description, active, isDark, onClick,
}: {
  value: CardStyle; label: string; description: string; active: boolean; isDark: boolean; onClick: () => void;
}) {
  const isGlass = value === "glass";
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        padding: "1rem",
        borderRadius: "var(--radius-md)",
        border: `1px solid ${active ? "var(--accent-primary)" : "var(--border-subtle)"}`,
        background: active ? "rgba(var(--accent-rgb,0,201,167),0.06)" : "var(--bg-elevated)",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {/* Card preview */}
      <div style={{
        height: 48,
        borderRadius: 8,
        marginBottom: "0.75rem",
        border: `1px solid ${isGlass ? "rgba(255,255,255,0.12)" : "rgba(141,160,179,0.15)"}`,
        background: isGlass
          ? isDark ? "rgba(28,46,64,0.5)" : "rgba(255,255,255,0.5)"
          : isDark ? "#1C2E40" : "#F7FAFC",
        backdropFilter: isGlass ? "blur(8px)" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
      }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ width: 20, height: 6, borderRadius: 3, background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" }} />
        ))}
      </div>
      <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.25rem", color: active ? "var(--accent-primary)" : "var(--text-primary)" }}>
        {label}
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.4 }}>{description}</div>
    </button>
  );
}

function RadiusOption({
  label, px, demo, active, onClick,
}: {
  label: string; px: string; demo: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.6rem",
        padding: "0.875rem 0.5rem",
        borderRadius: "var(--radius-md)",
        border: `1px solid ${active ? "var(--accent-primary)" : "var(--border-subtle)"}`,
        background: active ? "rgba(var(--accent-rgb,0,201,167),0.08)" : "var(--bg-elevated)",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {/* Shape demo */}
      <div style={{ width: 40, height: 28, background: active ? "var(--accent-primary)" : "var(--bg-overlay)", borderRadius: demo, opacity: active ? 1 : 0.5, transition: "all 0.15s" }} />
      <span style={{ fontSize: "0.8rem", fontWeight: active ? 600 : 500, color: active ? "var(--accent-primary)" : "var(--text-muted)" }}>
        {label}
      </span>
      <span style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>{px}</span>
    </button>
  );
}

function Toggle({
  label, description, value, onChange, last = false,
}: {
  label: string; description: string; value: boolean; onChange: (v: boolean) => void; last?: boolean;
}) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1rem",
      padding: "0.875rem 0",
      borderBottom: last ? "none" : "1px solid var(--border-subtle)",
    }}>
      <div>
        <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>{label}</div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>{description}</div>
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          border: "none",
          background: value ? "var(--accent-primary)" : "var(--bg-overlay)",
          cursor: "pointer",
          position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
          boxShadow: value ? `0 0 8px var(--accent-glow)` : "none",
        }}
      >
        <span style={{
          position: "absolute",
          top: 2,
          left: value ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }} />
      </button>
    </div>
  );
}

function TokenGrid({ effectiveMode, settings }: {
  effectiveMode: "dark" | "light";
  settings: ReturnType<typeof useTheme>["settings"];
}) {
  const accent = ACCENT_TOKENS[settings.accent];
  const tokens = [
    { label: "Background",        token: "--bg-primary",    desc: "Page background" },
    { label: "Surface",           token: "--bg-surface",    desc: "Card background" },
    { label: "Surface Secondary", token: "--bg-elevated",   desc: "Hover / elevated" },
    { label: "Text Primary",      token: "--text-primary",  desc: "Headings" },
    { label: "Text Secondary",    token: "--text-muted",    desc: "Body copy" },
    { label: "Border",            token: "--border-default",desc: "Default border" },
    { label: "Accent Primary",    token: accent.primary,    desc: "Interactive color", isValue: true },
    { label: "Accent Hover",      token: accent.hover,      desc: "Hover state", isValue: true },
    { label: "Accent Glow",       token: accent.glow,       desc: "Glow / shadow", isValue: true },
  ];

  const isDark = effectiveMode === "dark";
  const colorMap: Record<string, string> = {
    "--bg-primary":     isDark ? "#0D1B2A" : "#FFFFFF",
    "--bg-surface":     isDark ? "#1C2E40" : "#F7FAFC",
    "--bg-elevated":    isDark ? "#253A50" : "#EDF2F7",
    "--text-primary":   isDark ? "#EDF2F7" : "#0D1B2A",
    "--text-muted":     isDark ? "#8DA0B3" : "#4A5568",
    "--border-default": isDark ? "rgba(141,160,179,0.22)" : "rgba(0,0,0,0.12)",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.5rem" }}>
      {tokens.map((t) => {
        const displayColor = t.isValue ? t.token : (colorMap[t.token] ?? "#888");
        return (
          <div key={t.label} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)" }}>
            <div style={{ width: 20, height: 20, borderRadius: 4, background: displayColor, border: "1px solid var(--border-subtle)", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-primary)" }}>{t.label}</div>
              <div style={{ fontSize: "0.62rem", color: "var(--text-faint)", fontFamily: "monospace" }}>{displayColor.slice(0, 18)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
