"use client";

import { useState, useMemo, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* ─── Types ──────────────────────────────────────────────────────── */
interface Debt {
  id: string;
  name: string;
  type: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
}

type Strategy = "avalanche" | "snowball";

/* ─── Helpers ────────────────────────────────────────────────────── */
function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function formatCurrency(n: number, compact = false): string {
  if (compact && n >= 1000) {
    const k = n / 1000;
    return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatMonths(m: number): string {
  if (!isFinite(m)) return "∞";
  if (m < 12) return `${m} mo`;
  const y = Math.floor(m / 12);
  const r = m % 12;
  return r === 0 ? `${y} yr` : `${y} yr ${r} mo`;
}

function payoffDate(months: number): string {
  if (!isFinite(months)) return "Never";
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/* Core payoff engine */
function calculatePayoff(
  debts: Debt[],
  strategy: Strategy,
  extraPayment: number
) {
  if (debts.length === 0)
    return { months: 0, totalInterest: 0, chartData: [], debtFreeDate: "" };

  // Sort by strategy
  const sorted = [...debts].sort((a, b) =>
    strategy === "avalanche"
      ? b.interestRate - a.interestRate
      : a.balance - b.balance
  );

  let balances = Object.fromEntries(debts.map((d) => [d.id, d.balance]));
  const totalMinimum = debts.reduce((s, d) => s + d.minimumPayment, 0);
  let totalBudget = totalMinimum + extraPayment;

  const chartData: { month: string; balance: number; paid: number }[] = [];
  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  const startBalance = debts.reduce((s, d) => s + d.balance, 0);

  chartData.push({
    month: "Now",
    balance: Math.round(startBalance),
    paid: 0,
  });

  while (
    Object.values(balances).some((b) => b > 0) &&
    month < 600
  ) {
    month++;
    let remaining = totalBudget;

    // Pay minimums on all
    for (const debt of debts) {
      if (balances[debt.id] <= 0) continue;
      const interest = balances[debt.id] * (debt.interestRate / 12);
      totalInterest += interest;
      balances[debt.id] += interest;
      const payment = Math.min(debt.minimumPayment, balances[debt.id]);
      balances[debt.id] -= payment;
      remaining -= payment;
      totalPaid += payment;
    }

    // Apply extra to priority debt
    for (const debt of sorted) {
      if (balances[debt.id] <= 0 || remaining <= 0) continue;
      const extra = Math.min(remaining, balances[debt.id]);
      balances[debt.id] -= extra;
      remaining -= extra;
      totalPaid += extra;
    }

    // Freed-up minimums cascade to next priority
    for (const debt of sorted) {
      if (balances[debt.id] > 0 || remaining <= 0) continue;
      // This debt is paid off — its minimum cascades already via remaining
    }

    const currentBalance = Object.values(balances).reduce(
      (s, b) => s + Math.max(0, b),
      0
    );

    if (month % 3 === 0 || currentBalance < 1) {
      const d = new Date();
      d.setMonth(d.getMonth() + month);
      chartData.push({
        month: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        balance: Math.round(Math.max(0, currentBalance)),
        paid: Math.round(totalPaid),
      });
    }
  }

  return {
    months: month,
    totalInterest: Math.round(totalInterest),
    chartData,
    debtFreeDate: payoffDate(month),
  };
}

/* ─── Sample debts ───────────────────────────────────────────────── */
const SAMPLE_DEBTS: Debt[] = [
  { id: "s1", name: "Chase Sapphire", type: "credit_card", balance: 4800, interestRate: 0.2199, minimumPayment: 96 },
  { id: "s2", name: "Student Loan", type: "student_loan", balance: 12400, interestRate: 0.065, minimumPayment: 140 },
  { id: "s3", name: "Car Loan", type: "auto_loan", balance: 7200, interestRate: 0.0799, minimumPayment: 185 },
];

const DEBT_TYPES = [
  { value: "credit_card", label: "Credit Card" },
  { value: "student_loan", label: "Student Loan" },
  { value: "auto_loan", label: "Auto Loan" },
  { value: "personal_loan", label: "Personal Loan" },
  { value: "medical", label: "Medical" },
  { value: "other", label: "Other" },
];

const TYPE_COLORS: Record<string, string> = {
  credit_card: "#FF6B6B",
  student_loan: "#F5A623",
  auto_loan: "#00C9A7",
  personal_loan: "#A78BFA",
  medical: "#FB7185",
  other: "#8DA0B3",
};

/* ─── Main Dashboard ─────────────────────────────────────────────── */
export function DashboardClient() {
  const [debts, setDebts] = useState<Debt[]>(SAMPLE_DEBTS);
  const [strategy, setStrategy] = useState<Strategy>("avalanche");
  const [extraPayment, setExtraPayment] = useState(200);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "debts" | "plan">("overview");

  // Form state
  const [form, setForm] = useState({
    name: "", type: "credit_card", balance: "", interestRate: "", minimumPayment: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const avalancheResult = useMemo(
    () => calculatePayoff(debts, "avalanche", extraPayment),
    [debts, extraPayment]
  );
  const snowballResult = useMemo(
    () => calculatePayoff(debts, "snowball", extraPayment),
    [debts, extraPayment]
  );
  const activeResult = strategy === "avalanche" ? avalancheResult : snowballResult;

  const totalBalance = debts.reduce((s, d) => s + d.balance, 0);
  const totalMinimum = debts.reduce((s, d) => s + d.minimumPayment, 0);
  const highestAPR = debts.length > 0 ? Math.max(...debts.map((d) => d.interestRate)) : 0;

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.balance || isNaN(Number(form.balance)) || Number(form.balance) <= 0)
      errors.balance = "Enter a valid balance";
    if (!form.interestRate || isNaN(Number(form.interestRate)) || Number(form.interestRate) < 0)
      errors.interestRate = "Enter a valid rate (e.g. 21.99)";
    if (!form.minimumPayment || isNaN(Number(form.minimumPayment)) || Number(form.minimumPayment) <= 0)
      errors.minimumPayment = "Enter a valid minimum payment";
    return errors;
  };

  const handleSubmit = useCallback(() => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    const debt: Debt = {
      id: editingId ?? generateId(),
      name: form.name.trim(),
      type: form.type,
      balance: Number(form.balance),
      interestRate: Number(form.interestRate) / 100,
      minimumPayment: Number(form.minimumPayment),
    };

    if (editingId) {
      setDebts((prev) => prev.map((d) => (d.id === editingId ? debt : d)));
    } else {
      setDebts((prev) => [...prev, debt]);
    }

    setForm({ name: "", type: "credit_card", balance: "", interestRate: "", minimumPayment: "" });
    setFormErrors({});
    setShowForm(false);
    setEditingId(null);
  }, [form, editingId]);

  const handleEdit = (debt: Debt) => {
    setForm({
      name: debt.name,
      type: debt.type,
      balance: String(debt.balance),
      interestRate: String((debt.interestRate * 100).toFixed(2)),
      minimumPayment: String(debt.minimumPayment),
    });
    setEditingId(debt.id);
    setShowForm(true);
    setActiveTab("debts");
  };

  const handleDelete = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleCancel = () => {
    setForm({ name: "", type: "credit_card", balance: "", interestRate: "", minimumPayment: "" });
    setFormErrors({});
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* ── Dashboard Header ── */}
      <div style={{ background: "var(--bg-base)", borderBottom: "1px solid var(--border-subtle)", padding: "1.5rem 0" }}>
        <div className="section-wrapper">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 style={{ fontSize: "1.375rem", fontWeight: 700, letterSpacing: "-0.025em", margin: 0 }}>
                Your Payoff Dashboard
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
                {debts.length === 0 ? "Add your first debt to get started" : `Tracking ${debts.length} debt${debts.length > 1 ? "s" : ""} · ${formatCurrency(totalBalance)} total`}
              </p>
            </div>
            <button className="btn-primary" onClick={() => { setShowForm(true); setActiveTab("debts"); }}>
              + Add debt
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0.25rem", marginTop: "1.25rem" }}>
            {(["overview", "debts", "plan"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "0.4rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  background: activeTab === tab ? "var(--bg-elevated)" : "transparent",
                  color: activeTab === tab ? "var(--text-primary)" : "var(--text-muted)",
                  transition: "all 0.15s",
                  textTransform: "capitalize",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="section-wrapper" style={{ padding: "2rem 1.5rem" }}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
              <SummaryCard label="Total debt" value={formatCurrency(totalBalance)} sub={`${debts.length} account${debts.length !== 1 ? "s" : ""}`} color="var(--accent-ember)" />
              <SummaryCard label="Monthly minimum" value={formatCurrency(totalMinimum)} sub="required payments" color="var(--accent-gold)" />
              <SummaryCard label="Debt-free date" value={activeResult.debtFreeDate} sub={formatMonths(activeResult.months) + " away"} color="var(--accent-mint)" />
              <SummaryCard label="Interest you'll pay" value={formatCurrency(activeResult.totalInterest)} sub={strategy + " strategy"} color="var(--text-muted)" />
            </div>

            {/* Strategy selector + extra payment */}
            <div className="card" style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "flex-start" }}>
              <div style={{ flex: "1 1 220px" }}>
                <div className="stat-label" style={{ marginBottom: "0.75rem" }}>Payoff strategy</div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {(["avalanche", "snowball"] as Strategy[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStrategy(s)}
                      style={{
                        flex: 1,
                        padding: "0.6rem 0.75rem",
                        borderRadius: "var(--radius-md)",
                        border: `1px solid ${strategy === s ? "var(--accent-mint)" : "var(--border-subtle)"}`,
                        background: strategy === s ? "rgba(0,201,167,0.1)" : "var(--bg-elevated)",
                        color: strategy === s ? "var(--accent-mint)" : "var(--text-muted)",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        textTransform: "capitalize",
                        transition: "all 0.15s",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-faint)", marginTop: "0.5rem", lineHeight: 1.5 }}>
                  {strategy === "avalanche"
                    ? "Highest interest rate first. Saves the most money."
                    : "Lowest balance first. Builds momentum with quick wins."}
                </p>
              </div>

              <div style={{ flex: "1 1 220px" }}>
                <div className="stat-label" style={{ marginBottom: "0.75rem" }}>
                  Extra monthly payment: <span style={{ color: "var(--accent-mint)" }}>{formatCurrency(extraPayment)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={2000}
                  step={25}
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--accent-mint)", cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-faint)", marginTop: "0.25rem" }}>
                  <span>$0</span><span>$2,000</span>
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-faint)", marginTop: "0.5rem", lineHeight: 1.5 }}>
                  Total monthly budget: {formatCurrency(totalMinimum + extraPayment)}
                </p>
              </div>

              {/* Comparison pill */}
              {avalancheResult.months > 0 && snowballResult.months > 0 && (
                <div style={{ flex: "1 1 200px", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
                  <div className="stat-label" style={{ marginBottom: "0.75rem" }}>Strategy comparison</div>
                  <CompareRow
                    label="Avalanche"
                    months={avalancheResult.months}
                    interest={avalancheResult.totalInterest}
                    active={strategy === "avalanche"}
                    color="var(--accent-mint)"
                  />
                  <div style={{ height: "0.5rem" }} />
                  <CompareRow
                    label="Snowball"
                    months={snowballResult.months}
                    interest={snowballResult.totalInterest}
                    active={strategy === "snowball"}
                    color="var(--accent-gold)"
                  />
                </div>
              )}
            </div>

            {/* Payoff chart */}
            {debts.length > 0 && activeResult.chartData.length > 1 && (
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>Balance over time</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      Debt-free by <span style={{ color: "var(--accent-mint)" }}>{activeResult.debtFreeDate}</span>
                    </div>
                  </div>
                  <span className="badge badge-mint" style={{ textTransform: "capitalize" }}>{strategy}</span>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={activeResult.chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00C9A7" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#00C9A7" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(141,160,179,0.08)" />
                    <XAxis dataKey="month" tick={{ fill: "#8DA0B3", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: "#8DA0B3", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v, true)} width={52} />
                    <Tooltip
                      contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", fontSize: "0.8rem" }}
                      labelStyle={{ color: "var(--text-muted)", marginBottom: "0.25rem" }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any, name: any) => [formatCurrency(Number(value)), name === "balance" ? "Remaining" : "Total paid"] as any}
                    />
                    <Legend formatter={(v) => v === "balance" ? "Remaining balance" : "Total paid"} wrapperStyle={{ fontSize: "0.75rem", color: "var(--text-muted)" }} />
                    <Area type="monotone" dataKey="balance" stroke="#FF6B6B" strokeWidth={2} fill="url(#balanceGrad)" dot={false} />
                    <Area type="monotone" dataKey="paid" stroke="#00C9A7" strokeWidth={2} fill="url(#paidGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Debt breakdown */}
            {debts.length > 0 && (
              <div className="card">
                <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "1rem" }}>Debt breakdown</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {debts.map((debt) => {
                    const pct = totalBalance > 0 ? (debt.balance / totalBalance) * 100 : 0;
                    const color = TYPE_COLORS[debt.type] ?? "var(--text-muted)";
                    return (
                      <div key={debt.id}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
                            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{debt.name}</span>
                            <span className="badge" style={{ fontSize: "0.6rem" }}>{(debt.interestRate * 100).toFixed(1)}% APR</span>
                          </div>
                          <span style={{ fontSize: "0.875rem", fontWeight: 600, color }}>{formatCurrency(debt.balance)}</span>
                        </div>
                        <div style={{ width: "100%", height: 3, background: "var(--bg-elevated)", borderRadius: 2 }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, boxShadow: `0 0 6px ${color}40`, transition: "width 0.6s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {debts.length === 0 && <EmptyState onAdd={() => { setShowForm(true); setActiveTab("debts"); }} />}
          </div>
        )}

        {/* ── DEBTS TAB ── */}
        {activeTab === "debts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Add/Edit Form */}
            {showForm && (
              <div className="card" style={{ border: "1px solid var(--border-mint)" }}>
                <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "1.25rem", color: "var(--accent-mint)" }}>
                  {editingId ? "Edit debt" : "Add a debt"}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                  <FormField label="Account name" error={formErrors.name}>
                    <input
                      type="text"
                      placeholder="e.g. Chase Freedom"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      style={inputStyle(!!formErrors.name)}
                    />
                  </FormField>

                  <FormField label="Debt type" error={""}>
                    <select
                      value={form.type}
                      onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                      style={inputStyle(false)}
                    >
                      {DEBT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Current balance ($)" error={formErrors.balance}>
                    <input
                      type="number"
                      placeholder="e.g. 4800"
                      value={form.balance}
                      onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))}
                      style={inputStyle(!!formErrors.balance)}
                      min={0}
                    />
                  </FormField>

                  <FormField label="Interest rate (APR %)" error={formErrors.interestRate}>
                    <input
                      type="number"
                      placeholder="e.g. 21.99"
                      value={form.interestRate}
                      onChange={(e) => setForm((f) => ({ ...f, interestRate: e.target.value }))}
                      style={inputStyle(!!formErrors.interestRate)}
                      min={0}
                      step={0.01}
                    />
                  </FormField>

                  <FormField label="Minimum monthly payment ($)" error={formErrors.minimumPayment}>
                    <input
                      type="number"
                      placeholder="e.g. 96"
                      value={form.minimumPayment}
                      onChange={(e) => setForm((f) => ({ ...f, minimumPayment: e.target.value }))}
                      style={inputStyle(!!formErrors.minimumPayment)}
                      min={0}
                    />
                  </FormField>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                  <button className="btn-primary" onClick={handleSubmit}>
                    {editingId ? "Save changes" : "Add debt"}
                  </button>
                  <button className="btn-secondary" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Debt list */}
            {debts.length === 0 && !showForm && (
              <EmptyState onAdd={() => setShowForm(true)} />
            )}

            {debts.map((debt) => {
              const color = TYPE_COLORS[debt.type] ?? "var(--text-muted)";
              const typeLabel = DEBT_TYPES.find((t) => t.value === debt.type)?.label ?? debt.type;
              const minMonths = Math.ceil(
                -Math.log(1 - (debt.balance * (debt.interestRate / 12)) / debt.minimumPayment) /
                  Math.log(1 + debt.interestRate / 12)
              );
              return (
                <div
                  key={debt.id}
                  className="card"
                  style={{ borderLeft: `3px solid ${color}` }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                        <span style={{ fontWeight: 600, fontSize: "1rem" }}>{debt.name}</span>
                        <span className="badge" style={{ background: `${color}18`, color, borderColor: `${color}40`, fontSize: "0.65rem" }}>{typeLabel}</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.75rem" }}>
                        <DebtStat label="Balance" value={formatCurrency(debt.balance)} color={color} />
                        <DebtStat label="APR" value={`${(debt.interestRate * 100).toFixed(2)}%`} color="var(--text-muted)" />
                        <DebtStat label="Min. payment" value={formatCurrency(debt.minimumPayment)} color="var(--text-muted)" />
                        <DebtStat label="Min-only payoff" value={isFinite(minMonths) ? formatMonths(minMonths) : "∞"} color="var(--accent-ember)" />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                      <button
                        onClick={() => handleEdit(debt)}
                        style={{ ...ghostBtnStyle }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(debt.id)}
                        style={{ ...ghostBtnStyle, color: "var(--accent-ember)" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {debts.length > 0 && !showForm && (
              <button
                className="btn-secondary"
                onClick={() => setShowForm(true)}
                style={{ alignSelf: "flex-start" }}
              >
                + Add another debt
              </button>
            )}
          </div>
        )}

        {/* ── PLAN TAB ── */}
        {activeTab === "plan" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {debts.length === 0 ? (
              <EmptyState onAdd={() => { setShowForm(true); setActiveTab("debts"); }} />
            ) : (
              <>
                {/* Plan summary */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                  <PlanCard
                    strategy="avalanche"
                    result={avalancheResult}
                    active={strategy === "avalanche"}
                    onSelect={() => setStrategy("avalanche")}
                    description="Highest interest first. Mathematically optimal — saves the most in interest."
                  />
                  <PlanCard
                    strategy="snowball"
                    result={snowballResult}
                    active={strategy === "snowball"}
                    onSelect={() => setStrategy("snowball")}
                    description="Smallest balance first. Builds momentum with early wins."
                  />
                </div>

                {/* Interest savings callout */}
                {avalancheResult.totalInterest !== snowballResult.totalInterest && (
                  <div style={{
                    background: "rgba(0,201,167,0.07)",
                    border: "1px solid var(--border-mint)",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem 1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                  }}>
                    <span style={{ fontSize: "1.25rem" }}>💡</span>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
                      The Avalanche method saves you{" "}
                      <strong style={{ color: "var(--accent-mint)" }}>
                        {formatCurrency(Math.abs(snowballResult.totalInterest - avalancheResult.totalInterest))}
                      </strong>{" "}
                      in interest compared to Snowball.
                      {Math.abs(snowballResult.months - avalancheResult.months) > 0 && (
                        <> The Snowball method gets you debt-free{" "}
                          <strong style={{ color: "var(--accent-gold)" }}>
                            {formatMonths(Math.abs(snowballResult.months - avalancheResult.months))}
                          </strong>{" "}
                          {snowballResult.months < avalancheResult.months ? "faster" : "slower"}.
                        </>
                      )}
                    </p>
                  </div>
                )}

                {/* Payoff order */}
                <div className="card">
                  <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                    Payoff order — {strategy} strategy
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                    Pay minimums on all accounts, then put every extra dollar toward #1.
                  </p>
                  {[...debts]
                    .sort((a, b) =>
                      strategy === "avalanche"
                        ? b.interestRate - a.interestRate
                        : a.balance - b.balance
                    )
                    .map((debt, i) => {
                      const color = TYPE_COLORS[debt.type] ?? "var(--text-muted)";
                      return (
                        <div
                          key={debt.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            padding: "0.875rem 0",
                            borderBottom: i < debts.length - 1 ? "1px solid var(--border-subtle)" : "none",
                          }}
                        >
                          <span style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: i === 0 ? "var(--accent-mint)" : "var(--bg-elevated)",
                            color: i === 0 ? "#0D1B2A" : "var(--text-muted)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.75rem", fontWeight: 700, flexShrink: 0,
                          }}>
                            {i + 1}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{debt.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {formatCurrency(debt.balance)} ·{" "}
                              {(debt.interestRate * 100).toFixed(2)}% APR
                            </div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
                              {strategy === "avalanche" ? "Highest rate" : "Lowest balance"}
                            </div>
                            {i === 0 && (
                              <span style={{ fontSize: "0.7rem", color: "var(--accent-mint)", fontWeight: 600 }}>
                                ← Focus here
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Educational note */}
                <div style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                }}>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                    How the {strategy} method works
                  </div>
                  {strategy === "avalanche" ? (
                    <ol style={{ margin: 0, paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      <li style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>Pay the minimum on every debt each month</li>
                      <li style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>Put all extra money toward the debt with the highest APR</li>
                      <li style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>When it's paid off, roll that payment to the next highest rate</li>
                      <li style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>Repeat until debt-free — this minimizes total interest paid</li>
                    </ol>
                  ) : (
                    <ol style={{ margin: 0, paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      <li style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>Pay the minimum on every debt each month</li>
                      <li style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>Put all extra money toward the debt with the smallest balance</li>
                      <li style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>When it's paid off, roll that payment to the next smallest balance</li>
                      <li style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>Each payoff builds psychological momentum</li>
                    </ol>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <div className="stat-label">{label}</div>
      <div style={{ fontFamily: "DM Serif Display, Georgia, serif", fontSize: "1.6rem", lineHeight: 1.1, color, fontWeight: 400 }}>
        {value}
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>{sub}</div>
    </div>
  );
}

function CompareRow({ label, months, interest, active, color }: { label: string; months: number; interest: number; active: boolean; color: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "0.8rem", fontWeight: active ? 600 : 400, color: active ? color : "var(--text-muted)" }}>
        {active ? "▶ " : "　"}{label}
      </span>
      <div style={{ textAlign: "right" }}>
        <span style={{ fontSize: "0.8rem", color: active ? color : "var(--text-muted)" }}>{formatMonths(months)}</span>
        <span style={{ fontSize: "0.7rem", color: "var(--text-faint)", display: "block" }}>{formatCurrency(interest)} interest</span>
      </div>
    </div>
  );
}

function DebtStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: "0.2rem" }}>{label}</div>
      <div style={{ fontSize: "0.95rem", fontWeight: 600, color }}>{value}</div>
    </div>
  );
}

function FormField({ label, error, children }: { label: string; error: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem", letterSpacing: "0.04em" }}>
        {label}
      </label>
      {children}
      {error && <p style={{ fontSize: "0.7rem", color: "var(--accent-ember)", marginTop: "0.25rem" }}>{error}</p>}
    </div>
  );
}

function PlanCard({ strategy, result, active, onSelect, description }: {
  strategy: Strategy; result: ReturnType<typeof calculatePayoff>;
  active: boolean; onSelect: () => void; description: string;
}) {
  const color = strategy === "avalanche" ? "var(--accent-mint)" : "var(--accent-gold)";
  return (
    <button
      onClick={onSelect}
      style={{
        textAlign: "left",
        padding: "1.25rem",
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${active ? color : "var(--border-subtle)"}`,
        background: active ? `rgba(${strategy === "avalanche" ? "0,201,167" : "245,166,35"},0.07)` : "var(--bg-surface)",
        cursor: "pointer",
        transition: "all 0.15s",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
        <span style={{ fontWeight: 700, fontSize: "0.95rem", color: active ? color : "var(--text-primary)", textTransform: "capitalize" }}>
          {strategy}
        </span>
        {active && <span className="badge" style={{ background: `${color}20`, color, borderColor: `${color}40` }}>Selected</span>}
      </div>
      <div style={{ fontFamily: "DM Serif Display, Georgia, serif", fontSize: "1.5rem", color, marginBottom: "0.25rem" }}>
        {formatMonths(result.months)}
      </div>
      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
        {formatCurrency(result.totalInterest)} total interest
      </div>
      <p style={{ fontSize: "0.775rem", color: "var(--text-faint)", lineHeight: 1.5, margin: 0 }}>{description}</p>
    </button>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border-default)" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📋</div>
      <h3 style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.5rem" }}>No debts added yet</h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", maxWidth: "320px", margin: "0 auto 1.5rem", lineHeight: 1.6 }}>
        Add your debts to see your payoff timeline, compare strategies, and find your debt-free date.
      </p>
      <button className="btn-primary" onClick={onAdd}>+ Add your first debt</button>
    </div>
  );
}

/* ─── Style helpers ──────────────────────────────────────────────── */
const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "0.55rem 0.75rem",
  background: "var(--bg-elevated)",
  border: `1px solid ${hasError ? "var(--accent-ember)" : "var(--border-default)"}`,
  borderRadius: "var(--radius-sm)",
  color: "var(--text-primary)",
  fontSize: "0.875rem",
  outline: "none",
});

const ghostBtnStyle: React.CSSProperties = {
  padding: "0.35rem 0.75rem",
  background: "transparent",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-sm)",
  color: "var(--text-muted)",
  fontSize: "0.8rem",
  cursor: "pointer",
  fontWeight: 500,
};
