import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DebtZero — From Balance to Freedom",
  description:
    "Free educational tools to plan your debt payoff journey. Compare strategies, run calculations, and build financial confidence.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <FeaturesSection />
      <StrategyPreviewSection />
      <EducationTeaser />
      <CtaBanner />
    </>
  );
}

function HeroSection() {
  return (
    <section
      style={{
        background: "var(--bg-primary)",
        position: "relative",
        overflow: "hidden",
        paddingTop: "6rem",
        paddingBottom: "5rem",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,201,167,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,201,167,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-60px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "300px",
          background: "radial-gradient(ellipse, rgba(0,201,167,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="section-wrapper" style={{ position: "relative" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <span className="badge badge-mint">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-mint)", display: "inline-block" }} />
              Free educational tool
            </span>
          </div>

          <h1
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2.25rem, 6vw, 3.75rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.035em",
              color: "var(--text-primary)",
              marginBottom: "1.25rem",
            }}
          >
            Your debt has a{" "}
            <span
              style={{
                fontFamily: "DM Serif Display, Georgia, serif",
                fontStyle: "italic",
                background: "linear-gradient(135deg, var(--accent-mint) 0%, var(--accent-mint-light) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              finish line.
            </span>
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              color: "var(--text-muted)",
              lineHeight: 1.65,
              maxWidth: "520px",
              margin: "0 auto 2.5rem",
            }}
          >
            DebtZero helps you understand your options, compare payoff strategies,
            and build a plan that actually works — without judgment or jargon.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              justifyContent: "center",
              marginBottom: "3.5rem",
            }}
          >
            <a href="/dashboard" className="btn-primary" style={{ fontSize: "1rem", padding: "0.8rem 2rem" }}>
              Build my plan
            </a>
            <a href="/learn" className="btn-secondary" style={{ fontSize: "1rem", padding: "0.8rem 1.75rem" }}>
              Learn strategies
            </a>
          </div>

          <DebtMeterHero />
        </div>
      </div>
    </section>
  );
}

function DebtMeterHero() {
  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "0 auto",
        padding: "1.5rem 2rem",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
        <span className="stat-label">Total debt</span>
        <span className="stat-label" style={{ color: "var(--accent-mint)" }}>Paid off</span>
      </div>

      <div style={{ width: "100%", height: "2px", background: "var(--border-subtle)", borderRadius: "1px", position: "relative", marginBottom: "0.75rem" }}>
        <div
          style={{
            width: "42%",
            height: "100%",
            background: "linear-gradient(90deg, var(--accent-mint) 0%, var(--accent-mint-light) 100%)",
            borderRadius: "1px",
            boxShadow: "0 0 10px var(--accent-mint)",
            position: "relative",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              right: -4,
              top: "50%",
              transform: "translateY(-50%)",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--accent-mint)",
              boxShadow: "0 0 8px var(--accent-mint), 0 0 3px white",
              display: "block",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div className="stat-value" style={{ fontSize: "1.75rem", color: "var(--accent-ember)" }}>$14,200</div>
          <div className="stat-label">remaining</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div className="stat-value" style={{ fontSize: "1.25rem", color: "var(--text-muted)" }}>42%</div>
          <div className="stat-label">complete</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="stat-value" style={{ fontSize: "1.75rem", color: "var(--accent-mint)" }}>$10,300</div>
          <div className="stat-label">paid off</div>
        </div>
      </div>

      <div className="divider" style={{ margin: "1rem 0 0.75rem" }} />
      <p style={{ fontSize: "0.75rem", color: "var(--text-faint)", textAlign: "center" }}>
        Example plan · Enter your numbers to see your path
      </p>
    </div>
  );
}

