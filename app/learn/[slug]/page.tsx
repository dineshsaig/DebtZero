import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticle, articles, CATEGORIES, Article } from "../articles";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: `${article.title} | DebtZero Learn`,
    description: article.subtitle,
  };
}

// --- Sub-components (server-only, no "use client") ---

function TableOfContents({ article }: { article: Article }) {
  return (
    <nav
      aria-label="Table of contents"
      style={{
        background: "var(--bg-surface, #1e293b)",
        border: "1px solid var(--border-subtle, rgba(255,255,255,0.07))",
        borderRadius: "var(--radius-card, 16px)",
        padding: "1.25rem 1.5rem",
        marginBottom: "1.5rem",
      }}
    >
      <p
        style={{
          margin: "0 0 0.75rem",
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-muted, #64748b)",
        }}
      >
        In this article
      </p>
      <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {article.sections.map((section, i) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "0.6rem",
                color: "var(--text-secondary, #94a3b8)",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: "var(--accent-primary, #34d399)",
                  fontVariantNumeric: "tabular-nums",
                  minWidth: "1.2rem",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {section.heading}
            </a>
          </li>
        ))}
        <li>
          <a
            href="#worked-example"
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "0.6rem",
              color: "var(--text-secondary, #94a3b8)",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}
          >
            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--accent-primary, #34d399)", minWidth: "1.2rem" }}>
              {String(article.sections.length + 1).padStart(2, "0")}
            </span>
            Worked Example
          </a>
        </li>
        <li>
          <a
            href="#common-mistakes"
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "0.6rem",
              color: "var(--text-secondary, #94a3b8)",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}
          >
            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--accent-primary, #34d399)", minWidth: "1.2rem" }}>
              {String(article.sections.length + 2).padStart(2, "0")}
            </span>
            Common Mistakes
          </a>
        </li>
      </ol>
    </nav>
  );
}

function KeyTakeaways({ takeaways }: { takeaways: string[] }) {
  return (
    <aside
      style={{
        background: "linear-gradient(135deg, var(--accent-primary, #34d399)0c, #3b82f60a)",
        border: "1px solid var(--accent-primary, #34d399)28",
        borderRadius: "var(--radius-card, 16px)",
        padding: "1.5rem",
        marginBottom: "2.5rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary, #34d399)" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <h2
          style={{
            margin: 0,
            fontSize: "0.82rem",
            fontWeight: 700,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: "var(--accent-primary, #34d399)",
          }}
        >
          Key Takeaways
        </h2>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {takeaways.map((t, i) => (
          <li
            key={i}
            style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}
          >
            <span
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: "var(--accent-primary, #34d399)20",
                border: "1px solid var(--accent-primary, #34d399)40",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: "1px",
              }}
            >
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="var(--accent-primary, #34d399)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6l3 3 5-5"/>
              </svg>
            </span>
            <span style={{ fontSize: "0.875rem", color: "var(--text-secondary, #94a3b8)", lineHeight: 1.55 }}>
              {t}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function renderBody(body: string): React.ReactElement[] {
  return body.split("\n\n").map((para, i) => {
    // Handle bold markdown inline: **text**
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} style={{ margin: "0 0 1.1rem", fontSize: "0.95rem", color: "var(--text-secondary, #94a3b8)", lineHeight: 1.75 }}>
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j} style={{ color: "var(--text-primary, #f8fafc)", fontWeight: 700 }}>
              {part.slice(2, -2)}
            </strong>
          ) : (
            part
          )
        )}
      </p>
    );
  });
}

