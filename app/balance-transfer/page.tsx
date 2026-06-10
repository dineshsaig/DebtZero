"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  formatCurrency,
  formatMonths,
  monthsToPayoff,
  totalInterestPaid,
  requiredMonthlyPayment,
  transferFee,
} from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CurrentCard {
  balance: string;
  apr: string;
  minPayment: string;
}

interface TransferOffer {
  promoAPR: string;
  promoMonths: string;
  transferFeePercent: string;
  regularAPR: string;
}

// ---------------------------------------------------------------------------
// Small reusable input component
// ---------------------------------------------------------------------------
function InputField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="dz-field">
      <label className="dz-label">{label}</label>
      {hint && <p className="dz-hint">{hint}</p>}
      <div className="dz-input-wrap">
        {prefix && <span className="dz-affix">{prefix}</span>}
        <input
          type="number"
          className="dz-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "0"}
          min="0"
          step="any"
        />
        {suffix && <span className="dz-affix dz-affix-right">{suffix}</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Metric card
// ---------------------------------------------------------------------------
function MetricCard({
  label,
  value,
  sub,
  highlight,
  danger,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={`dz-metric-card${highlight ? " dz-metric-highlight" : ""}${danger ? " dz-metric-danger" : ""}`}
    >
      <p className="dz-metric-label">{label}</p>
      <p className="dz-metric-value">{value}</p>
      {sub && <p className="dz-metric-sub">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom Recharts tooltip
// ---------------------------------------------------------------------------
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; fill: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="dz-tooltip">
      <p className="dz-tooltip-title">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.fill }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function BalanceTransferPage() {
  const [card, setCard] = useState<CurrentCard>({
    balance: "",
    apr: "",
    minPayment: "",
  });
  const [offer, setOffer] = useState<TransferOffer>({
    promoAPR: "0",
    promoMonths: "12",
    transferFeePercent: "3",
    regularAPR: "",
  });

  // Parse inputs
  const balance = parseFloat(card.balance) || 0;
  const currentAPR = parseFloat(card.apr) || 0;
  const minPayment = parseFloat(card.minPayment) || 0;
  const promoAPR = parseFloat(offer.promoAPR) || 0;
  const promoMonths = parseInt(offer.promoMonths) || 0;
  const feePercent = parseFloat(offer.transferFeePercent) || 0;
  const regularAPR = parseFloat(offer.regularAPR) || 0;

  const hasValidInputs =
    balance > 0 && currentAPR > 0 && minPayment > 0 && promoMonths > 0;

  // ---------------------------------------------------------------------------
  // Core calculations
  // ---------------------------------------------------------------------------
  const analysis = useMemo(() => {
    if (!hasValidInputs) return null;

    // --- Stay on current card ---
    const stayMonths = monthsToPayoff(balance, currentAPR, minPayment);
    const stayInterest = totalInterestPaid(balance, currentAPR, minPayment);
    const stayCost = isFinite(stayInterest) ? stayInterest : null;

    // --- Transfer scenario ---
    const fee = transferFee(balance, feePercent);
    const newBalance = balance + fee;

    // Required payment to clear within promo window
    const reqPayment = requiredMonthlyPayment(newBalance, promoAPR, promoMonths);

    // Simulate promo period: how much balance remains after promoMonths at minPayment
    let remainingAfterPromo = newBalance;
    const effectivePromoRate = promoAPR / 100 / 12;
    for (let m = 0; m < promoMonths; m++) {
      const interest = remainingAfterPromo * effectivePromoRate;
      remainingAfterPromo = Math.max(0, remainingAfterPromo + interest - minPayment);
    }

    // Months + interest to pay off remaining balance at regular APR
    const postPromoMonths = remainingAfterPromo > 0
      ? monthsToPayoff(remainingAfterPromo, regularAPR || currentAPR, minPayment)
      : 0;
    const postPromoInterest = remainingAfterPromo > 0
      ? totalInterestPaid(remainingAfterPromo, regularAPR || currentAPR, minPayment)
      : 0;

    // Interest during promo at minPayment
    let promoInterestWithMinPayment = 0;
    let runningBal = newBalance;
    for (let m = 0; m < promoMonths; m++) {
      const interest = runningBal * effectivePromoRate;
      promoInterestWithMinPayment += interest;
      runningBal = Math.max(0, runningBal + interest - minPayment);
    }

    const transferTotalCost = fee + promoInterestWithMinPayment + (isFinite(postPromoInterest) ? postPromoInterest : 0);

    // Savings
    const savings = stayCost !== null && isFinite(transferTotalCost)
      ? stayCost - transferTotalCost
      : null;

    // Break-even: months until transfer saves more than fee cost
    // (approx: fee / monthly_interest_saved)
    const currentMonthlyInterest = balance * (currentAPR / 100 / 12);
    const promoMonthlyInterest = newBalance * effectivePromoRate;
    const monthlyInterestSaved = currentMonthlyInterest - promoMonthlyInterest;
    const breakEvenMonths = monthlyInterestSaved > 0
      ? Math.ceil(fee / monthlyInterestSaved)
      : null;

    // Recommendation logic
    const worthIt =
      savings !== null &&
      savings > 0 &&
      (breakEvenMonths === null || breakEvenMonths < promoMonths) &&
      reqPayment <= balance * 1.5; // sanity: required payment shouldn't be absurd

    // Promo clears if user pays the required amount
    const clearsInPromo = reqPayment <= minPayment || remainingAfterPromo < 1;

    return {
      // Stay
      stayMonths,
      stayCost,
      stayInterest,
      // Transfer
      fee,
      newBalance,
      reqPayment,
      remainingAfterPromo,
      postPromoMonths,
      postPromoInterest,
      transferTotalCost,
      // Analysis
      savings,
      breakEvenMonths,
      worthIt,
      clearsInPromo,
      monthlyInterestSaved,
    };
  }, [
    balance, currentAPR, minPayment, promoAPR, promoMonths,
    feePercent, regularAPR, hasValidInputs,
  ]);

  // Chart data
  const chartData = useMemo(() => {
    if (!analysis) return [];
    return [
      {
        name: "Stay on Current Card",
        "Transfer Fee": 0,
        "Interest Cost": analysis.stayCost ?? 0,
      },
      {
        name: "Balance Transfer",
        "Transfer Fee": analysis.fee,
        "Interest Cost": Math.max(
          0,
          analysis.transferTotalCost - analysis.fee
        ),
      },
    ];
  }, [analysis]);

  return (
    <div className="dz-page">
      {/* ── Page header ── */}
      <div className="dz-page-header">
        <div className="dz-eyebrow">Balance Transfer Analyzer</div>
        <h1 className="dz-page-title">Should you transfer your balance?</h1>
        <p className="dz-page-sub">
          Enter your current card details and the promotional offer to get a
          clear cost comparison and a plain-English recommendation.
        </p>
      </div>

      {/* ── Educational callout ── */}
      <div className="dz-edu-callout">
        <div className="dz-edu-icon">💡</div>
        <div>
          <p className="dz-edu-title">How balance transfers work</p>
          <p className="dz-edu-body">
            A balance transfer moves your existing credit card debt to a new
            card — typically one offering a <strong>0% promotional APR</strong>{" "}
            for 12–21 months. During that window, every dollar you pay chips
            away at principal, not interest. The catch: most cards charge a
            transfer fee (usually 3–5% of the balance), and any amount still
            owed when the promo ends jumps to a standard APR — often 20%+.
            The strategy pays off when the <em>interest you avoid</em> exceeds
            the fee you pay, and you can realistically clear (or significantly
            reduce) the balance in time.
          </p>
          <p className="dz-edu-risks">
            <strong>Watch out for:</strong> missing a payment (which can void
            the promo rate), new purchases on the transfer card (often excluded
            from promo), and applying for a new card (temporary credit score
            dip from the hard inquiry).
          </p>
        </div>
      </div>

      {/* ── Input panels ── */}
      <div className="dz-panels">
        {/* Current card */}
        <section className="dz-panel">
          <h2 className="dz-panel-title">
            <span className="dz-panel-icon">💳</span>
            Your Current Card
          </h2>
          <div className="dz-fields">
            <InputField
              label="Current Balance"
              value={card.balance}
              onChange={(v) => setCard((c) => ({ ...c, balance: v }))}
              prefix="$"
              placeholder="5,000"
              hint="Total amount you currently owe"
            />
            <InputField
              label="Current APR"
              value={card.apr}
              onChange={(v) => setCard((c) => ({ ...c, apr: v }))}
              suffix="%"
              placeholder="22.99"
              hint="Annual interest rate on your existing card"
            />
            <InputField
              label="Monthly Payment"
              value={card.minPayment}
              onChange={(v) => setCard((c) => ({ ...c, minPayment: v }))}
              prefix="$"
              placeholder="150"
              hint="What you plan to pay each month"
            />
          </div>
        </section>

        {/* Transfer offer */}
        <section className="dz-panel">
          <h2 className="dz-panel-title">
            <span className="dz-panel-icon">🎯</span>
            Transfer Offer Details
          </h2>
          <div className="dz-fields">
            <InputField
              label="Promotional APR"
              value={offer.promoAPR}
              onChange={(v) => setOffer((o) => ({ ...o, promoAPR: v }))}
              suffix="%"
              placeholder="0"
              hint="Usually 0% — confirm your offer letter"
            />
            <InputField
              label="Promotional Period"
              value={offer.promoMonths}
              onChange={(v) => setOffer((o) => ({ ...o, promoMonths: v }))}
              suffix="mo"
              placeholder="15"
              hint="Months the promo rate lasts"
            />
            <InputField
              label="Transfer Fee"
              value={offer.transferFeePercent}
              onChange={(v) =>
                setOffer((o) => ({ ...o, transferFeePercent: v }))
              }
              suffix="%"
              placeholder="3"
              hint="One-time fee charged on the transferred amount"
            />
            <InputField
              label="Regular APR (after promo)"
              value={offer.regularAPR}
              onChange={(v) => setOffer((o) => ({ ...o, regularAPR: v }))}
              suffix="%"
              placeholder="24.99"
              hint="Rate applied to any remaining balance after promo ends"
            />
          </div>
        </section>
      </div>

      {/* ── Results ── */}
      {!hasValidInputs && (
        <div className="dz-empty-state">
          <p>Fill in your card details above to see your personalized analysis.</p>
        </div>
      )}

      {analysis && hasValidInputs && (
        <div className="dz-results">
          {/* Recommendation banner */}
          <div className={`dz-recommendation ${analysis.worthIt ? "dz-rec-yes" : "dz-rec-no"}`}>
            <div className="dz-rec-verdict">
              {analysis.worthIt ? "✅ YES" : "❌ NOT RECOMMENDED"}
            </div>
            <div className="dz-rec-reason">
              {analysis.worthIt ? (
                <>
                  Based on your numbers, a balance transfer could save you{" "}
                  <strong>{formatCurrency(analysis.savings ?? 0)}</strong> in
                  total interest and fees — even after the{" "}
                  {formatCurrency(analysis.fee)} transfer fee. You would
                  {analysis.breakEvenMonths !== null
                    ? ` break even in about ${analysis.breakEvenMonths} month${analysis.breakEvenMonths !== 1 ? "s" : ""} and then`
                    : ""}
                  {" "}save money every month after that.
                </>
              ) : (
                <>
                  {analysis.savings !== null && analysis.savings <= 0
                    ? `The transfer fee (${formatCurrency(analysis.fee)}) exceeds the interest you would save. Staying on your current card is cheaper.`
                    : `With your current monthly payment, the remaining balance after the promo period (${formatCurrency(analysis.remainingAfterPromo)}) would roll into a high regular APR, erasing most of the benefit.`}
                  {" "}Consider increasing your monthly payment or finding an offer with a lower fee.
                </>
              )}
            </div>
          </div>

          {/* Metrics grid */}
          <div className="dz-section-label">Cost Breakdown</div>
          <div className="dz-metrics">
            <MetricCard
              label="Transfer Fee"
              value={formatCurrency(analysis.fee)}
              sub={`${feePercent}% of ${formatCurrency(balance)}`}
              danger={analysis.fee > (analysis.savings ?? 0)}
            />
            <MetricCard
              label="Interest Saved vs Staying"
              value={
                analysis.savings !== null
                  ? formatCurrency(Math.max(0, analysis.savings))
                  : "—"
              }
              sub="Net benefit after fee"
              highlight={!!analysis.worthIt}
            />
            <MetricCard
              label="Break-Even Point"
              value={
                analysis.breakEvenMonths !== null
                  ? formatMonths(analysis.breakEvenMonths)
                  : "Never"
              }
              sub="When transfer starts saving money"
            />
          </div>

          {/* Required payment callout */}
          <div className="dz-callout-box">
            <div className="dz-callout-label">
              Required monthly payment to clear in promo window
            </div>
            <div className="dz-callout-value">
              {formatCurrency(analysis.reqPayment)}
              <span className="dz-callout-unit">/ month</span>
            </div>
            <p className="dz-callout-note">
              {analysis.clearsInPromo
                ? `✅ Your planned payment of ${formatCurrency(minPayment)}/mo meets this — you'd clear the balance within the ${promoMonths}-month promo window.`
                : `⚠️ Your planned payment of ${formatCurrency(minPayment)}/mo is below this. You'd have ${formatCurrency(analysis.remainingAfterPromo)} remaining when the promo expires, then paying ${regularAPR || currentAPR}% APR.`}
            </p>
          </div>

          {/* Timeline metrics */}
          <div className="dz-section-label">Payoff Timeline</div>
          <div className="dz-metrics">
            <MetricCard
              label="Stay on Current Card"
              value={formatMonths(analysis.stayMonths)}
              sub={`Total cost: ${analysis.stayCost !== null ? formatCurrency(balance + (analysis.stayCost)) : "—"}`}
            />
            <MetricCard
              label="Balance After Promo"
              value={formatCurrency(analysis.remainingAfterPromo)}
              sub={
                analysis.remainingAfterPromo < 1
                  ? "Fully paid in promo window 🎉"
                  : `Then ${isFinite(analysis.postPromoMonths) ? formatMonths(analysis.postPromoMonths) : "?"} more at ${regularAPR || currentAPR}%`
              }
            />
            <MetricCard
              label="Transfer Total Cost"
              value={formatCurrency(analysis.transferTotalCost)}
              sub="Fee + all interest paid"
              highlight={
                analysis.stayCost !== null &&
                analysis.transferTotalCost < analysis.stayCost
              }
            />
          </div>

          {/* Chart */}
          <div className="dz-section-label">Total Cost Comparison</div>
          <div className="dz-chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 16, left: 16, bottom: 8 }}
                barCategoryGap="35%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--bg-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`
                  }
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, color: "var(--text-muted)" }}
                />
                <Bar
                  dataKey="Interest Cost"
                  stackId="a"
                  fill="var(--accent-primary)"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="Transfer Fee"
                  stackId="a"
                  fill="var(--accent-secondary, #f59e0b)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Fine print */}
          <p className="dz-disclaimer">
            All calculations are estimates based on fixed monthly payments and
            do not account for variable rates, late fees, or changes in
            spending. Actual savings may vary. This is financial education, not
            advice — consult a financial professional for guidance specific to
            your situation.
          </p>
        </div>
      )}

      {/* Page styles */}
      <style>{`
        /* ── Layout ── */
        .dz-page {
          max-width: 860px;
          margin: 0 auto;
          padding: 2rem 1.25rem 4rem;
          font-family: var(--font-body, system-ui, sans-serif);
          color: var(--text-primary, #f0f0f0);
        }

        /* ── Header ── */
        .dz-eyebrow {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent-primary, #34d399);
          margin-bottom: 0.5rem;
        }
        .dz-page-title {
          font-size: clamp(1.6rem, 4vw, 2.2rem);
          font-weight: 700;
          line-height: 1.15;
          margin: 0 0 0.6rem;
          color: var(--text-primary, #f0f0f0);
        }
        .dz-page-sub {
          font-size: 0.975rem;
          color: var(--text-muted, #94a3b8);
          margin: 0 0 2rem;
          max-width: 580px;
          line-height: 1.6;
        }

        /* ── Educational callout ── */
        .dz-edu-callout {
          display: flex;
          gap: 1rem;
          background: var(--bg-surface, rgba(255,255,255,0.04));
          border: 1px solid var(--bg-border, rgba(255,255,255,0.08));
          border-left: 3px solid var(--accent-primary, #34d399);
          border-radius: var(--radius-md, 10px);
          padding: 1.25rem 1.25rem;
          margin-bottom: 2rem;
        }
        .dz-edu-icon { font-size: 1.3rem; flex-shrink: 0; margin-top: 1px; }
        .dz-edu-title {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-primary, #f0f0f0);
          margin-bottom: 0.4rem;
        }
        .dz-edu-body {
          font-size: 0.875rem;
          line-height: 1.65;
          color: var(--text-muted, #94a3b8);
          margin-bottom: 0.6rem;
        }
        .dz-edu-risks {
          font-size: 0.82rem;
          color: var(--text-muted, #94a3b8);
          line-height: 1.5;
          padding-top: 0.5rem;
          border-top: 1px solid var(--bg-border, rgba(255,255,255,0.07));
        }

        /* ── Input panels ── */
        .dz-panels {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-bottom: 2rem;
        }
        @media (max-width: 620px) {
          .dz-panels { grid-template-columns: 1fr; }
        }
        .dz-panel {
          background: var(--bg-surface, rgba(255,255,255,0.04));
          border: 1px solid var(--bg-border, rgba(255,255,255,0.08));
          border-radius: var(--radius-md, 12px);
          padding: 1.4rem 1.25rem;
        }
        .dz-panel-title {
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text-primary, #f0f0f0);
          margin: 0 0 1.2rem;
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .dz-panel-icon { font-size: 1rem; }
        .dz-fields { display: flex; flex-direction: column; gap: 1rem; }

        /* ── Input field ── */
        .dz-field { display: flex; flex-direction: column; gap: 0.2rem; }
        .dz-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary, #cbd5e1);
        }
        .dz-hint {
          font-size: 0.73rem;
          color: var(--text-muted, #64748b);
          margin: 0 0 0.2rem;
          line-height: 1.4;
        }
        .dz-input-wrap {
          display: flex;
          align-items: center;
          background: var(--bg-card, rgba(255,255,255,0.06));
          border: 1px solid var(--bg-border, rgba(255,255,255,0.1));
          border-radius: var(--radius-sm, 8px);
          overflow: hidden;
          transition: border-color 0.15s;
        }
        .dz-input-wrap:focus-within {
          border-color: var(--accent-primary, #34d399);
        }
        .dz-affix {
          padding: 0 0.6rem;
          font-size: 0.85rem;
          color: var(--text-muted, #64748b);
          background: var(--bg-surface, rgba(255,255,255,0.04));
          border-right: 1px solid var(--bg-border, rgba(255,255,255,0.08));
          height: 100%;
          display: flex;
          align-items: center;
          align-self: stretch;
          user-select: none;
        }
        .dz-affix-right {
          border-right: none;
          border-left: 1px solid var(--bg-border, rgba(255,255,255,0.08));
        }
        .dz-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          padding: 0.55rem 0.75rem;
          font-size: 0.95rem;
          color: var(--text-primary, #f0f0f0);
          min-width: 0;
        }
        .dz-input::placeholder { color: var(--text-muted, #475569); }

        /* ── Empty state ── */
        .dz-empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-muted, #64748b);
          font-size: 0.9rem;
          border: 1px dashed var(--bg-border, rgba(255,255,255,0.12));
          border-radius: var(--radius-md, 12px);
        }

        /* ── Results ── */
        .dz-results { display: flex; flex-direction: column; gap: 1.5rem; }

        /* ── Recommendation banner ── */
        .dz-recommendation {
          border-radius: var(--radius-md, 12px);
          padding: 1.4rem 1.5rem;
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          border: 1px solid transparent;
        }
        .dz-rec-yes {
          background: rgba(52, 211, 153, 0.1);
          border-color: rgba(52, 211, 153, 0.3);
        }
        .dz-rec-no {
          background: rgba(251, 113, 133, 0.08);
          border-color: rgba(251, 113, 133, 0.25);
        }
        .dz-rec-verdict {
          font-size: 1.05rem;
          font-weight: 700;
          white-space: nowrap;
          padding-top: 1px;
          min-width: 130px;
        }
        .dz-rec-reason {
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--text-secondary, #cbd5e1);
        }
        @media (max-width: 520px) {
          .dz-recommendation { flex-direction: column; gap: 0.5rem; }
        }

        /* ── Section label ── */
        .dz-section-label {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted, #64748b);
          margin-bottom: -0.5rem;
        }

        /* ── Metrics grid ── */
        .dz-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        @media (max-width: 560px) {
          .dz-metrics { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 380px) {
          .dz-metrics { grid-template-columns: 1fr; }
        }
        .dz-metric-card {
          background: var(--bg-surface, rgba(255,255,255,0.04));
          border: 1px solid var(--bg-border, rgba(255,255,255,0.08));
          border-radius: var(--radius-md, 10px);
          padding: 1rem 1.1rem;
        }
        .dz-metric-highlight {
          border-color: var(--accent-primary, #34d399);
          background: rgba(52, 211, 153, 0.06);
        }
        .dz-metric-danger {
          border-color: rgba(251, 113, 133, 0.3);
          background: rgba(251, 113, 133, 0.05);
        }
        .dz-metric-label {
          font-size: 0.75rem;
          color: var(--text-muted, #64748b);
          margin-bottom: 0.35rem;
          font-weight: 500;
        }
        .dz-metric-value {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-primary, #f0f0f0);
          line-height: 1.2;
          margin-bottom: 0.25rem;
        }
        .dz-metric-sub {
          font-size: 0.73rem;
          color: var(--text-muted, #64748b);
          line-height: 1.4;
        }

        /* ── Required payment callout box ── */
        .dz-callout-box {
          background: var(--bg-surface, rgba(255,255,255,0.04));
          border: 1px solid var(--bg-border, rgba(255,255,255,0.08));
          border-radius: var(--radius-md, 12px);
          padding: 1.25rem 1.4rem;
        }
        .dz-callout-label {
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--text-muted, #64748b);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 0.4rem;
        }
        .dz-callout-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--accent-primary, #34d399);
          line-height: 1.1;
          margin-bottom: 0.6rem;
        }
        .dz-callout-unit {
          font-size: 1rem;
          font-weight: 500;
          color: var(--text-muted, #94a3b8);
          margin-left: 0.3rem;
        }
        .dz-callout-note {
          font-size: 0.845rem;
          color: var(--text-muted, #94a3b8);
          line-height: 1.55;
          margin: 0;
          padding-top: 0.75rem;
          border-top: 1px solid var(--bg-border, rgba(255,255,255,0.07));
        }

        /* ── Chart ── */
        .dz-chart-container {
          background: var(--bg-surface, rgba(255,255,255,0.04));
          border: 1px solid var(--bg-border, rgba(255,255,255,0.08));
          border-radius: var(--radius-md, 12px);
          padding: 1.25rem 0.5rem 0.75rem;
        }

        /* ── Tooltip ── */
        .dz-tooltip {
          background: var(--bg-card, #1e2a38);
          border: 1px solid var(--bg-border, rgba(255,255,255,0.12));
          border-radius: 8px;
          padding: 0.65rem 0.9rem;
          font-size: 0.82rem;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        }
        .dz-tooltip-title {
          font-weight: 600;
          color: var(--text-primary, #f0f0f0);
          margin-bottom: 0.35rem;
          font-size: 0.8rem;
        }

        /* ── Disclaimer ── */
        .dz-disclaimer {
          font-size: 0.75rem;
          color: var(--text-muted, #475569);
          line-height: 1.6;
          margin: 0;
          padding-top: 0.5rem;
          border-top: 1px solid var(--bg-border, rgba(255,255,255,0.06));
        }

        /* ── Number input arrows ── */
        .dz-input::-webkit-inner-spin-button,
        .dz-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .dz-input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </div>
  );
}
