"use client";

import { formatCurrency, formatPercent } from "@/lib/utils";
import type { Category } from "@/app/budget/page";

interface Props {
  income: number;
  categories: Category[];
  savingsRate: number;
  debtToIncome: number;
  remaining: number;
  budgetStatus: "green" | "amber" | "red";
}

interface Recommendation {
  id: string;
  level: "info" | "warning" | "danger" | "success";
  title: string;
  body: string;
}

export default function BudgetRecommendations({
  income,
  categories,
  savingsRate,
  debtToIncome,
  remaining,
  budgetStatus,
}: Props) {
  if (income === 0) return null;

  const totalAllocated = categories.reduce((s, c) => s + c.amount, 0);
  const housing = categories.find((c) => c.key === "housing")!;
  const housingPct = income > 0 ? housing.amount / income : 0;

  const recommendations: Recommendation[] = [];

  // ── Budget balance ───────────────────────────────────────────────────────

  if (budgetStatus === "red") {
    const overage = totalAllocated - income;
    recommendations.push({
      id: "over-budget",
      level: "danger",
      title: "You're over budget",
      body: `Your expenses exceed your income by ${formatCurrency(overage)}. Review your want categories first — small cuts there add up quickly without impacting essentials.`,
    });
  } else if (budgetStatus === "amber") {
    recommendations.push({
      id: "tight-budget",
      level: "warning",
      title: "Budget is tight",
      body: `You have only ${formatCurrency(remaining)} unallocated (${formatPercent(remaining / income)} of income). Consider whether any category can flex if an unexpected expense hits.`,
    });
  } else if (remaining > 0 && totalAllocated > 0) {
    recommendations.push({
      id: "unallocated",
      level: "info",
      title: `${formatCurrency(remaining)} is unallocated`,
      body: `Put this toward your emergency fund first (3–6 months of expenses), then additional debt payoff or investing. Unbudgeted money tends to disappear.`,
    });
  }

  // ── Debt-to-income ───────────────────────────────────────────────────────

  if (debtToIncome > 0.36) {
    recommendations.push({
      id: "dti-high",
      level: "danger",
      title: `Debt payments are ${formatPercent(debtToIncome)} of income — above 36%`,
      body: `Lenders typically flag DTI above 36% as high-risk. Focus on the Avalanche method: pay minimums on all debts, then put every extra dollar toward the highest-APR balance to reduce interest cost fastest.`,
    });
  } else if (debtToIncome > 0.2) {
    recommendations.push({
      id: "dti-moderate",
      level: "warning",
      title: `Debt payments are ${formatPercent(debtToIncome)} of income`,
      body: `The recommended ceiling is 20% (excluding mortgage) or 36% total. You're in the manageable range, but try to avoid taking on new debt while paying down existing balances.`,
    });
  } else if (debtToIncome > 0 && debtToIncome <= 0.2) {
    recommendations.push({
      id: "dti-good",
      level: "success",
      title: `Healthy debt-to-income ratio (${formatPercent(debtToIncome)})`,
      body: `You're below the 20% guideline. Keep it up — and consider whether any extra cash flow can accelerate payoff or go toward savings.`,
    });
  }

  // ── Savings rate ─────────────────────────────────────────────────────────

  if (savingsRate === 0) {
    recommendations.push({
      id: "no-savings",
      level: "warning",
      title: "No savings allocated",
      body: `Even ${formatCurrency(income * 0.05)}/month (5% of income) starts building your safety net. Automate a transfer on payday so savings happen before spending.`,
    });
  } else if (savingsRate < 0.1) {
    recommendations.push({
      id: "low-savings",
      level: "warning",
      title: `Savings rate is ${formatPercent(savingsRate)} — below 10%`,
      body: `Aim for at least 10% to build an emergency fund, then 15–20% long-term. Increase your savings allocation by ${formatCurrency(income * 0.1 - categories.find((c) => c.key === "savings")!.amount)} to hit the 10% threshold.`,
    });
  } else if (savingsRate >= 0.2) {
    recommendations.push({
      id: "great-savings",
      level: "success",
      title: `Excellent savings rate (${formatPercent(savingsRate)})`,
      body: `You're saving at or above the 20% benchmark. If your emergency fund is fully funded (3–6 months of expenses), consider directing surplus toward tax-advantaged accounts or additional debt payoff.`,
    });
  }

  // ── Housing cost burden ──────────────────────────────────────────────────

  if (housingPct > 0.35) {
    recommendations.push({
      id: "housing-high",
      level: "warning",
      title: `Housing is ${formatPercent(housingPct)} of income`,
      body: `Financial planners recommend keeping housing under 30% of gross income (or 28% of take-home). At your current level, housing is crowding out savings and flexibility. If refinancing or moving isn't feasible, look to increase income.`,
    });
  }

  // ── Emergency fund nudge ─────────────────────────────────────────────────

  const monthlyExpenses = totalAllocated - categories.find((c) => c.key === "savings")!.amount;
  if (savingsRate > 0 && savingsRate < 0.2 && monthlyExpenses > 0) {
    const efTarget = monthlyExpenses * 3;
    recommendations.push({
      id: "emergency-fund",
      level: "info",
      title: "Build your emergency fund first",
      body: `A 3-month emergency fund for your expense level is ${formatCurrency(efTarget)}. Before investing, make sure this is fully funded in a high-yield savings account. It's your financial shock absorber.`,
    });
  }

  if (recommendations.length === 0) return null;

  const levelColors: Record<Recommendation["level"], string> = {
    info:    "var(--accent-primary, #6366f1)",
    warning: "#f59e0b",
    danger:  "#ef4444",
    success: "#10b981",
  };
  const levelBg: Record<Recommendation["level"], string> = {
    info:    "color-mix(in srgb, #6366f1 10%, transparent)",
    warning: "color-mix(in srgb, #f59e0b 10%, transparent)",
    danger:  "color-mix(in srgb, #ef4444 10%, transparent)",
    success: "color-mix(in srgb, #10b981 10%, transparent)",
  };
  const levelIcons: Record<Recommendation["level"], string> = {
    info:    "ℹ",
    warning: "⚠",
    danger:  "✕",
    success: "✓",
  };

  return (
    <div className="rec-card">
      <h2 className="rec-title">Recommendations</h2>
      <p className="rec-subtitle">Based on your current budget allocation.</p>

      <div className="rec-list">
        {recommendations.map((r) => (
          <div
            key={r.id}
            className="rec-item"
            style={{
              borderLeftColor: levelColors[r.level],
              background: levelBg[r.level],
            }}
          >
            <div className="rec-item-header">
              <span className="rec-icon" style={{ color: levelColors[r.level] }}>
                {levelIcons[r.level]}
              </span>
              <p className="rec-item-title" style={{ color: levelColors[r.level] }}>
                {r.title}
              </p>
            </div>
            <p className="rec-item-body">{r.body}</p>
          </div>
        ))}
      </div>

      <p className="rec-disclaimer">
        These are educational guidelines. Financial decisions depend on your individual circumstances — consider speaking with a certified financial planner for personalised advice.
      </p>

      <style>{`
        .rec-card {
          background: var(--bg-surface, #1a1f2e);
          border: 1px solid var(--border-subtle, rgba(255,255,255,0.08));
          border-radius: var(--radius-card, 14px);
          padding: 1.5rem;
        }
        .rec-title {
          font-size: 0.9375rem;
          font-weight: 700;
          margin: 0 0 0.2rem;
        }
        .rec-subtitle {
          font-size: 0.8125rem;
          color: var(--text-secondary, #94a3b8);
          margin: 0 0 1rem;
        }
        .rec-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .rec-item {
          border-left: 3px solid;
          border-radius: 0 8px 8px 0;
          padding: 0.75rem 0.875rem;
        }
        .rec-item-header {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.375rem;
        }
        .rec-icon {
          font-size: 0.75rem;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .rec-item-title {
          font-size: 0.875rem;
          font-weight: 700;
          margin: 0;
          line-height: 1.3;
        }
        .rec-item-body {
          font-size: 0.8125rem;
          color: var(--text-secondary, #94a3b8);
          margin: 0;
          line-height: 1.55;
        }
        .rec-disclaimer {
          font-size: 0.6875rem;
          color: var(--text-muted, #4b5563);
          margin: 0;
          line-height: 1.5;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
