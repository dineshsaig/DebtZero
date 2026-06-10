"use client";

import React, { useState, useMemo, useCallback } from "react";
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
import {
  formatCurrency,
  formatMonths,
  monthsToPayoff,
  totalInterestPaid,
} from "@/lib/utils";

// ---------------------------------------------------------------------------
// Local date helpers (not in shared utils)
// ---------------------------------------------------------------------------

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + Math.round(months));
  return d;
}

function formatPayoffDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

interface DebtEntry {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minimumPayment: number;
}

interface ChartDataPoint {
  label: string;
  minOnly: number;
  withExtra: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildAmortization(
  balance: number,
  apr: number,
  monthlyPayment: number,
  maxMonths = 600
): AmortizationRow[] {
  const rows: AmortizationRow[] = [];
  let remaining = balance;
  const monthlyRate = apr / 100 / 12;

  for (let m = 1; m <= maxMonths && remaining > 0.005; m++) {
    const interestCharge = remaining * monthlyRate;
    const principalPaid = Math.min(monthlyPayment - interestCharge, remaining);
    const actualPayment = Math.min(monthlyPayment, remaining + interestCharge);
    remaining = Math.max(0, remaining - principalPaid);

    rows.push({
      month: m,
      payment: actualPayment,
      principal: principalPaid,
      interest: interestCharge,
      balance: remaining,
    });

    if (remaining < 0.005) break;
  }
  return rows;
}

function buildChartData(
  minRows: AmortizationRow[],
  extraRows: AmortizationRow[],
  balance: number
): ChartDataPoint[] {
  const maxLen = Math.max(minRows.length, extraRows.length);
  const step = Math.max(1, Math.ceil(maxLen / 60)); // cap at ~60 data points
  const points: ChartDataPoint[] = [
    { label: "Start", minOnly: balance, withExtra: balance },
  ];

  for (let i = step - 1; i < maxLen; i += step) {
    const yr = Math.floor(i / 12);
    const mo = (i % 12) + 1;
    const label = mo === 1 ? `Yr ${yr + 1}` : `Yr ${yr + 1} M${mo}`;
    points.push({
      label,
      minOnly: minRows[i]?.balance ?? 0,
      withExtra: extraRows[i]?.balance ?? 0,
    });
  }

  return points;
}

// Avalanche: highest APR first. Snowball: lowest balance first.
interface DebtWithPayoff extends DebtEntry {
  payoffMonth: number;
  totalInterest: number;
}

function simulateStrategy(
  debts: DebtEntry[],
  extraMonthly: number,
  strategy: "avalanche" | "snowball"
): DebtWithPayoff[] {
  if (debts.length === 0) return [];

  const sorted = [...debts].sort((a, b) =>
    strategy === "avalanche" ? b.apr - a.apr : a.balance - b.balance
  );

  // Track state
  const state = sorted.map((d) => ({
    ...d,
    remaining: d.balance,
    totalPaid: 0,
    payoffMonth: 0,
  }));

  let month = 0;
  const maxMonths = 600;

  while (month < maxMonths && state.some((d) => d.remaining > 0.005)) {
    month++;
    // Freed payment from paid-off debts rolls into extra
    let freePayment = extraMonthly;

    for (const debt of state) {
      if (debt.remaining <= 0.005) {
        freePayment += debt.minimumPayment; // snowball/avalanche roll
        continue;
      }
      const rate = debt.apr / 100 / 12;
      const interest = debt.remaining * rate;

      // Determine this month's payment
      const isTarget =
        state.findIndex((d) => d.remaining > 0.005) ===
        state.indexOf(debt);
      const payment = Math.min(
        debt.remaining + interest,
        debt.minimumPayment + (isTarget ? freePayment : 0)
      );

      const principal = payment - interest;
      debt.remaining = Math.max(0, debt.remaining - principal);
      debt.totalPaid += payment;

      if (debt.remaining < 0.005 && debt.payoffMonth === 0) {
        debt.payoffMonth = month;
      }
    }
  }

  return state.map((d) => ({
    ...d,
    payoffMonth: d.payoffMonth || month,
    totalInterest: Math.max(0, d.totalPaid - d.balance),
  }));
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--bg-surface, #1a1f2e)",
        border: `1px solid ${accent ? "var(--accent-primary, #00d4a8)" : "var(--border-subtle, rgba(255,255,255,0.08))"}`,
        borderRadius: "var(--radius-card, 12px)",
        padding: "1.25rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
      }}
    >
      <span
        style={{
          fontSize: "0.7rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-muted, rgba(255,255,255,0.45))",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "1.6rem",
          fontWeight: 700,
          color: accent
            ? "var(--accent-primary, #00d4a8)"
            : "var(--text-primary, #f0f4ff)",
          lineHeight: 1.15,
        }}
      >
        {value}
      </span>
      {sub && (
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted, rgba(255,255,255,0.45))",
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  hint?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <label
          style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--text-secondary, rgba(255,255,255,0.65))",
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </label>
        <span
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--accent-primary, #00d4a8)",
          }}
        >
          {format(value)}
        </span>
      </div>
      <div style={{ position: "relative", height: "20px", display: "flex", alignItems: "center" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "4px",
            borderRadius: "2px",
            background: "var(--border-subtle, rgba(255,255,255,0.1))",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            width: `${pct}%`,
            height: "4px",
            borderRadius: "2px",
            background: "var(--accent-primary, #00d4a8)",
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            width: "100%",
            opacity: 0,
            height: "20px",
            cursor: "pointer",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.68rem", color: "var(--text-muted, rgba(255,255,255,0.35))" }}>
          {format(min)}
        </span>
        {hint && (
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted, rgba(255,255,255,0.35))" }}>
            {hint}
          </span>
        )}
        <span style={{ fontSize: "0.68rem", color: "var(--text-muted, rgba(255,255,255,0.35))" }}>
          {format(max)}
        </span>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
  step,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "var(--text-secondary, rgba(255,255,255,0.65))",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "var(--bg-input, rgba(255,255,255,0.05))",
          border: "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
          borderRadius: "var(--radius-input, 8px)",
          overflow: "hidden",
          transition: "border-color 0.15s",
        }}
      >
        {prefix && (
          <span
            style={{
              padding: "0 0.6rem",
              fontSize: "0.9rem",
              color: "var(--text-muted, rgba(255,255,255,0.4))",
              userSelect: "none",
            }}
          >
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text-primary, #f0f4ff)",
            fontSize: "0.95rem",
            fontWeight: 500,
            padding: "0.6rem 0.5rem 0.6rem 0",
            width: "100%",
          }}
        />
        {suffix && (
          <span
            style={{
              padding: "0 0.6rem",
              fontSize: "0.9rem",
              color: "var(--text-muted, rgba(255,255,255,0.4))",
              userSelect: "none",
            }}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// Custom tooltip for recharts
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-elevated, #1e2538)",
        border: "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
        borderRadius: "8px",
        padding: "0.75rem 1rem",
        fontSize: "0.8rem",
      }}
    >
      <p style={{ color: "var(--text-muted, rgba(255,255,255,0.5))", marginBottom: "0.35rem" }}>
        {label}
      </p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function PayoffCalculatorPage() {
  // ── Single-debt inputs ──────────────────────────────────────────────────
  const [balance, setBalance] = useState("8500");
  const [apr, setApr] = useState("22.99");
  const [minPayment, setMinPayment] = useState("170");
  const [extraPayment, setExtraPayment] = useState(50);
  const [showAllRows, setShowAllRows] = useState(false);
  const [activeTab, setActiveTab] = useState<"single" | "multi">("single");

  // ── Multi-debt inputs (Avalanche vs Snowball) ──────────────────────────
  const [debts, setDebts] = useState<DebtEntry[]>([
    { id: "d1", name: "Visa Credit Card", balance: 4200, apr: 24.99, minimumPayment: 84 },
    { id: "d2", name: "Personal Loan", balance: 8000, apr: 14.5, minimumPayment: 180 },
    { id: "d3", name: "Store Card", balance: 1100, apr: 29.99, minimumPayment: 35 },
  ]);
  const [multiExtra, setMultiExtra] = useState(100);

  // ── Derived: single-debt calculations ──────────────────────────────────
  const parsedBalance = useMemo(() => Math.max(0, parseFloat(balance) || 0), [balance]);
  const parsedApr = useMemo(() => Math.max(0, parseFloat(apr) || 0), [apr]);
  const parsedMin = useMemo(() => Math.max(1, parseFloat(minPayment) || 0), [minPayment]);
  const totalPayment = parsedMin + extraPayment;

  const minOnlyMonths = useMemo(
    () => monthsToPayoff(parsedBalance, parsedApr, parsedMin),
    [parsedBalance, parsedApr, parsedMin]
  );
  const withExtraMonths = useMemo(
    () => monthsToPayoff(parsedBalance, parsedApr, totalPayment),
    [parsedBalance, parsedApr, totalPayment]
  );

  const minOnlyInterest = useMemo(
    () => totalInterestPaid(parsedBalance, parsedApr, parsedMin),
    [parsedBalance, parsedApr, parsedMin]
  );
  const withExtraInterest = useMemo(
    () => totalInterestPaid(parsedBalance, parsedApr, totalPayment),
    [parsedBalance, parsedApr, totalPayment]
  );

  const interestSaved = useMemo(
    () => Math.max(0, (isFinite(minOnlyInterest) ? minOnlyInterest : 0) - (isFinite(withExtraInterest) ? withExtraInterest : 0)),
    [minOnlyInterest, withExtraInterest]
  );

  const monthsSaved = useMemo(
    () => Math.max(0, (isFinite(minOnlyMonths) ? minOnlyMonths : 0) - (isFinite(withExtraMonths) ? withExtraMonths : 0)),
    [minOnlyMonths, withExtraMonths]
  );

  const debtFreeDate = useMemo(() => {
    if (!isFinite(withExtraMonths)) return null;
    return addMonths(new Date(), withExtraMonths);
  }, [withExtraMonths]);

  const amortRows = useMemo(
    () =>
      isFinite(withExtraMonths) && parsedBalance > 0
        ? buildAmortization(parsedBalance, parsedApr, totalPayment)
        : [],
    [parsedBalance, parsedApr, totalPayment, withExtraMonths]
  );

  const chartData = useMemo(() => {
    if (parsedBalance <= 0) return [];
    const minRows = buildAmortization(parsedBalance, parsedApr, parsedMin, 600);
    const extraRows = buildAmortization(parsedBalance, parsedApr, totalPayment, 600);
    return buildChartData(minRows, extraRows, parsedBalance);
  }, [parsedBalance, parsedApr, parsedMin, totalPayment]);

  // ── Derived: multi-debt strategy comparison ────────────────────────────
  const avalancheResult = useMemo(
    () => simulateStrategy(debts, multiExtra, "avalanche"),
    [debts, multiExtra]
  );
  const snowballResult = useMemo(
    () => simulateStrategy(debts, multiExtra, "snowball"),
    [debts, multiExtra]
  );

  const totalAvalancheInterest = useMemo(
    () => avalancheResult.reduce((s, d) => s + d.totalInterest, 0),
    [avalancheResult]
  );
  const totalSnowballInterest = useMemo(
    () => snowballResult.reduce((s, d) => s + d.totalInterest, 0),
    [snowballResult]
  );
  const avalancheFinish = useMemo(
    () => Math.max(...avalancheResult.map((d) => d.payoffMonth)),
    [avalancheResult]
  );
  const snowballFinish = useMemo(
    () => Math.max(...snowballResult.map((d) => d.payoffMonth)),
    [snowballResult]
  );

  const updateDebt = useCallback(
    (id: string, field: keyof DebtEntry, val: string) => {
      setDebts((prev) =>
        prev.map((d) =>
          d.id === id
            ? { ...d, [field]: field === "name" ? val : parseFloat(val) || 0 }
            : d
        )
      );
    },
    []
  );

  const addDebt = useCallback(() => {
    const id = `d${Date.now()}`;
    setDebts((prev) => [
      ...prev,
      { id, name: "New Debt", balance: 1000, apr: 18, minimumPayment: 25 },
    ]);
  }, []);

  const removeDebt = useCallback((id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // ── Visible amortization rows ──────────────────────────────────────────
  const visibleRows = showAllRows ? amortRows : amortRows.slice(0, 12);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base, #0f1318)",
        color: "var(--text-primary, #f0f4ff)",
        fontFamily: "var(--font-body, system-ui, sans-serif)",
      }}
    >
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          borderBottom: "1px solid var(--border-subtle, rgba(255,255,255,0.08))",
          padding: "2rem 1.5rem 1.5rem",
          background: "var(--bg-surface, #1a1f2e)",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "var(--accent-primary, #00d4a8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f1318" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <div>
              <h1
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  margin: 0,
                  color: "var(--text-primary, #f0f4ff)",
                }}
              >
                Payoff Calculator
              </h1>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted, rgba(255,255,255,0.45))" }}>
            See exactly how extra payments eliminate debt faster — and how much interest you save.
          </p>

          {/* Tab switcher */}
          <div
            style={{
              display: "flex",
              gap: "0",
              marginTop: "1.25rem",
              background: "var(--bg-input, rgba(255,255,255,0.05))",
              borderRadius: "8px",
              padding: "3px",
              width: "fit-content",
            }}
          >
            {(["single", "multi"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "0.4rem 1rem",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  transition: "all 0.15s",
                  background:
                    activeTab === tab
                      ? "var(--accent-primary, #00d4a8)"
                      : "transparent",
                  color:
                    activeTab === tab
                      ? "#0f1318"
                      : "var(--text-secondary, rgba(255,255,255,0.55))",
                }}
              >
                {tab === "single" ? "Single Debt" : "Avalanche vs Snowball"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >

        {/* ═══════════════════════════════════════════════════════════════
            SINGLE DEBT TAB
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "single" && (
          <>
            {/* Input Panel */}
            <div
              style={{
                background: "var(--bg-surface, #1a1f2e)",
                border: "1px solid var(--border-subtle, rgba(255,255,255,0.08))",
                borderRadius: "var(--radius-card, 12px)",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--text-muted, rgba(255,255,255,0.4))",
                }}
              >
                Your Debt
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "1rem",
                }}
              >
                <NumberField
                  label="Current Balance"
                  value={balance}
                  onChange={setBalance}
                  prefix="$"
                  min={0}
                  step={100}
                  placeholder="8500"
                />
                <NumberField
                  label="Annual APR"
                  value={apr}
                  onChange={setApr}
                  suffix="%"
                  min={0}
                  max={100}
                  step={0.01}
                  placeholder="22.99"
                />
                <NumberField
                  label="Minimum Payment"
                  value={minPayment}
                  onChange={setMinPayment}
                  prefix="$"
                  min={1}
                  step={5}
                  placeholder="170"
                />
              </div>

              {/* Extra Payment Slider */}
              <div
                style={{
                  background: "var(--bg-input, rgba(255,255,255,0.03))",
                  border: "1px solid var(--border-subtle, rgba(255,255,255,0.06))",
                  borderRadius: "10px",
                  padding: "1rem 1.25rem",
                }}
              >
                <SliderInput
                  label="Extra Monthly Payment"
                  value={extraPayment}
                  min={0}
                  max={Math.max(500, parsedBalance * 0.1)}
                  step={5}
                  onChange={setExtraPayment}
                  format={(v) => (v === 0 ? "None" : formatCurrency(v) + "/mo")}
                  hint={`Total: ${formatCurrency(totalPayment)}/mo`}
                />
              </div>

              {/* Quick presets */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted, rgba(255,255,255,0.35))", alignSelf: "center" }}>
                  Quick add:
                </span>
                {[25, 50, 100, 200].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setExtraPayment(amt)}
                    style={{
                      padding: "0.25rem 0.65rem",
                      borderRadius: "6px",
                      border: `1px solid ${extraPayment === amt ? "var(--accent-primary, #00d4a8)" : "var(--border-subtle, rgba(255,255,255,0.12))"}`,
                      background: extraPayment === amt ? "rgba(0,212,168,0.12)" : "transparent",
                      color: extraPayment === amt ? "var(--accent-primary, #00d4a8)" : "var(--text-secondary, rgba(255,255,255,0.55))",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    +{formatCurrency(amt)}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Grid */}
            {parsedBalance > 0 && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
                    gap: "0.75rem",
                  }}
                >
                  <StatCard
                    label="Debt-Free Date"
                    value={debtFreeDate ? formatPayoffDate(debtFreeDate) : "—"}
                    sub={isFinite(withExtraMonths) ? formatMonths(withExtraMonths) : "Never"}
                    accent
                  />
                  <StatCard
                    label="Total Interest"
                    value={isFinite(withExtraInterest) ? formatCurrency(withExtraInterest) : "—"}
                    sub={`at ${formatCurrency(totalPayment)}/mo`}
                  />
                  <StatCard
                    label="Interest Saved"
                    value={interestSaved > 0 ? formatCurrency(interestSaved) : "—"}
                    sub={monthsSaved > 0 ? `${formatMonths(monthsSaved)} sooner` : "vs minimum only"}
                  />
                  <StatCard
                    label="Monthly Min Only"
                    value={isFinite(minOnlyMonths) ? formatMonths(minOnlyMonths) : "Forever"}
                    sub={isFinite(minOnlyInterest) ? formatCurrency(minOnlyInterest) + " total interest" : ""}
                  />
                </div>

                {/* Chart */}
                {chartData.length > 1 && (
                  <div
                    style={{
                      background: "var(--bg-surface, #1a1f2e)",
                      border: "1px solid var(--border-subtle, rgba(255,255,255,0.08))",
                      borderRadius: "var(--radius-card, 12px)",
                      padding: "1.5rem",
                    }}
                  >
                    <h2
                      style={{
                        margin: "0 0 1.25rem",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "var(--text-muted, rgba(255,255,255,0.4))",
                      }}
                    >
                      Balance Over Time
                    </h2>
                    <div style={{ height: "240px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={chartData}
                          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient id="gradMin" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6b7eff" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#6b7eff" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradExtra" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00d4a8" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#00d4a8" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.05)"
                          />
                          <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
                            axisLine={false}
                            tickLine={false}
                            interval="preserveStartEnd"
                          />
                          <YAxis
                            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
                            axisLine={false}
                            tickLine={false}
                            width={42}
                          />
                          <Tooltip content={<ChartTooltip />} />
                          <Legend
                            wrapperStyle={{ fontSize: "0.75rem", paddingTop: "0.75rem" }}
                          />
                          <Area
                            type="monotone"
                            dataKey="minOnly"
                            name="Min Payment Only"
                            stroke="#6b7eff"
                            strokeWidth={2}
                            fill="url(#gradMin)"
                          />
                          <Area
                            type="monotone"
                            dataKey="withExtra"
                            name="With Extra Payment"
                            stroke="#00d4a8"
                            strokeWidth={2}
                            fill="url(#gradExtra)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Amortization Table */}
                {amortRows.length > 0 && (
                  <div
                    style={{
                      background: "var(--bg-surface, #1a1f2e)",
                      border: "1px solid var(--border-subtle, rgba(255,255,255,0.08))",
                      borderRadius: "var(--radius-card, 12px)",
                      padding: "1.5rem",
                      overflowX: "auto",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                      }}
                    >
                      <h2
                        style={{
                          margin: 0,
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: "var(--text-muted, rgba(255,255,255,0.4))",
                        }}
                      >
                        Month-by-Month Breakdown
                      </h2>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted, rgba(255,255,255,0.35))",
                        }}
                      >
                        {amortRows.length} payments total
                      </span>
                    </div>

                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "0.8rem",
                      }}
                    >
                      <thead>
                        <tr>
                          {["Mo.", "Payment", "Principal", "Interest", "Balance"].map(
                            (h) => (
                              <th
                                key={h}
                                style={{
                                  textAlign: h === "Mo." ? "left" : "right",
                                  padding: "0.4rem 0.6rem",
                                  color: "var(--text-muted, rgba(255,255,255,0.4))",
                                  fontWeight: 600,
                                  fontSize: "0.68rem",
                                  letterSpacing: "0.05em",
                                  textTransform: "uppercase",
                                  borderBottom: "1px solid var(--border-subtle, rgba(255,255,255,0.07))",
                                }}
                              >
                                {h}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {visibleRows.map((row, i) => (
                          <tr
                            key={row.month}
                            style={{
                              background:
                                i % 2 === 0
                                  ? "transparent"
                                  : "rgba(255,255,255,0.02)",
                            }}
                          >
                            <td
                              style={{
                                padding: "0.45rem 0.6rem",
                                color: "var(--text-muted, rgba(255,255,255,0.45))",
                                fontWeight: 500,
                              }}
                            >
                              {row.month}
                            </td>
                            <td
                              style={{
                                padding: "0.45rem 0.6rem",
                                textAlign: "right",
                                color: "var(--text-primary, #f0f4ff)",
                                fontWeight: 500,
                              }}
                            >
                              {formatCurrency(row.payment)}
                            </td>
                            <td
                              style={{
                                padding: "0.45rem 0.6rem",
                                textAlign: "right",
                                color: "var(--accent-primary, #00d4a8)",
                                fontWeight: 500,
                              }}
                            >
                              {formatCurrency(row.principal)}
                            </td>
                            <td
                              style={{
                                padding: "0.45rem 0.6rem",
                                textAlign: "right",
                                color: "rgba(255,100,100,0.85)",
                                fontWeight: 500,
                              }}
                            >
                              {formatCurrency(row.interest)}
                            </td>
                            <td
                              style={{
                                padding: "0.45rem 0.6rem",
                                textAlign: "right",
                                color: "var(--text-secondary, rgba(255,255,255,0.65))",
                                fontWeight: 600,
                              }}
                            >
                              {formatCurrency(row.balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {amortRows.length > 12 && (
                      <button
                        onClick={() => setShowAllRows((v) => !v)}
                        style={{
                          marginTop: "1rem",
                          width: "100%",
                          padding: "0.6rem",
                          borderRadius: "8px",
                          border: "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
                          background: "transparent",
                          color: "var(--accent-primary, #00d4a8)",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {showAllRows
                          ? "Show Less"
                          : `Show All ${amortRows.length} Months`}
                      </button>
                    )}
                  </div>
                )}

                {/* Educational callout */}
                {extraPayment === 0 && isFinite(minOnlyMonths) && (
                  <div
                    style={{
                      background: "rgba(107,126,255,0.08)",
                      border: "1px solid rgba(107,126,255,0.2)",
                      borderRadius: "10px",
                      padding: "1rem 1.25rem",
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>💡</span>
                    <div>
                      <p
                        style={{
                          margin: "0 0 0.25rem",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          color: "var(--text-primary, #f0f4ff)",
                        }}
                      >
                        Try the extra payment slider above
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.78rem",
                          color: "var(--text-secondary, rgba(255,255,255,0.55))",
                        }}
                      >
                        Even an extra{" "}
                        <strong style={{ color: "var(--accent-primary, #00d4a8)" }}>
                          $25/month
                        </strong>{" "}
                        can cut months off your payoff timeline and save hundreds in interest.
                        Use the slider to see your personalized savings.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            MULTI DEBT / STRATEGY COMPARISON TAB
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "multi" && (
          <>
            {/* Strategy explainer */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
              }}
            >
              {[
                {
                  name: "☄️ Avalanche",
                  tagline: "Most cost-effective",
                  desc: "Pay minimums on all debts, put every extra dollar toward the highest-APR debt first. Minimizes total interest paid.",
                  color: "var(--accent-primary, #00d4a8)",
                },
                {
                  name: "⛄ Snowball",
                  tagline: "Most motivating",
                  desc: "Pay minimums on all debts, put every extra dollar toward the lowest-balance debt first. Quick wins keep you on track.",
                  color: "#6b7eff",
                },
              ].map((s) => (
                <div
                  key={s.name}
                  style={{
                    background: "var(--bg-surface, #1a1f2e)",
                    border: `1px solid var(--border-subtle, rgba(255,255,255,0.08))`,
                    borderRadius: "var(--radius-card, 12px)",
                    padding: "1rem 1.25rem",
                  }}
                >
                  <p style={{ margin: "0 0 0.2rem", fontWeight: 700, fontSize: "0.9rem" }}>
                    {s.name}
                  </p>
                  <p
                    style={{
                      margin: "0 0 0.5rem",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: s.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {s.tagline}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.78rem",
                      color: "var(--text-secondary, rgba(255,255,255,0.55))",
                      lineHeight: 1.55,
                    }}
                  >
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Debt list editor */}
            <div
              style={{
                background: "var(--bg-surface, #1a1f2e)",
                border: "1px solid var(--border-subtle, rgba(255,255,255,0.08))",
                borderRadius: "var(--radius-card, 12px)",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--text-muted, rgba(255,255,255,0.4))",
                  }}
                >
                  Your Debts
                </h2>
                <button
                  onClick={addDebt}
                  style={{
                    padding: "0.3rem 0.75rem",
                    borderRadius: "6px",
                    border: "1px solid var(--accent-primary, #00d4a8)",
                    background: "rgba(0,212,168,0.1)",
                    color: "var(--accent-primary, #00d4a8)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  + Add Debt
                </button>
              </div>

              {debts.map((debt) => (
                <div
                  key={debt.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr repeat(3, 100px) 32px",
                    gap: "0.5rem",
                    alignItems: "end",
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        color: "var(--text-muted, rgba(255,255,255,0.4))",
                        display: "block",
                        marginBottom: "0.3rem",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      value={debt.name}
                      onChange={(e) => updateDebt(debt.id, "name", e.target.value)}
                      style={{
                        width: "100%",
                        background: "var(--bg-input, rgba(255,255,255,0.05))",
                        border: "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
                        borderRadius: "8px",
                        color: "var(--text-primary, #f0f4ff)",
                        padding: "0.55rem 0.65rem",
                        fontSize: "0.85rem",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  {(
                    [
                      { field: "balance", label: "Balance", prefix: "$" },
                      { field: "apr", label: "APR %", prefix: "" },
                      { field: "minimumPayment", label: "Min. Pay", prefix: "$" },
                    ] as { field: keyof DebtEntry; label: string; prefix: string }[]
                  ).map(({ field, label, prefix }) => (
                    <div key={field}>
                      <label
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          color: "var(--text-muted, rgba(255,255,255,0.4))",
                          display: "block",
                          marginBottom: "0.3rem",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        {label}
                      </label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          background: "var(--bg-input, rgba(255,255,255,0.05))",
                          border: "1px solid var(--border-subtle, rgba(255,255,255,0.1))",
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        {prefix && (
                          <span
                            style={{
                              padding: "0 0.4rem",
                              fontSize: "0.8rem",
                              color: "var(--text-muted, rgba(255,255,255,0.35))",
                            }}
                          >
                            {prefix}
                          </span>
                        )}
                        <input
                          type="number"
                          value={
                            typeof debt[field] === "number"
                              ? (debt[field] as number)
                              : debt[field]
                          }
                          onChange={(e) => updateDebt(debt.id, field, e.target.value)}
                          style={{
                            flex: 1,
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            color: "var(--text-primary, #f0f4ff)",
                            fontSize: "0.85rem",
                            padding: "0.55rem 0.4rem 0.55rem 0",
                            width: "100%",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => removeDebt(debt.id)}
                    aria-label="Remove"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "6px",
                      border: "1px solid rgba(255,80,80,0.2)",
                      background: "rgba(255,80,80,0.07)",
                      color: "rgba(255,100,100,0.7)",
                      cursor: "pointer",
                      fontSize: "1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      alignSelf: "end",
                      marginBottom: "1px",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Extra payment slider for multi */}
              <div
                style={{
                  background: "var(--bg-input, rgba(255,255,255,0.03))",
                  border: "1px solid var(--border-subtle, rgba(255,255,255,0.06))",
                  borderRadius: "10px",
                  padding: "1rem 1.25rem",
                  marginTop: "0.25rem",
                }}
              >
                <SliderInput
                  label="Extra Monthly Payment (applied to target debt)"
                  value={multiExtra}
                  min={0}
                  max={1000}
                  step={10}
                  onChange={setMultiExtra}
                  format={(v) => (v === 0 ? "None" : formatCurrency(v) + "/mo")}
                />
              </div>
            </div>

            {/* Strategy Comparison Results */}
            {debts.length > 0 && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                  }}
                >
                  {[
                    {
                      label: "☄️ Avalanche",
                      months: avalancheFinish,
                      interest: totalAvalancheInterest,
                      isBetter: totalAvalancheInterest <= totalSnowballInterest,
                      color: "var(--accent-primary, #00d4a8)",
                    },
                    {
                      label: "⛄ Snowball",
                      months: snowballFinish,
                      interest: totalSnowballInterest,
                      isBetter: totalSnowballInterest <= totalAvalancheInterest,
                      color: "#6b7eff",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        background: "var(--bg-surface, #1a1f2e)",
                        border: `1px solid ${s.isBetter ? s.color : "var(--border-subtle, rgba(255,255,255,0.08))"}`,
                        borderRadius: "var(--radius-card, 12px)",
                        padding: "1.25rem",
                        position: "relative",
                      }}
                    >
                      {s.isBetter && (
                        <div
                          style={{
                            position: "absolute",
                            top: "0.75rem",
                            right: "0.75rem",
                            background: s.color,
                            color: "#0f1318",
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.45rem",
                            borderRadius: "4px",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          Lower Cost
                        </div>
                      )}
                      <p style={{ margin: "0 0 0.75rem", fontWeight: 700, fontSize: "0.95rem" }}>
                        {s.label}
                      </p>
                      <p
                        style={{
                          margin: "0 0 0.15rem",
                          fontSize: "1.5rem",
                          fontWeight: 800,
                          color: s.color,
                          lineHeight: 1.1,
                        }}
                      >
                        {formatMonths(s.months)}
                      </p>
                      <p
                        style={{
                          margin: "0 0 0.75rem",
                          fontSize: "0.72rem",
                          color: "var(--text-muted, rgba(255,255,255,0.4))",
                        }}
                      >
                        to pay off all debts
                      </p>
                      <div
                        style={{
                          borderTop: "1px solid var(--border-subtle, rgba(255,255,255,0.06))",
                          paddingTop: "0.75rem",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.72rem",
                            color: "var(--text-muted, rgba(255,255,255,0.4))",
                          }}
                        >
                          Total Interest
                        </p>
                        <p
                          style={{
                            margin: "0.1rem 0 0",
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: "var(--text-primary, #f0f4ff)",
                          }}
                        >
                          {formatCurrency(s.interest)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Per-debt payoff order */}
                <div
                  style={{
                    background: "var(--bg-surface, #1a1f2e)",
                    border: "1px solid var(--border-subtle, rgba(255,255,255,0.08))",
                    borderRadius: "var(--radius-card, 12px)",
                    padding: "1.5rem",
                  }}
                >
                  <h2
                    style={{
                      margin: "0 0 1rem",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--text-muted, rgba(255,255,255,0.4))",
                    }}
                  >
                    Payoff Order Comparison
                  </h2>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                      <thead>
                        <tr>
                          {["Debt", "Balance", "APR", "☄️ Avalanche", "⛄ Snowball"].map(
                            (h) => (
                              <th
                                key={h}
                                style={{
                                  textAlign: h === "Debt" ? "left" : "right",
                                  padding: "0.4rem 0.6rem",
                                  color: "var(--text-muted, rgba(255,255,255,0.4))",
                                  fontWeight: 600,
                                  fontSize: "0.68rem",
                                  letterSpacing: "0.05em",
                                  textTransform: "uppercase",
                                  borderBottom: "1px solid var(--border-subtle, rgba(255,255,255,0.07))",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {h}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {debts.map((debt, i) => {
                          const av = avalancheResult.find((d) => d.id === debt.id);
                          const sn = snowballResult.find((d) => d.id === debt.id);
                          return (
                            <tr
                              key={debt.id}
                              style={{
                                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                              }}
                            >
                              <td
                                style={{
                                  padding: "0.5rem 0.6rem",
                                  fontWeight: 500,
                                  color: "var(--text-primary, #f0f4ff)",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {debt.name}
                              </td>
                              <td
                                style={{
                                  padding: "0.5rem 0.6rem",
                                  textAlign: "right",
                                  color: "var(--text-secondary, rgba(255,255,255,0.6))",
                                }}
                              >
                                {formatCurrency(debt.balance)}
                              </td>
                              <td
                                style={{
                                  padding: "0.5rem 0.6rem",
                                  textAlign: "right",
                                  color: debt.apr >= 20 ? "rgba(255,100,100,0.85)" : "var(--text-secondary, rgba(255,255,255,0.6))",
                                  fontWeight: 600,
                                }}
                              >
                                {debt.apr.toFixed(2)}%
                              </td>
                              <td
                                style={{
                                  padding: "0.5rem 0.6rem",
                                  textAlign: "right",
                                  color: "var(--accent-primary, #00d4a8)",
                                  fontWeight: 600,
                                }}
                              >
                                {av ? formatMonths(av.payoffMonth) : "—"}
                              </td>
                              <td
                                style={{
                                  padding: "0.5rem 0.6rem",
                                  textAlign: "right",
                                  color: "#6b7eff",
                                  fontWeight: 600,
                                }}
                              >
                                {sn ? formatMonths(sn.payoffMonth) : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recommendation callout */}
                <div
                  style={{
                    background:
                      totalAvalancheInterest <= totalSnowballInterest
                        ? "rgba(0,212,168,0.06)"
                        : "rgba(107,126,255,0.06)",
                    border: `1px solid ${totalAvalancheInterest <= totalSnowballInterest ? "rgba(0,212,168,0.2)" : "rgba(107,126,255,0.2)"}`,
                    borderRadius: "10px",
                    padding: "1rem 1.25rem",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 0.35rem",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      color: "var(--text-primary, #f0f4ff)",
                    }}
                  >
                    {totalAvalancheInterest <= totalSnowballInterest
                      ? "☄️ Avalanche saves you more money"
                      : "⛄ Snowball saves you more money (unusual)"}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.78rem",
                      color: "var(--text-secondary, rgba(255,255,255,0.55))",
                      lineHeight: 1.6,
                    }}
                  >
                    {totalAvalancheInterest <= totalSnowballInterest ? (
                      <>
                        The Avalanche method saves{" "}
                        <strong style={{ color: "var(--accent-primary, #00d4a8)" }}>
                          {formatCurrency(totalSnowballInterest - totalAvalancheInterest)}
                        </strong>{" "}
                        more in interest vs. Snowball. If staying motivated is a challenge, Snowball's
                        quick early wins can help you stay on track — both strategies beat making
                        minimum payments only.
                      </>
                    ) : (
                      <>
                        In your case, Snowball happens to save slightly more in interest. This
                        typically occurs when lower-balance debts also carry higher APRs. Whichever
                        method you choose, the most important thing is consistency.
                      </>
                    )}
                  </p>
                </div>
              </>
            )}
          </>
        )}

        {/* ── Footer disclaimer ─────────────────────────────────────────── */}
        <p
          style={{
            fontSize: "0.7rem",
            color: "var(--text-muted, rgba(255,255,255,0.3))",
            textAlign: "center",
            lineHeight: 1.6,
            padding: "0.5rem 0 1rem",
          }}
        >
          DebtZero calculations are for educational purposes only and assume fixed APR and consistent
          payments. Actual results depend on your individual circumstances. This is not financial
          advice.
        </p>
      </div>

      {/* Slider thumb styles injected via a style tag */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--accent-primary, #00d4a8);
          cursor: pointer;
          box-shadow: 0 0 0 3px rgba(0,212,168,0.2);
        }
        input[type=range]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: none;
          background: var(--accent-primary, #00d4a8);
          cursor: pointer;
          box-shadow: 0 0 0 3px rgba(0,212,168,0.2);
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
        }
        input[type=number] { -moz-appearance: textfield; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
