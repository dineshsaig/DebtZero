import Link from "next/link";
import { articles, CATEGORIES, Category } from "./articles";

export const metadata = {
  title: "Learn | DebtZero",
  description:
    "Practical financial education on APR, debt payoff strategies, credit utilization, balance transfers, and more. From Balance to Freedom.",
};

const ALL_CATEGORIES = ["all", "credit", "debt", "budgeting", "planning"] as const;

function ReadingTimeBadge({ minutes }: { minutes: number }) {
  return (
    <span
      style={{
        fontSize: "0.72rem",
        color: "var(--text-muted, #94a3b8)",
        letterSpacing: "0.04em",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {minutes} min read
    </span>
  );
}

function CategoryPill({ category }: { category: Category }) {
  const meta = CATEGORIES[category];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        padding: "0.2rem 0.6rem",
        borderRadius: "999px",
        fontSize: "0.7rem",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: meta.color,
        background: `${meta.color}18`,
        border: `1px solid ${meta.color}30`,
      }}
    >
      {meta.label}
    </span>
  );
}

function ArticleCard({
  article,
}: {
  article: (typeof articles)[number];
}) {
  return (
    <Link
      href={`/learn/${article.slug}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <article
        style={{
          background: "var(--bg-surface, #1e293b)",
          border: "1px solid var(--border-subtle, rgba(255,255,255,0.07))",
          borderRadius: "var(--radius-card, 16px)",
          padding: "1.5rem",
          transition: "border-color 0.2s, transform 0.2s",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
        className="learn-card"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <CategoryPill category={article.category} />
          <ReadingTimeBadge minutes={article.readingTime} />
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: "1.05rem",
            fontWeight: 700,
            color: "var(--text-primary, #f8fafc)",
            lineHeight: 1.35,
          }}
        >
          {article.title}
        </h3>

        <p
          style={{
            margin: 0,
            fontSize: "0.875rem",
            color: "var(--text-secondary, #94a3b8)",
            lineHeight: 1.6,
            flexGrow: 1,
          }}
        >
          {article.subtitle}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--accent-primary, #34d399)",
            fontSize: "0.82rem",
            fontWeight: 600,
            marginTop: "0.25rem",
          }}
        >
          Read article
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </article>
    </Link>
  );
}

export default function LearnPage() {
  const creditArticles = articles.filter((a) => a.category === "credit");
  const debtArticles = articles.filter((a) => a.category === "debt");
  const planningArticles = articles.filter((a) => a.category === "planning");
  const budgetingArticles = articles.filter((a) => a.category === "budgeting");

  const grouped = [
    { label: "Credit", category: "credit" as Category, items: creditArticles },
    { label: "Debt Strategy", category: "debt" as Category, items: debtArticles },
    { label: "Planning", category: "planning" as Category, items: planningArticles },
    ...(budgetingArticles.length ? [{ label: "Budgeting", category: "budgeting" as Category, items: budgetingArticles }] : []),
  ].filter((g) => g.items.length > 0);

  return (
    <>
      <style>{`
        .learn-card:hover {
          border-color: var(--accent-primary, #34d399) !important;
          transform: translateY(-2px);
        }
        .learn-hero-accent {
          background: linear-gradient(135deg, var(--accent-primary, #34d399), #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "2.5rem 1.25rem 4rem",
        }}
      >
        {/* Hero */}
        <section style={{ marginBottom: "3.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.35rem 0.9rem",
              background: "var(--accent-primary, #34d399)14",
              border: "1px solid var(--accent-primary, #34d399)30",
              borderRadius: "999px",
              marginBottom: "1.25rem",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary, #34d399)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--accent-primary, #34d399)",
              }}
            >
              Financial Education
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(1.9rem, 4vw, 2.8rem)",
              fontWeight: 800,
              margin: "0 0 1rem",
              lineHeight: 1.15,
              color: "var(--text-primary, #f8fafc)",
            }}
          >
            Learn{" "}
            <span className="learn-hero-accent">what your lender knows</span>
            <br />
            and you don&apos;t
          </h1>

          <p
            style={{
              fontSize: "1rem",
              color: "var(--text-secondary, #94a3b8)",
              maxWidth: "560px",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Six in-depth guides on the concepts that actually move the needle—APR,
            minimum payments, credit utilization, balance transfers, and more.
            Real numbers, real examples, no fluff.
          </p>
        </section>

        {/* Stats strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
            marginBottom: "3rem",
          }}
        >
          {[
            { value: "6", label: "In-depth guides" },
            { value: "~7", label: "Avg. min read" },
            { value: "100%", label: "Free, always" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "var(--bg-surface, #1e293b)",
                border: "1px solid var(--border-subtle, rgba(255,255,255,0.07))",
                borderRadius: "var(--radius-card, 16px)",
                padding: "1rem 1.25rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "var(--accent-primary, #34d399)",
                  lineHeight: 1.1,
                  marginBottom: "0.25rem",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted, #64748b)",
                  fontWeight: 500,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Grouped articles */}
        {grouped.map((group) => (
          <section key={group.category} style={{ marginBottom: "3rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1.25rem",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "var(--text-primary, #f8fafc)",
                  letterSpacing: "0.01em",
                }}
              >
                {group.label}
              </h2>
              <div
                style={{
                  height: "1px",
                  flex: 1,
                  background: "var(--border-subtle, rgba(255,255,255,0.07))",
                }}
              />
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted, #64748b)",
                  fontWeight: 600,
                }}
              >
                {group.items.length} article{group.items.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1rem",
              }}
            >
              {group.items.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        ))}

        {/* Footer CTA */}
        <div
          style={{
            marginTop: "1rem",
            padding: "2rem",
            background: "linear-gradient(135deg, var(--accent-primary, #34d399)10, #3b82f610)",
            border: "1px solid var(--accent-primary, #34d399)25",
            borderRadius: "var(--radius-card, 16px)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 0.5rem",
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text-primary, #f8fafc)",
            }}
          >
            Ready to put it into practice?
          </p>
          <p
            style={{
              margin: "0 0 1.25rem",
              fontSize: "0.875rem",
              color: "var(--text-secondary, #94a3b8)",
            }}
          >
            Use our calculators to model your own debt payoff scenarios.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { label: "Payoff Calculator", href: "/calculators" },
              { label: "Balance Transfer Analyzer", href: "/balance-transfer" },
              { label: "Budget Planner", href: "/budget" },
            ].map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                style={{
                  padding: "0.55rem 1.1rem",
                  borderRadius: "8px",
                  background: "var(--bg-surface, #1e293b)",
                  border: "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
                  color: "var(--text-primary, #f8fafc)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                {tool.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
