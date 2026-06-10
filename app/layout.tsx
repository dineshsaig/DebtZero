import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";

export const metadata: Metadata = {
  title: {
    default: "DebtZero — From Balance to Freedom",
    template: "%s | DebtZero",
  },
  description:
    "DebtZero helps you plan your way out of debt with proven strategies, clear calculators, and financial education. From balance to freedom.",
  keywords: ["debt payoff", "debt snowball", "debt avalanche", "budget planner", "financial freedom"],
  authors: [{ name: "DebtZero" }],
  creator: "DebtZero",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://debtzero.app",
    siteName: "DebtZero",
    title: "DebtZero — From Balance to Freedom",
    description: "Plan your path out of debt with proven strategies and clear guidance.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main style={{ flex: 1 }}>{children}</main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        background: "rgba(13,27,42,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="section-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
          <LogoMark />
          <span style={{ fontWeight: 700, fontSize: "1.125rem", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
            Debt<span style={{ color: "var(--accent-primary)" }}>Zero</span>
          </span>
        </a>

        <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          {[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Strategies", href: "/strategies" },
            { label: "Learn", href: "/learn" },
          ].map((item) => (
            <a key={item.href} href={item.href} className="btn-ghost" style={{ fontSize: "0.875rem" }}>
              {item.label}
            </a>
          ))}
          <a
            href="/settings"
            className="btn-ghost"
            style={{ fontSize: "0.875rem", marginLeft: "0.25rem" }}
            title="Appearance settings"
          >
            <SettingsIcon />
          </a>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-base)" }}>
      <div className="section-wrapper" style={{ padding: "2.5rem 1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "1.5rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <LogoMark size={18} />
                <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                  Debt<span style={{ color: "var(--accent-primary)" }}>Zero</span>
                </span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-faint)", maxWidth: "260px", lineHeight: 1.5 }}>
                Educational tools for debt payoff planning. Not financial advice.
              </p>
            </div>
            <nav style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "flex-start" }}>
              {[["Dashboard", "/dashboard"], ["Strategies", "/strategies"], ["Learn", "/learn"], ["Settings", "/settings"], ["Privacy", "/privacy"]].map(([label, href]) => (
                <a key={href} href={href} style={{ fontSize: "0.8rem", color: "var(--text-faint)", textDecoration: "none" }}>{label}</a>
              ))}
            </nav>
          </div>
          <div style={{ height: 1, background: "var(--border-subtle)" }} />
          <p style={{ fontSize: "0.75rem", color: "var(--text-faint)", textAlign: "center" }}>
            © {new Date().getFullYear()} DebtZero. For educational purposes only. Always consult a qualified financial advisor.
          </p>
        </div>
      </div>
    </footer>
  );
}

function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="10" stroke="var(--accent-primary)" strokeWidth="1.5" />
      <path d="M7 11h8M11 7l4 4-4 4" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