function ArticleSection({ section }: { section: Article["sections"][number] }) {
  return (
    <section id={section.id} style={{ marginBottom: "2.5rem", scrollMarginTop: "1.5rem" }}>
      <h2
        style={{
          fontSize: "1.2rem",
          fontWeight: 700,
          color: "var(--text-primary, #f8fafc)",
          margin: "0 0 1rem",
          paddingBottom: "0.6rem",
          borderBottom: "1px solid var(--border-subtle, rgba(255,255,255,0.07))",
        }}
      >
        {section.heading}
      </h2>

      {renderBody(section.body)}

      {section.steps && section.steps.length > 0 && (
        <ol style={{ margin: "1.25rem 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {section.steps.map((step, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "flex-start",
                padding: "1rem 1.25rem",
                background: "var(--bg-surface, #1e293b)",
                border: "1px solid var(--border-subtle, rgba(255,255,255,0.06))",
                borderRadius: "12px",
              }}
            >
              <span
                style={{
                  minWidth: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "var(--accent-primary, #34d399)18",
                  border: "1px solid var(--accent-primary, #34d399)35",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: "var(--accent-primary, #34d399)",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                {i + 1}
              </span>
              <div>
                <p style={{ margin: "0 0 0.2rem", fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary, #f8fafc)" }}>
                  {step.title}
                </p>
                <p style={{ margin: 0, fontSize: "0.845rem", color: "var(--text-secondary, #94a3b8)", lineHeight: 1.6 }}>
                  {step.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function WorkedExample({ example }: { example: Article["workedExample"] }) {
  return (
    <section id="worked-example" style={{ marginBottom: "2.5rem", scrollMarginTop: "1.5rem" }}>
      <h2
        style={{
          fontSize: "1.2rem",
          fontWeight: 700,
          color: "var(--text-primary, #f8fafc)",
          margin: "0 0 1rem",
          paddingBottom: "0.6rem",
          borderBottom: "1px solid var(--border-subtle, rgba(255,255,255,0.07))",
        }}
      >
        {example.title}
      </h2>

      <p style={{ margin: "0 0 1.25rem", fontSize: "0.875rem", color: "var(--text-secondary, #94a3b8)", lineHeight: 1.65 }}>
        {example.scenario}
      </p>

      <div
        style={{
          background: "var(--bg-surface, #1e293b)",
          border: "1px solid var(--border-subtle, rgba(255,255,255,0.07))",
          borderRadius: "12px",
          overflow: "hidden",
          marginBottom: "1.25rem",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {example.rows.map((row, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: i < example.rows.length - 1 ? "1px solid var(--border-subtle, rgba(255,255,255,0.06))" : "none",
                  background: row.highlight ? "var(--accent-primary, #34d399)08" : "transparent",
                }}
              >
                <td
                  style={{
                    padding: "0.7rem 1.25rem",
                    fontSize: "0.845rem",
                    color: row.highlight ? "var(--text-primary, #f8fafc)" : "var(--text-secondary, #94a3b8)",
                    fontWeight: row.highlight ? 600 : 400,
                    width: "60%",
                    borderRight: "1px solid var(--border-subtle, rgba(255,255,255,0.06))",
                  }}
                >
                  {row.label}
                </td>
                <td
                  style={{
                    padding: "0.7rem 1.25rem",
                    fontSize: "0.845rem",
                    fontWeight: 700,
                    color: row.highlight ? "var(--accent-primary, #34d399)" : "var(--text-primary, #f8fafc)",
                    fontVariantNumeric: "tabular-nums",
                    textAlign: "right",
                  }}
                >
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          padding: "1rem 1.25rem",
          background: "var(--bg-surface, #1e293b)",
          border: "1px solid var(--border-subtle, rgba(255,255,255,0.07))",
          borderLeft: "3px solid var(--accent-primary, #34d399)",
          borderRadius: "0 10px 10px 0",
        }}
      >
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary, #94a3b8)", lineHeight: 1.7 }}>
          {example.conclusion}
        </p>
      </div>
    </section>
  );
}

function CommonMistakes({ mistakes }: { mistakes: string[] }) {
  return (
    <section id="common-mistakes" style={{ marginBottom: "2.5rem", scrollMarginTop: "1.5rem" }}>
      <h2
        style={{
          fontSize: "1.2rem",
          fontWeight: 700,
          color: "var(--text-primary, #f8fafc)",
          margin: "0 0 1rem",
          paddingBottom: "0.6rem",
          borderBottom: "1px solid var(--border-subtle, rgba(255,255,255,0.07))",
        }}
      >
        Common Mistakes to Avoid
      </h2>

      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {mistakes.map((mistake, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "flex-start",
              padding: "0.85rem 1.1rem",
              background: "#ef444408",
              border: "1px solid #ef444420",
              borderRadius: "10px",
            }}
          >
            <span style={{ flexShrink: 0, marginTop: "2px" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M15 9l-6 6M9 9l6 6"/>
              </svg>
            </span>
            <span style={{ fontSize: "0.875rem", color: "var(--text-secondary, #94a3b8)", lineHeight: 1.6 }}>
              {mistake}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RelatedTool({ tool }: { tool: NonNullable<Article["relatedTool"]> }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, var(--accent-primary, #34d399)10, #3b82f610)",
        border: "1px solid var(--accent-primary, #34d399)25",
        borderRadius: "var(--radius-card, 16px)",
        padding: "1.5rem",
        marginBottom: "2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      <div>
        <p style={{ margin: "0 0 0.2rem", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--accent-primary, #34d399)" }}>
          Put this into practice
        </p>
        <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary, #f8fafc)" }}>
          {tool.label}
        </p>
      </div>
      <Link
        href={tool.href}
        style={{
          padding: "0.6rem 1.2rem",
          background: "var(--accent-primary, #34d399)",
          color: "#0a0f1e",
          borderRadius: "8px",
          fontWeight: 700,
          fontSize: "0.85rem",
          textDecoration: "none",
          whiteSpace: "nowrap",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        Open tool
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </Link>
    </div>
  );
}

function ArticleNav({ current }: { current: Article }) {
  const idx = articles.findIndex((a) => a.slug === current.slug);
  const prev = idx > 0 ? articles[idx - 1] : null;
  const next = idx < articles.length - 1 ? articles[idx + 1] : null;

  if (!prev && !next) return null;

  return (
    <nav
      style={{
        display: "grid",
        gridTemplateColumns: prev && next ? "1fr 1fr" : "1fr",
        gap: "0.75rem",
        marginTop: "2.5rem",
        paddingTop: "2rem",
        borderTop: "1px solid var(--border-subtle, rgba(255,255,255,0.07))",
      }}
    >
      {prev && (
        <Link
          href={`/learn/${prev.slug}`}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.3rem",
            padding: "1rem 1.25rem",
            background: "var(--bg-surface, #1e293b)",
            border: "1px solid var(--border-subtle, rgba(255,255,255,0.07))",
            borderRadius: "12px",
            textDecoration: "none",
          }}
        >
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted, #64748b)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Previous
          </span>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary, #f8fafc)", lineHeight: 1.35 }}>
            {prev.title}
          </span>
        </Link>
      )}
      {next && (
        <Link
          href={`/learn/${next.slug}`}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.3rem",
            padding: "1rem 1.25rem",
            background: "var(--bg-surface, #1e293b)",
            border: "1px solid var(--border-subtle, rgba(255,255,255,0.07))",
            borderRadius: "12px",
            textDecoration: "none",
            textAlign: "right",
            marginLeft: !prev ? "auto" : undefined,
          }}
        >
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted, #64748b)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem", justifyContent: "flex-end" }}>
            Next
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary, #f8fafc)", lineHeight: 1.35 }}>
            {next.title}
          </span>
        </Link>
      )}
    </nav>
  );
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    notFound();
  }

  const categoryMeta = CATEGORIES[article.category];

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "2rem 1.25rem 4rem",
      }}
    >
      {/* Breadcrumb */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "2rem",
          fontSize: "0.8rem",
          color: "var(--text-muted, #64748b)",
        }}
      >
        <Link href="/learn" style={{ color: "var(--text-muted, #64748b)", textDecoration: "none", fontWeight: 500 }}>
          Learn
        </Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
        <span style={{ color: categoryMeta.color, fontWeight: 600 }}>{categoryMeta.label}</span>
      </nav>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr min(240px, 28%)",
          gap: "2.5rem",
          alignItems: "start",
        }}
        className="article-grid"
      >
        {/* Main content */}
        <div>
          {/* Header */}
          <header style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.2rem 0.65rem",
                  borderRadius: "999px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: categoryMeta.color,
                  background: `${categoryMeta.color}18`,
                  border: `1px solid ${categoryMeta.color}30`,
                }}
              >
                {categoryMeta.label}
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #64748b)", fontWeight: 500 }}>
                {article.readingTime} min read
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)",
                fontWeight: 800,
                color: "var(--text-primary, #f8fafc)",
                margin: "0 0 0.85rem",
                lineHeight: 1.2,
              }}
            >
              {article.title}
            </h1>

            <p
              style={{
                fontSize: "1rem",
                color: "var(--text-secondary, #94a3b8)",
                margin: 0,
                lineHeight: 1.65,
              }}
            >
              {article.subtitle}
            </p>
          </header>

          {/* Key Takeaways */}
          <KeyTakeaways takeaways={article.keyTakeaways} />

          {/* Sections */}
          {article.sections.map((section) => (
            <ArticleSection key={section.id} section={section} />
          ))}

          {/* Worked Example */}
          <WorkedExample example={article.workedExample} />

          {/* Common Mistakes */}
          <CommonMistakes mistakes={article.commonMistakes} />

          {/* Related Tool CTA */}
          {article.relatedTool && <RelatedTool tool={article.relatedTool} />}

          {/* Article Navigation */}
          <ArticleNav current={article} />
        </div>

        {/* Sidebar */}
        <aside style={{ position: "sticky", top: "1.5rem" }} className="article-sidebar">
          <TableOfContents article={article} />

          {/* All articles */}
          <div
            style={{
              background: "var(--bg-surface, #1e293b)",
              border: "1px solid var(--border-subtle, rgba(255,255,255,0.07))",
              borderRadius: "var(--radius-card, 16px)",
              padding: "1.25rem 1.5rem",
            }}
          >
            <p
              style={{
                margin: "0 0 0.75rem",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted, #64748b)",
              }}
            >
              All articles
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.1rem" }}>
              {articles.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/learn/${a.slug}`}
                    style={{
                      display: "block",
                      padding: "0.45rem 0.5rem",
                      fontSize: "0.82rem",
                      fontWeight: a.slug === article.slug ? 700 : 500,
                      color: a.slug === article.slug ? "var(--accent-primary, #34d399)" : "var(--text-secondary, #94a3b8)",
                      textDecoration: "none",
                      borderRadius: "6px",
                      background: a.slug === article.slug ? "var(--accent-primary, #34d399)10" : "transparent",
                      lineHeight: 1.4,
                    }}
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .article-grid {
            grid-template-columns: 1fr !important;
          }
          .article-sidebar {
            position: static !important;
            order: -1;
          }
        }
      `}</style>
    </main>
  );
}
