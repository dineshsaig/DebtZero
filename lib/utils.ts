// Shared utilities — maintained by the DebtZero core. Do not modify here.
// This stub exists so the calculators module can import types correctly.

/** Format a number as USD currency string */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format a month count as a human-readable string */
export function formatMonths(months: number): string {
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  if (yrs === 0) return `${mos} mo`;
  if (mos === 0) return `${yrs} yr`;
  return `${yrs} yr ${mos} mo`;
}

/** Calculate how many months to pay off a balance */
export function monthsToPayoff(
  balance: number,
  apr: number,
  monthlyPayment: number
): number {
  if (monthlyPayment <= 0) return Infinity;
  const monthlyRate = apr / 100 / 12;
  if (monthlyRate === 0) return Math.ceil(balance / monthlyPayment);
  if (monthlyPayment <= balance * monthlyRate) return Infinity;
  return Math.ceil(
    -Math.log(1 - (balance * monthlyRate) / monthlyPayment) /
      Math.log(1 + monthlyRate)
  );
}

/** Calculate total interest paid over the life of the loan */
export function totalInterestPaid(
  balance: number,
  apr: number,
  monthlyPayment: number
): number {
  const months = monthsToPayoff(balance, apr, monthlyPayment);
  if (!isFinite(months)) return Infinity;
  return months * monthlyPayment - balance;
}

/** Calculate the minimum monthly payment to pay off in a given number of months */
export function requiredMonthlyPayment(
  balance: number,
  apr: number,
  months: number
): number {
  const r = apr / 100 / 12;
  if (r === 0) return balance / months;
  return (balance * r) / (1 - Math.pow(1 + r, -months));
}

/** Add N months to a date */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** Format a payoff date as "Month Year" */
export function formatPayoffDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
