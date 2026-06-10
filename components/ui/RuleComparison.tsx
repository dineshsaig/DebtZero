"use client";

import { formatCurrency, formatPercent } from "@/lib/utils";

interface Props {
  income: number;
  needs: number;
  wants: number;
  savings: number;
}

interface RuleBucket {
  label: string;
  target: number;
  ideal: number;
  actual: number;
  color: string;
  description: string;
}

export default function RuleComparison({ income, needs, wants, savings }: Props) {
  const buckets: RuleBucket[] = [
    {
      label: "Needs",
      target: 0.5,
      ideal: income * 0.5,
      actual: needs,
      color: "#6366f1",
      description: "Housing, food, transport, utilities, healthcare, debt",
    },
    {
      label: "Wants",
      target: 0.3,
      ideal: income * 0.3,
      actual: wants,
      color: "#10b981",
      description: "Entertainment, personal care, dining out, hobbies",
    },
    {
      label: "Savings",
      target: 0.2,
      ideal: income * 0.2,
      actual: savings,
      color: "#06b6d4",
      description: "Emergency fund, retirement, investments, debt payoff",
    },
  ];

  return (
    <div className="rule-card">
      <div className="rule-header">
        <h2 className="rule-title">50/30/20 Rule</h2>
        <a
          className="rule-info"
          href="#"
          onClick={(e) => e.preventDefault()}
          title="A popular budgeting guideline: 50% on needs, 30% on wants, 20% on savings."
        >
          ?
        </a>
      </div>
      <p className="rule-desc">
        A popular guideline: 50% needs, 30% wants, 20% savings.
      </p>

      {income > 0 ? (
        <div className="rule-rows">
          {buckets.map((b) => {
            const actualPct = income > 0 ? b.actual / income : 0;
            const diff = b.actual - b.ideal;
            const isOver = diff > 0.01 * income;
            const isUnder = diff < -0.01 * income;
            const statusColor = isOver
              ? "var(--color-danger, #ef4444)"
              : isUnder
              ? "var(--color-warning, #f59e0b)"
              : "var(--color-success, #10b981)";

            const fillPct = Math.min((b.actual / (income * b.target)) * 100, 100);

            return (
              <div key={b.label} className="rule-row">
                <div className="rule-row-top">
                  <div className="rule-row-left">
                    <span className="rule-dot" style={{ background: b.color }} />
                    <div>
                      <p className="rule-row-label">{b.label}</p>
                      <p className="rule-row-hint">{b.description}</p>
                    </div>
                  </div>
                  <div className="rule-row-right">
                    <span className="rule-row-actual" style={{ color: b.color }}>
                      {formatPercent(actualPct)}
                    </span>
                    <span className="rule-row-target">/ {formatPercent(b.target)} target</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="rule-bar-track">
                  <div
                    className="rule-bar-fill"
                    style={{ width: `${fillPct}%`, background: b.color }}
                  />
                  {/* Target marker at 100% of allocated */}
                  <div className="rule-bar-marker" />
                </div>

                {/* Delta badge */}
                <div className="rule-delta-row">
                  <span className="rule-amounts">
                    {formatCurrency(b.actual)} actual &nbsp;·&nbsp; {formatCurrency(b.ideal)} ideal
                  </span>
                  {(isOver || isUnder) && (
                    <span className="rule-delta" style={{ color: statusColor }}>
                      {isOver ? "+" : ""}
                      {formatCurrency(diff)} {isOver ? "over" : "under"}
                    </span>
                  )}
                  {!isOver && !isUnder && b.actual > 0 && (
                    <span className="rule-delta" style={{ color: "var(--color-success, #10b981)" }}>
                      On target ✓
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rule-empty">Enter your income to see how your budget compares to the 50/30/20 rule.</p>
      )}

      <style>{`
        .rule-card {
          background: var(--bg-surface, #1a1f2e);
          border: 1px solid var(--border-subtle, rgba(255,255,255,0.08));
          border-radius: var(--radius-card, 14px);
          padding: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .rule-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.3rem;
        }
        .rule-title {
          font-size: 0.9375rem;
          font-weight: 700;
          margin: 0;
        }
        .rule-info {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          font-size: 0.625rem;
          font-weight: 700;
          background: rgba(255,255,255,0.1);
          color: var(--text-secondary, #94a3b8);
          text-decoration: none;
          cursor: help;
        }
        .rule-desc {
          font-size: 0.8125rem;
          color: var(--text-secondary, #94a3b8);
          margin: 0 0 1.25rem;
        }
        .rule-rows {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .rule-row {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .rule-row-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
        }
        .rule-row-left {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }
        .rule-dot {
          display: block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 3px;
          flex-shrink: 0;
        }
        .rule-row-label {
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary, #f1f5f9);
        }
        .rule-row-hint {
          font-size: 0.6875rem;
          color: var(--text-secondary, #94a3b8);
          margin: 0;
        }
        .rule-row-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1px;
          flex-shrink: 0;
        }
        .rule-row-actual {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .rule-row-target {
          font-size: 0.6875rem;
          color: var(--text-secondary, #94a3b8);
        }
        .rule-bar-track {
          height: 4px;
          background: rgba(255,255,255,0.07);
          border-radius: 9999px;
          overflow: hidden;
          position: relative;
        }
        .rule-bar-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.4s ease;
          opacity: 0.75;
        }
        .rule-delta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .rule-amounts {
          font-size: 0.6875rem;
          color: var(--text-secondary, #94a3b8);
        }
        .rule-delta {
          font-size: 0.6875rem;
          font-weight: 700;
        }
        .rule-empty {
          font-size: 0.875rem;
          color: var(--text-secondary, #94a3b8);
          margin: 0;
          text-align: center;
          padding: 0.75rem 0;
        }
      `}</style>
    </div>
  );
}
