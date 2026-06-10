import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DebtZero — From Balance to Freedom",
    template: "%s | DebtZero",
  },
  description:
    "DebtZero helps you plan your way out of debt with proven strategies, clear calculators, and financial education. From balance to freedom.",
  keywords: [
    "debt payoff",
    "debt snowball",
    "debt avalanche",
    "budget planner",
    "financial freedom",
    "credit card payoff",
    "debt calculator",
  ],
  authors: [{ name: "DebtZero" }],
  creator: "DebtZero",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://debtzero.app",
    siteName: "DebtZero",
    title: "DebtZero — From Balance to Freedom",
    description:
      "Plan your path out of debt with proven strategies and clear guidance.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DebtZero — From Balance to Freedom",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DebtZero — From Balance to Freedom",
    description:
      "Plan your path out of debt with proven strategies and clear guidance.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}

/* ─── Inline Header ─────────────────────────────────────────────── */
function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "rgba(13, 27, 42, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="section-wrapper flex items-center justify-between py-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <LogoMark />
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "1.125rem",
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            Debt
            <span style={{ color: "var(--accent-mint)" }}>Zero</span>
          </span>
        </a>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: "Strategies", href: "/strategies" },
            { label: "Calculators", href: "/calculators" },
            { label: "Learn", href: "/learn" },
          ].map((item) => (
            <a key={item.href} href={item.href} className="btn-ghost">
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="btn-primary">
            Get Started
            <ArrowRightIcon />
          </a>
        </div>
      </div>
    </header>
  );
}

/* ─── Inline Footer ─────────────────────────────────────────────── */
function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-base)",
      }}
    >
      <div className="section-wrapper py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LogoMark size={18} />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "var(--text-primary)",
                }}
              >
                Debt<span style={{ color: "var(--accent-mint)" }}>Zero</span>
              </span>
            </div>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-faint)",
                maxWidth: "260px",
                lineHeight: 1.5,
              }}
            >
              Educational tools for debt payoff planning. Not financial advice.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              "Strategies",
              "Calculators",
              "Learn",
              "Privacy",
              "Terms",
            ].map((item) => (
              <a
                key={item}
                href={`/${item.toLowerCase()}`}
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-faint)",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-muted)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-faint)")
                }
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        <div className="divider my-6" />

        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-faint)",
            textAlign: "center",
          }}
        >
          © {new Date().getFullYear()} DebtZero. For educational purposes only.
          Always consult a qualified financial advisor for personal advice.
        </p>
      </div>
    </footer>
  );
}

/* ─── Micro-components ───────────────────────────────────────────── */
function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="10" stroke="var(--accent-mint)" strokeWidth="1.5" />
      <path
        d="M7 11h8M11 7l4 4-4 4"
        stroke="var(--accent-mint)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2 7h10M8 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
