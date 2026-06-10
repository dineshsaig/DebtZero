"use client";

interface Props {
  label: string;
  value: string;
  sub: string;
  accent: string;
  negative?: boolean;
}

export default function BudgetSummaryCard({ label, value, sub, accent, negative = false }: Props) {
  return (
    <div className="summary-card">
      <p className="summary-label">{label}</p>
      <p className="summary-value" style={{ color: accent }}>
        {negative && <span className="summary-neg">−</span>}
        {value}
      </p>
      <p className="summary-sub">{sub}</p>

      {/* Accent bar at bottom */}
      <div className="summary-accent-bar" style={{ background: accent }} />

      <style>{`
        .summary-card {
          position: relative;
          background: var(--bg-surface, #1a1f2e);
          border: 1px solid var(--border-subtle, rgba(255,255,255,0.08));
          border-radius: var(--radius-card, 14px);
          padding: 1.125rem 1rem 1rem;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .summary-label {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-secondary, #94a3b8);
          margin: 0;
        }
        .summary-value {
          font-size: 1.3125rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0;
          line-height: 1.2;
        }
        .summary-neg {
          opacity: 0.7;
          margin-right: 1px;
        }
        .summary-sub {
          font-size: 0.75rem;
          color: var(--text-secondary, #94a3b8);
          margin: 0;
        }
        .summary-accent-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2.5px;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
