"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency, formatPercent } from "@/lib/utils";
import BudgetCategoryRow from "@/components/ui/BudgetCategoryRow";
import BudgetSummaryCard from "@/components/ui/BudgetSummaryCard";
import BudgetRecommendations from "@/components/ui/BudgetRecommendations";
import RuleComparison from "@/components/ui/RuleComparison";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CategoryKey =
  | "housing"
  | "food"
  | "transport"
  | "utilities"
  | "healthcare"
  | "personal"
  | "entertainment"
  | "debtPayments"
  | "savings"
  | "other";

export interface Category {
  key: CategoryKey;
  label: string;
  amount: number;
  ruleGroup: "needs" | "wants" | "savings";
  color: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES: Category[] = [
  { key: "housing",      label: "Housing",        amount: 0, ruleGroup: "needs",   color: "#6366f1" },
  { key: "food",         label: "Food",           amount: 0, ruleGroup: "needs",   color: "#8b5cf6" },
  { key: "transport",    label: "Transport",      amount: 0, ruleGroup: "needs",   color: "#a78bfa" },
  { key: "utilities",    label: "Utilities",      amount: 0, ruleGroup: "needs",   color: "#7c3aed" },
  { key: "healthcare",   label: "Healthcare",     amount: 0, ruleGroup: "needs",   color: "#4f46e5" },
  { key: "personal",     label: "Personal",       amount: 0, ruleGroup: "wants",   color: "#10b981" },
  { key: "entertainment",label: "Entertainment",  amount: 0, ruleGroup: "wants",   color: "#34d399" },
  { key: "debtPayments", label: "Debt Payments",  amount: 0, ruleGroup: "needs",   color: "#f59e0b" },
  { key: "savings",      label: "Savings",        amount: 0, ruleGroup: "savings", color: "#06b6d4" },
  { key: "other",        label: "Other",          amount: 0, ruleGroup: "wants",   color: "#64748b" },
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "8px",
          padding: "10px 14px",
          color: "var(--text-primary)",
          fontSize: "13px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: 2 }}>{entry.name}</p>
        <p style={{ color: "var(--accent-primary)" }}>{formatCurrency(entry.value)}</p>
      </div>
    );
  }
  return null;
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function BudgetPage() {
  const [income, setIncome] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  const monthlyIncome = parseFloat(income.replace(/,/g, "")) || 0;

  // ── Derived values ────────────────────────────────────────────────────────

  const { totalAllocated, remaining, savingsRate, debtToIncome, pieData } =
    useMemo(() => {
      const totalAllocated = categories.reduce((s, c) => s + c.amount, 0);
      const remaining = monthlyIncome - totalAllocated;
      const savingsRate = monthlyIncome > 0 ? categories.find((c) => c.key === "savings")!.amount / monthlyIncome : 0;
      const debtToIncome = monthlyIncome > 0 ? categories.find((c) => c.key === "debtPayments")!.amount / monthlyIncome : 0;
      const pieData = categories
        .filter((c) => c.amount > 0)
        .map((c) => ({ name: c.label, value: c.amount, color: c.color }));
      return { totalAllocated, remaining, savingsRate, debtToIncome, pieData };
    }, [categories, monthlyIncome]);

  // ── 50/30/20 rule breakdown ────────────────────────────────────────────────

  const rule = useMemo(() => {
    const needs = categories.filter((c) => c.ruleGroup === "needs").reduce((s, c) => s + c.amount, 0);
    const wants = categories.filter((c) => c.ruleGroup === "wants").reduce((s, c) => s + c.amount, 0);
    const savings = categories.filter((c) => c.ruleGroup === "savings").reduce((s, c) => s + c.amount, 0);
    return { needs, wants, savings };
  }, [categories]);

  // ── Budget status ──────────────────────────────────────────────────────────

  const budgetStatus: "green" | "amber" | "red" = useMemo(() => {
    if (monthlyIncome === 0) return "green";
    const pct = totalAllocated / monthlyIncome;
    if (pct > 1) return "red";
    if (pct > 0.95) return "amber";
    return "green";
  }, [totalAllocated, monthlyIncome]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function updateCategory(key: CategoryKey, amount: number) {
    setCategories((prev) => prev.map((c) => (c.key === key ? { ...c, amount } : c)));
  }

  function handleIncomeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    setIncome(raw);
  }

  // ── Status helpers ─────────────────────────────────────────────────────────

  const statusColors = {
    green: "var(--color-success, #10b981)",
    amber: "var(--color-warning, #f59e0b)",
    red:   "var(--color-danger,  #ef4444)",
  };

  const statusColor = statusColors[budgetStatus];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="budget-page">
      {/* ── Header ── */}
      <header className="budget-header">
        <div className="budget-header-inner">
          <div>
            <h1 className="budget-title">Budget Planner</h1>
            <p className="budget-subtitle">
              Allocate your income, spot imbalances, and build a plan that works.
            </p>
          </div>
          <span className="budget-badge">50/30/20 Analysis</span>
        </div>
      </header>

      <div className="budget-layout">
        {/* ── Left column: income + categories ── */}
        <section className="budget-left">
          {/* Income input */}
          <div className="income-card">
            <label className="income-label" htmlFor="income">
              Monthly Take-Home Income
            </label>
            <div className="income-input-wrap">
              <span className="income-prefix">$</span>
              <input
                id="income"
                className="income-input"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={income}
                onChange={handleIncomeChange}
              />
            </div>
            {monthlyIncome > 0 && (
              <p className="income-hint">
                {formatCurrency(monthlyIncome)} / month&nbsp;·&nbsp;
                {formatCurrency(monthlyIncome * 12)} / year
              </p>
            )}
          </div>

          {/* Category rows */}
          <div className="categories-card">
            <div className="categories-header">
              <h2 className="categories-title">Expense Categories</h2>
              <span className="categories-hint">Enter monthly amounts</span>
            </div>

            <div className="categories-group">
              <p className="group-label needs-label">Needs</p>
              {categories
                .filter((c) => c.ruleGroup === "needs")
                .map((c) => (
                  <BudgetCategoryRow
                    key={c.key}
                    category={c}
                    income={monthlyIncome}
                    onChange={(val) => updateCategory(c.key, val)}
                  />
                ))}
            </div>

            <div className="categories-group">
              <p className="group-label wants-label">Wants</p>
              {categories
                .filter((c) => c.ruleGroup === "wants")
                .map((c) => (
                  <BudgetCategoryRow
                    key={c.key}
                    category={c}
                    income={monthlyIncome}
                    onChange={(val) => updateCategory(c.key, val)}
                  />
                ))}
            </div>

            <div className="categories-group">
              <p className="group-label savings-label">Savings</p>
              {categories
                .filter((c) => c.ruleGroup === "savings")
                .map((c) => (
                  <BudgetCategoryRow
                    key={c.key}
                    category={c}
                    income={monthlyIncome}
                    onChange={(val) => updateCategory(c.key, val)}
                  />
                ))}
            </div>
          </div>
        </section>

        {/* ── Right column: summary + chart + recommendations ── */}
        <section className="budget-right">
          {/* Summary cards */}
          <div className="summary-grid">
            <BudgetSummaryCard
              label="Total Allocated"
              value={formatCurrency(totalAllocated)}
              sub={monthlyIncome > 0 ? `${formatPercent(totalAllocated / monthlyIncome)} of income` : "—"}
              accent={statusColor}
            />
            <BudgetSummaryCard
              label="Remaining"
              value={formatCurrency(Math.abs(remaining))}
              sub={remaining < 0 ? "over budget" : "unallocated"}
              accent={remaining < 0 ? statusColors.red : statusColors.green}
              negative={remaining < 0}
            />
            <BudgetSummaryCard
              label="Savings Rate"
              value={formatPercent(savingsRate)}
              sub={savingsRate >= 0.2 ? "On track ✓" : savingsRate >= 0.1 ? "Building up" : "Below target"}
              accent={savingsRate >= 0.2 ? statusColors.green : savingsRate >= 0.1 ? statusColors.amber : statusColors.red}
            />
            <BudgetSummaryCard
              label="Debt-to-Income"
              value={formatPercent(debtToIncome)}
              sub={debtToIncome <= 0.2 ? "Healthy ✓" : debtToIncome <= 0.36 ? "Manageable" : "High — review"}
              accent={debtToIncome <= 0.2 ? statusColors.green : debtToIncome <= 0.36 ? statusColors.amber : statusColors.red}
            />
          </div>

          {/* Donut chart */}
          {pieData.length > 0 ? (
            <div className="chart-card">
              <h2 className="chart-title">Spending Breakdown</h2>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Centre label overlay */}
              <div className="chart-center">
                <span className="chart-center-value">{formatCurrency(totalAllocated)}</span>
                <span className="chart-center-label">allocated</span>
              </div>
            </div>
          ) : (
            <div className="chart-card chart-empty">
              <span className="chart-empty-icon">◎</span>
              <p className="chart-empty-text">Enter expenses above to see your spending breakdown.</p>
            </div>
          )}

          {/* 50/30/20 rule */}
          <RuleComparison income={monthlyIncome} needs={rule.needs} wants={rule.wants} savings={rule.savings} />

          {/* AI recommendations */}
          <BudgetRecommendations
            income={monthlyIncome}
            categories={categories}
            savingsRate={savingsRate}
            debtToIncome={debtToIncome}
            remaining={remaining}
            budgetStatus={budgetStatus}
          />
        </section>
      </div>

      {/* ── Scoped styles ── */}
      <style>{`
        /* ── Layout ── */
        .budget-page {
          min-height: 100vh;
          background: var(--bg-base, #0f1117);
          color: var(--text-primary, #f1f5f9);
          font-family: var(--font-sans, system-ui, sans-serif);
          padding-bottom: 4rem;
        }

        .budget-header {
          border-bottom: 1px solid var(--border-subtle, rgba(255,255,255,0.08));
          padding: 2.25rem 1.5rem 1.75rem;
        }
        .budget-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .budget-title {
          font-size: 1.875rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 0.35rem;
          background: linear-gradient(135deg, var(--text-primary, #f1f5f9) 60%, var(--accent-primary, #6366f1));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .budget-subtitle {
          font-size: 0.9375rem;
          color: var(--text-secondary, #94a3b8);
          margin: 0;
        }
        .budget-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.375rem 0.875rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          background: color-mix(in srgb, var(--accent-primary, #6366f1) 14%, transparent);
          color: var(--accent-primary, #6366f1);
          border: 1px solid color-mix(in srgb, var(--accent-primary, #6366f1) 30%, transparent);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .budget-layout {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 900px) {
          .budget-layout { grid-template-columns: 1fr; }
        }

        /* ── Income card ── */
        .income-card {
          background: var(--bg-surface, #1a1f2e);
          border: 1px solid var(--border-subtle, rgba(255,255,255,0.08));
          border-radius: var(--radius-card, 14px);
          padding: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .income-label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary, #94a3b8);
          margin-bottom: 0.75rem;
        }
        .income-input-wrap {
          display: flex;
          align-items: center;
          background: var(--bg-base, #0f1117);
          border: 1.5px solid var(--border-subtle, rgba(255,255,255,0.12));
          border-radius: 10px;
          overflow: hidden;
          transition: border-color 0.15s;
        }
        .income-input-wrap:focus-within {
          border-color: var(--accent-primary, #6366f1);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary, #6366f1) 18%, transparent);
        }
        .income-prefix {
          padding: 0 0.875rem;
          color: var(--text-secondary, #94a3b8);
          font-size: 1.125rem;
          font-weight: 500;
          background: color-mix(in srgb, var(--accent-primary, #6366f1) 8%, transparent);
          align-self: stretch;
          display: flex;
          align-items: center;
          border-right: 1px solid var(--border-subtle, rgba(255,255,255,0.08));
        }
        .income-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          padding: 0.875rem 1rem;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary, #f1f5f9);
          width: 100%;
        }
        .income-input::placeholder { color: var(--text-muted, #4b5563); }
        .income-hint {
          margin: 0.6rem 0 0;
          font-size: 0.8125rem;
          color: var(--text-secondary, #94a3b8);
        }

        /* ── Categories card ── */
        .categories-card {
          background: var(--bg-surface, #1a1f2e);
          border: 1px solid var(--border-subtle, rgba(255,255,255,0.08));
          border-radius: var(--radius-card, 14px);
          padding: 1.5rem;
        }
        .categories-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .categories-title {
          font-size: 1rem;
          font-weight: 700;
          margin: 0;
        }
        .categories-hint {
          font-size: 0.75rem;
          color: var(--text-secondary, #94a3b8);
        }
        .categories-group {
          margin-bottom: 1.25rem;
        }
        .categories-group:last-child { margin-bottom: 0; }
        .group-label {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0 0 0.6rem;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          display: inline-block;
        }
        .needs-label   { background: color-mix(in srgb, #6366f1 15%, transparent); color: #818cf8; }
        .wants-label   { background: color-mix(in srgb, #10b981 15%, transparent); color: #34d399; }
        .savings-label { background: color-mix(in srgb, #06b6d4 15%, transparent); color: #22d3ee; }

        /* ── Summary grid ── */
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.875rem;
          margin-bottom: 1.25rem;
        }

        /* ── Chart card ── */
        .chart-card {
          background: var(--bg-surface, #1a1f2e);
          border: 1px solid var(--border-subtle, rgba(255,255,255,0.08));
          border-radius: var(--radius-card, 14px);
          padding: 1.5rem;
          margin-bottom: 1.25rem;
          position: relative;
        }
        .chart-title {
          font-size: 0.9375rem;
          font-weight: 700;
          margin: 0 0 1rem;
        }
        .chart-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -10%);
          text-align: center;
          pointer-events: none;
        }
        .chart-center-value {
          display: block;
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary, #f1f5f9);
        }
        .chart-center-label {
          display: block;
          font-size: 0.6875rem;
          color: var(--text-secondary, #94a3b8);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .chart-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 180px;
          gap: 0.75rem;
        }
        .chart-empty-icon {
          font-size: 2.25rem;
          opacity: 0.25;
        }
        .chart-empty-text {
          font-size: 0.875rem;
          color: var(--text-secondary, #94a3b8);
          text-align: center;
          margin: 0;
          max-width: 240px;
        }
      `}</style>
    </main>
  );
}
