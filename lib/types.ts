/**
 * DebtZero — Core TypeScript Types
 * Shared across features, calculators, and UI.
 */

/* ─── Debt & Accounts ─────────────────────────────────────────────── */

export type DebtType =
  | "credit_card"
  | "personal_loan"
  | "student_loan"
  | "auto_loan"
  | "medical"
  | "mortgage"
  | "other";

export interface Debt {
  id:             string;
  name:           string;
  type:           DebtType;
  balance:        number;        // Current balance in dollars
  interestRate:   number;        // APR as a decimal, e.g. 0.2199 = 21.99%
  minimumPayment: number;        // Required minimum monthly payment
  creditLimit?:   number;        // For credit cards — used for utilization calc
  dueDate?:       number;        // Day of month (1–28)
  notes?:         string;
}

export interface DebtWithPayoff extends Debt {
  monthsToPayoff:       number;
  totalInterestPaid:    number;
  payoffDate:           Date;
  currentUtilization?:  number;  // balance / creditLimit
}

/* ─── Strategies ──────────────────────────────────────────────────── */

export type PayoffStrategy = "avalanche" | "snowball" | "custom";

export interface PayoffPlan {
  strategy:          PayoffStrategy;
  extraMonthlyPayment: number;     // Additional dollars above all minimums
  debtOrder:         string[];     // Debt IDs in payoff priority order
  schedule:          MonthlySnapshot[];
  totalMonths:       number;
  totalInterestPaid: number;
  totalPaid:         number;
  debtFreeDate:      Date;
}

export interface MonthlySnapshot {
  month:           number;         // 1-indexed
  date:            Date;
  balances:        Record<string, number>;  // debtId → remaining balance
  totalBalance:    number;
  totalPaid:       number;
  interestPaid:    number;
  principalPaid:   number;
  debtsCleared:    string[];       // IDs of debts paid off this month
}

/* ─── Budget ──────────────────────────────────────────────────────── */

export interface BudgetEntry {
  id:       string;
  category: BudgetCategory;
  name:     string;
  amount:   number;
  type:     "fixed" | "variable" | "debt" | "savings";
}

export type BudgetCategory =
  | "housing"
  | "transportation"
  | "food"
  | "utilities"
  | "healthcare"
  | "personal"
  | "entertainment"
  | "debt_payment"
  | "savings"
  | "other";

export interface BudgetSummary {
  totalIncome:     number;
  totalExpenses:   number;
  totalDebtPayments: number;
  totalSavings:    number;
  remaining:       number;
  savingsRate:     number;         // 0–1
  debtToIncomeRatio: number;       // 0–1
}

/* ─── Balance Transfer ────────────────────────────────────────────── */

export interface BalanceTransferOffer {
  id:               string;
  cardName:         string;
  promotionalAPR:   number;        // Usually 0
  promotionalMonths: number;
  regularAPR:       number;
  transferFeePercent: number;      // E.g. 0.03 = 3%
  transferFeeMin:   number;        // Minimum fee in dollars
  creditLimit?:     number;
}

export interface BalanceTransferAnalysis {
  offer:             BalanceTransferOffer;
  transferAmount:    number;
  transferFee:       number;
  interestSavedVsMinimum: number;
  breakevenMonths:   number;
  worthIt:           boolean;
  requiredMonthlyPayment: number;  // To clear within promo period
}

/* ─── User Settings ───────────────────────────────────────────────── */

export type Theme = "midnight" | "glass" | "light";
export type AccentColor = "mint" | "blue" | "purple" | "gold" | "pink" | "teal";
export type BorderRadius = "sharp" | "rounded" | "soft";

export interface AppSettings {
  theme:        Theme;
  accent:       AccentColor;
  borderRadius: BorderRadius;
}

/* ─── Navigation ──────────────────────────────────────────────────── */

export interface NavItem {
  label:    string;
  href:     string;
  icon?:    string;
  badge?:   string;
  children?: NavItem[];
}

/* ─── Utilities ───────────────────────────────────────────────────── */

export type Currency = "USD" | "GBP" | "EUR" | "CAD" | "AUD";

export interface FormattingOptions {
  currency: Currency;
  locale:   string;
}
