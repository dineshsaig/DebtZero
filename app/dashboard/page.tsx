import type { Metadata } from "next";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — DebtZero",
  description: "Track your debts, compare payoff strategies, and see your debt-free date.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