function TrustBar() {
  const items = [
    { value: "No ads", label: "ever" },
    { value: "No sign-up", label: "required" },
    { value: "100%", label: "free" },
    { value: "Private", label: "your data stays local" },
  ];

  return (
    <div style={{ background: "var(--bg-base)", borderBottom: "1px solid var(--border-subtle)", padding: "1rem 0" }}>
      <div className="section-wrapper">
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2rem" }}>
          {items.map((item) => (
            <div key={item.value} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckIcon />
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{item.value}</strong>{" "}{item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturesSection() {
  const features = [
    { icon: "⚡", title: "Payoff Calculators", description: "See exactly how long each debt takes to pay off and how much interest you'll save by paying more than the minimum.", href: "/calculators", tag: "Interactive" },
    { icon: "⚖️", title: "Strategy Comparison", description: "Avalanche vs Snowball vs custom — compare approaches side by side and pick the one that fits your goals.", href: "/strategies", tag: "Educational" },
    { icon: "📊", title: "Budget Planner", description: "Allocate your income across essentials, debt repayment, savings, and life — with a framework that adapts to your situation.", href: "/budget", tag: "Coming soon" },
    { icon: "🔄", title: "Balance Transfer Guide", description: "Understand when 0% APR promotions actually help, how to calculate transfer fees, and what to watch out for.", href: "/learn/balance-transfers", tag: "Educational" },
    { icon: "🎓", title: "Financial Literacy", description: "Plain-English explanations of APR, compounding interest, credit utilization, and everything that affects your financial life.", href: "/learn", tag: "Learn" },
    { icon: "🗺️", title: "Payoff Roadmap", description: "A month-by-month view of your debt-free journey, so you can see light at the end of the tunnel.", href: "/dashboard", tag: "Dashboard" },
  ];

  return (
    <section style={{ padding: "5rem 0", background: "var(--bg-primary)" }}>
      <div className="section-wrapper">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span className="tag" style={{ display: "block", marginBottom: "0.75rem" }}>What DebtZero offers</span>
          <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", fontWeight: 700, letterSpacing: "-0.025em", marginBottom: "0.75rem" }}>
            Everything you need to get to zero
          </h2>
          <p style={{ color: "var(--text-muted)", maxWidth: "480px", margin: "0 auto" }}>
            Practical tools and education — no upsells, no confusing dashboards, no pressure.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {features.map((f) => (
            <a key={f.title} href={f.href} className="card" style={{ display: "block", textDecoration: "none" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>{f.icon}</div>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{f.title}</h3>
                <span className="badge" style={{ flexShrink: 0, fontSize: "0.65rem" }}>{f.tag}</span>
              </div>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>{f.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function StrategyPreviewSection() {
  return (
    <section style={{ padding: "5rem 0", background: "var(--bg-base)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
      <div className="section-wrapper">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", alignItems: "start" }}>
          <div>
            <span className="tag" style={{ display: "block", marginBottom: "0.75rem" }}>The two main strategies</span>
            <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)", fontWeight: 700, letterSpacing: "-0.025em", marginBottom: "1rem" }}>
              Avalanche or Snowball?
            </h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", lineHeight: 1.65 }}>
              Both methods work. The right one depends on your financial situation and your psychology. DebtZero helps you understand both — then decide.
            </p>
            <a href="/strategies" className="btn-secondary">Compare strategies →</a>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <StrategyCard name="Avalanche" tagline="Mathematically optimal" description="Pay minimums on all debts. Put every extra dollar toward the highest interest rate first. Minimizes total interest paid." highlight="Best for: saving the most money" color="var(--accent-mint)" />
            <StrategyCard name="Snowball" tagline="Psychologically powerful" description="Pay minimums on all debts. Put every extra dollar toward the smallest balance first. Builds momentum with quick wins." highlight="Best for: staying motivated" color="var(--accent-gold)" />
          </div>
        </div>
      </div>
    </section>
  );
}

function StrategyCard({ name, tagline, description, highlight, color }: { name: string; tagline: string; description: string; highlight: string; color: string }) {
  return (
    <div className="card" style={{ borderLeft: `2px solid ${color}`, paddingLeft: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
        <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>{name}</span>
        <span className="tag">{tagline}</span>
      </div>
      <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.75rem", lineHeight: 1.55 }}>{description}</p>
      <span style={{ fontSize: "0.75rem", fontWeight: 600, color, display: "block" }}>{highlight}</span>
    </div>
  );
}

function EducationTeaser() {
  const topics = [
    { title: "How APR actually works", slug: "apr" },
    { title: "Minimum payments: the hidden trap", slug: "minimum-payments" },
    { title: "Credit utilization explained", slug: "credit-utilization" },
    { title: "When balance transfers make sense", slug: "balance-transfers" },
    { title: "Building an emergency fund while in debt", slug: "emergency-fund" },
    { title: "Debt-to-income ratio, demystified", slug: "dti" },
  ];

  return (
    <section style={{ padding: "5rem 0", background: "var(--bg-primary)" }}>
      <div className="section-wrapper">
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span className="tag" style={{ display: "block", marginBottom: "0.75rem" }}>Financial literacy</span>
          <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)", fontWeight: 700, letterSpacing: "-0.025em" }}>
            Learn what the fine print doesn&apos;t tell you
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "0.75rem" }}>
          {topics.map((topic) => (
            <a
              key={topic.slug}
              href={`/learn/${topic.slug}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.875rem 1rem",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              <span style={{ color: "var(--accent-mint)", flexShrink: 0 }}>→</span>
              {topic.title}
            </a>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <a href="/learn" className="btn-ghost" style={{ color: "var(--accent-mint)" }}>
            View all topics →
          </a>
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section style={{ padding: "5rem 0", background: "var(--bg-base)", borderTop: "1px solid var(--border-subtle)" }}>
      <div className="section-wrapper">
        <div style={{ maxWidth: "560px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)", fontWeight: 700, letterSpacing: "-0.025em", marginBottom: "1rem" }}>
            Your next payment is the first step.
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem", lineHeight: 1.65 }}>
            No account needed. Enter your debts and see your personalized payoff timeline in under two minutes.
          </p>
          <a href="/dashboard" className="btn-primary" style={{ fontSize: "1rem", padding: "0.9rem 2.25rem" }}>
            Start for free — no sign-up
          </a>
          <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--text-faint)" }}>
            Your data stays in your browser. Nothing is stored on our servers.
          </p>
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6.5" stroke="var(--accent-mint)" strokeWidth="1" />
      <path d="M4.5 7l2 2 3-3" stroke="var(--accent-mint)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
