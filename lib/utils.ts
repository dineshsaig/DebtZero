/**
 * DebtZero — Utility Functions
 * Formatting, financial math, and helpers.
 */

/* ─── Currency Formatting ─────────────────────────────────────────── */

export function formatCurrency(
  amount: number,
  options: { compact?: boolean; showCents?: boolean } = {}
): string {
  const { compact = false, showCents = true } = options;

  if (compact && Math.abs(amount) >= 1000) {
    const k = amount / 1000;
    return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount);
}

export function formatPercent(rate: number, decimals = 2): string {
  return `${(rate * 100).toFixed(decimals)}%`;
}

export function formatAPR(decimalRate: number): string {
  return `${(decimalRate * 100).toFixed(2)}% APR`;
}

export function formatMonths(months: number): string {
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  if (remaining === 0) return `${years} yr${years > 1 ? "s" : ""}`;
  return `${years} yr ${remaining} mo`;
}

/* ─── Financial Math ──────────────────────────────────────────────── */

/**
 * Monthly interest charge on a balance.
 * @param balance   Current balance in dollars
 * @param annualAPR Annual interest rate as decimal (e.g. 0.2199 for 21.99%)
 */
export function monthlyInterest(balance: number, annualAPR: number): number {
  return balance * (annualAPR / 12);
}

/**
 * Months to pay off a balance with a fixed monthly payment.
 * Returns Infinity if payment doesn't cover interest.
 */
export function monthsToPayoff(
  balance: number,
  annualAPR: number,
  monthlyPayment: number
): number {
  const monthlyRate = annualAPR / 12;
  if (monthlyRate === 0) {
    return Math.ceil(balance / monthlyPayment);
  }
  const interest = monthlyInterest(balance, annualAPR);
  if (monthlyPayment <= interest) return Infinity;

  return Math.ceil(
    -Math.log(1 - (balance * monthlyRate) / monthlyPayment) /
      Math.log(1 + monthlyRate)
  );
}

/**
 * Total interest paid over the life of a debt with fixed payments.
 */
export function totalInterestPaid(
  balance: number,
  annualAPR: number,
  monthlyPayment: number
): number {
  const months = monthsToPayoff(balance, annualAPR, monthlyPayment);
  if (!isFinite(months)) return Infinity;
  return monthlyPayment * months - balance;
}

/**
 * Required monthly payment to pay off a balance in exactly N months.
 */
export function requiredMonthlyPayment(
  balance: number,
  annualAPR: number,
  months: number
): number {
  const monthlyRate = annualAPR / 12;
  if (monthlyRate === 0) return balance / months;
  return (
    (balance * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
}

/**
 * Credit utilization ratio.
 */
export function utilizationRatio(balance: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.min(balance / limit, 1);
}

/**
 * Balance transfer fee.
 */
export function transferFee(
  amount: number,
  feePercent: number,
  feeMin: number
): number {
  return Math.max(amount * feePercent, feeMin);
}

/* ─── Date helpers ────────────────────────────────────────────────── */

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function formatPayoffDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/* ─── Debt sorting helpers ────────────────────────────────────────── */

import type { Debt } from "./types";

/** Sort debts highest interest rate first (Avalanche order) */
export function sortByAvalanche(debts: Debt[]): Debt[] {
  return [...debts].sort((a, b) => b.interestRate - a.interestRate);
}

/** Sort debts lowest balance first (Snowball order) */
export function sortBySnowball(debts: Debt[]): Debt[] {
  return [...debts].sort((a, b) => a.balance - b.balance);
}

/** Total of all debt balances */
export function totalBalance(debts: Debt[]): number {
  return debts.reduce((sum, d) => sum + d.balance, 0);
}

/** Total minimum payments across all debts */
export function totalMinimumPayments(debts: Debt[]): number {
  return debts.reduce((sum, d) => sum + d.minimumPayment, 0);
}

/* ─── ID generation ───────────────────────────────────────────────── */

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/* ─── Validation ──────────────────────────────────────────────────── */

export function isValidAPR(rate: number): boolean {
  return rate >= 0 && rate <= 1;
}

export function isValidBalance(balance: number): boolean {
  return balance >= 0 && isFinite(balance);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
