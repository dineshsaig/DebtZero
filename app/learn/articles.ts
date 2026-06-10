export type Category = "credit" | "debt" | "budgeting" | "planning";

export interface Article {
  slug: string;
  title: string;
  subtitle: string;
  category: Category;
  readingTime: number; // minutes
  relatedTool?: { label: string; href: string };
  keyTakeaways: string[];
  sections: ArticleSection[];
  commonMistakes: string[];
  workedExample: WorkedExample;
}

export interface ArticleSection {
  id: string;
  heading: string;
  body: string; // markdown-like paragraphs separated by \n\n
  steps?: Step[];
}

export interface Step {
  title: string;
  detail: string;
}

export interface WorkedExample {
  title: string;
  scenario: string;
  rows: { label: string; value: string; highlight?: boolean }[];
  conclusion: string;
}

export const CATEGORIES: Record<Category, { label: string; color: string }> = {
  credit: { label: "Credit", color: "var(--accent-primary)" },
  debt: { label: "Debt", color: "#f59e0b" },
  budgeting: { label: "Budgeting", color: "#10b981" },
  planning: { label: "Planning", color: "#8b5cf6" },
};

export const articles: Article[] = [
  {
    slug: "how-apr-works",
    title: "How APR Actually Works",
    subtitle:
      "Most people misread their credit card's interest rate. Here's what APR really means—and how daily compounding quietly inflates your balance.",
    category: "credit",
    readingTime: 7,
    relatedTool: { label: "Payoff Calculator", href: "/calculators" },
    keyTakeaways: [
      "APR stands for Annual Percentage Rate, but credit cards charge interest daily.",
      "Your Daily Periodic Rate is APR ÷ 365—this is the number that actually compounds.",
      "A 20% APR doesn't cost 20% per year when you carry a balance—it costs more.",
      "The average daily balance method determines how much interest you're charged each month.",
      "Paying in full every month means you pay zero interest, regardless of your APR.",
    ],
    sections: [
      {
        id: "what-is-apr",
        heading: "What APR Actually Means",
        body: `APR stands for Annual Percentage Rate. It's the yearly cost of borrowing money expressed as a percentage. But here's the catch that trips up most cardholders: credit cards don't charge you annually. They charge you daily.\n\nThis matters because of compounding. When interest is added to your balance each day, you start paying interest on your interest. Over a year, this means a 20% APR costs you slightly more than 20%—it compounds to roughly 21.9% actual annual cost, known as APY (Annual Percentage Yield).\n\nThe Federal Truth in Lending Act requires lenders to disclose APR, which is why you see it on every card offer. But APR is a standardized number for comparison—the real engine running under the hood is your Daily Periodic Rate.`,
      },
      {
        id: "daily-periodic-rate",
        heading: "The Daily Periodic Rate (DPR)",
        body: `Your Daily Periodic Rate is the number that actually determines your charges. The formula is simple:\n\n**DPR = APR ÷ 365**\n\nFor a card with 22% APR, your DPR is 22% ÷ 365 = 0.0603% per day. That sounds tiny. But multiply it by a $5,000 balance and you're being charged about $3.01 in interest every single day you carry that balance.\n\nOver a 30-day billing cycle, that's $90 in interest on $5,000—even if you made purchases in the middle of the month. Which brings us to the average daily balance method.`,
      },
      {
        id: "average-daily-balance",
        heading: "How Your Balance Is Calculated",
        body: `Credit card companies don't just look at your balance at the end of the month. They calculate the average daily balance—the sum of your balance on each day of the billing cycle, divided by the number of days.\n\nThis means a purchase you make on day 1 of your billing cycle costs you more in interest than one made on day 28, because it's carried for more days. Timing your spending can make a small difference, but the real takeaway is this: every dollar you add to your balance starts accruing interest immediately (after any grace period expires).\n\nMost cards offer a grace period of 21–25 days between your statement closing date and your payment due date. If you pay your statement balance in full before the due date, no interest is charged. The moment you carry even $1 over, you typically lose the grace period on new purchases too.`,
        steps: [
          {
            title: "Find your DPR",
            detail: "Divide your APR by 365. A 24% APR = 0.0658% per day.",
          },
          {
            title: "Calculate your average daily balance",
            detail:
              "Add up your balance at the end of each day in the billing cycle, then divide by the number of days.",
          },
          {
            title: "Multiply",
            detail:
              "Interest charge = Average Daily Balance × DPR × Number of Days in Cycle.",
          },
          {
            title: "Check your statement",
            detail:
              "Your card's monthly statement shows this calculation. Compare it to your own math to verify.",
          },
        ],
      },
      {
        id: "apr-vs-apy",
        heading: "APR vs. APY: The Real Cost",
        body: `Banks advertise savings accounts using APY because compounding makes the number look bigger. They advertise loans using APR because compounding makes the number look smaller. Understanding this asymmetry is one of the most valuable things you can learn about personal finance.\n\nFor credit cards specifically, the effective annual rate you actually pay is always slightly higher than the stated APR when you carry a balance month to month. The difference isn't enormous, but on large balances it adds up. A $10,000 balance at 20% APR, carried for a full year, costs not $2,000 but approximately $2,214—because each month's interest becomes part of next month's balance.`,
      },
    ],
    workedExample: {
      title: "Real Numbers: What Does 22% APR Cost You?",
      scenario:
        "You have a credit card with 22% APR. You carry a $3,500 balance for the full month. Here's exactly what you'll be charged.",
      rows: [
        { label: "Starting balance", value: "$3,500.00" },
        { label: "APR", value: "22%" },
        { label: "Daily Periodic Rate (22% ÷ 365)", value: "0.06027% / day" },
        { label: "Billing cycle length", value: "30 days" },
        {
          label: "Interest charge (3,500 × 0.0006027 × 30)",
          value: "$63.28",
          highlight: true,
        },
        { label: "New balance after interest", value: "$3,563.28" },
        {
          label: "Annual cost if balance never changes",
          value: "~$775.64",
          highlight: true,
        },
      ],
      conclusion:
        "That $775 isn't buying you anything—it's the rent you pay to borrow $3,500. Reducing that balance by even $500 saves you roughly $110/year in pure interest. Every dollar of principal you pay down eliminates future interest charges permanently.",
    },
    commonMistakes: [
      "Assuming APR is charged once per year. Interest accrues daily, not annually.",
      "Ignoring the grace period. If you pay in full each month, you can use the card interest-free.",
      "Making only minimum payments. A small payment barely dents the principal when interest is high.",
      "Confusing APR with APY. The effective annual cost with compounding is always higher than the stated APR.",
      "Not comparing APRs when transferring balances. A lower APR isn't always better after fees.",
    ],
  },
  {
    slug: "minimum-payments",
    title: "The Minimum Payment Trap",
    subtitle:
      "Minimum payments are designed to keep you in debt longer. Here's exactly what they cost you—and how to escape.",
    category: "debt",
    readingTime: 8,
    relatedTool: { label: "Payoff Calculator", href: "/calculators" },
    keyTakeaways: [
      "Minimum payments are typically 1–2% of your balance, or $25, whichever is higher.",
      "On a $5,000 balance at 20% APR, minimum-only payments take 17+ years to pay off.",
      "You'll pay more in interest than the original balance if you stick to minimums.",
      "Doubling your minimum payment can cut payoff time by more than half.",
      "Card issuers are legally required to show you the true cost of minimums on your statement.",
    ],
    sections: [
      {
        id: "how-minimums-are-set",
        heading: "How Minimum Payments Are Calculated",
        body: `Credit card companies set minimum payments low on purpose. A lower required payment keeps you in debt longer, which means more interest revenue for them. Understanding how minimums are calculated reveals why they're structured this way.\n\nMost issuers use one of two formulas:\n\n**Formula 1 (Percentage):** The minimum is a percentage of your current balance—typically 1% to 2%—plus any accrued interest and fees.\n\n**Formula 2 (Fixed floor):** If the percentage calculation produces a very small number, a minimum floor applies—commonly $25 or $35.\n\nAs you pay down your balance, your minimum payment shrinks too. This is called the "declining balance" method, and it's particularly insidious: you naturally pay less and less each month, which slows your progress dramatically compared to keeping your payment fixed.`,
      },
      {
        id: "true-cost",
        heading: "The True Cost of Minimum Payments",
        body: `The numbers here should make your stomach turn—not because you should feel bad, but because once you see them clearly, you can make better decisions.\n\nOn a $5,000 credit card balance at 20% APR, paying only the minimum each month means:\n- **Payoff time:** Approximately 17 years and 3 months\n- **Total interest paid:** Approximately $4,311\n- **Total amount paid:** Approximately $9,311—nearly double the original balance\n\nHere's the crucial nuance: those numbers assume your minimum payment declines as your balance shrinks. If you instead locked in a fixed payment equal to your first month's minimum (around $117), you'd pay off the debt in about 5 years and pay roughly $2,000 in interest instead—a $2,300 difference from the exact same starting payment amount.`,
      },
      {
        id: "amortization",
        heading: "Why Progress Feels So Slow",
        body: `In the early months of paying off high-interest debt, almost all of your payment goes to interest, not principal. On a $5,000 balance at 20% APR, your first month's interest charge is about $83. If your minimum is $100, only $17 reduces your actual debt.\n\nThis is why making even slightly more than the minimum has such a large impact. That extra $17, $30, or $50 goes entirely to principal—reducing the balance that future interest is calculated on. The math compounds in your favor when you overpay, just as it compounds against you when you underpay.\n\nCard issuers are required by law (since the CARD Act of 2009) to print a "Minimum Payment Warning" on your statement showing how long payoff takes with minimum payments only, and what a 3-year payoff payment would cost. That box on your statement is worth reading.`,
        steps: [
          {
            title: "Find your statement's minimum payment warning",
            detail:
              "Locate the federally-required disclosure box. It shows your true payoff timeline at minimum payments.",
          },
          {
            title: "Calculate your interest-to-principal ratio",
            detail:
              "Divide last month's interest charge by your minimum payment. If 70%+ goes to interest, you need to pay more.",
          },
          {
            title: "Set a fixed monthly payment",
            detail:
              "Don't let your payment shrink as your balance does. Lock in an amount and keep it constant.",
          },
          {
            title: "Find your break-even payment",
            detail:
              "Your minimum payment should at least exceed the monthly interest charge. Anything less means your balance is growing, not shrinking.",
          },
          {
            title: "Use windfalls strategically",
            detail:
              "Tax refunds, bonuses, or unexpected income applied to principal can dramatically shorten your payoff timeline.",
          },
        ],
      },
      {
        id: "fixed-vs-declining",
        heading: "Fixed vs. Declining Payments",
        body: `The single most effective free action you can take with your credit card debt is to fix your monthly payment at its current level and never let it drop, even as your balance decreases.\n\nMost people pay whatever their statement says is due. As the balance drops, so does the required minimum. By the time you owe $2,000, you might only be required to pay $50/month—but at 20% APR, $33 of that is interest. You're barely moving.\n\nFixing your payment at, say, $200/month when your balance is $5,000, and keeping it there until the debt is gone, is a simple discipline with enormous financial impact. You're effectively accelerating the avalanche.`,
      },
    ],
    workedExample: {
      title: "Minimum vs. Fixed Payment: Side by Side",
      scenario:
        "Starting balance: $5,000. APR: 20%. First minimum payment: ~$115. Compare three payment strategies.",
      rows: [
        { label: "Strategy", value: "Payoff Time | Total Interest" },
        {
          label: "Minimum-only (declining)",
          value: "17 yrs 3 mo | $4,311",
          highlight: false,
        },
        {
          label: "Fixed $115/month",
          value: "5 yrs 8 mo | $2,789",
          highlight: false,
        },
        {
          label: "Fixed $200/month",
          value: "2 yrs 11 mo | $948",
          highlight: true,
        },
        {
          label: "Fixed $300/month",
          value: "1 yr 10 mo | $593",
          highlight: true,
        },
        { label: "Extra interest (min vs $200)", value: "$3,363 wasted" },
      ],
      conclusion:
        "The difference between paying $115 and $200 per month—just $85 more—saves over $3,300 in interest and cuts payoff time by 14 years. That $85/month invested instead would grow significantly over 14 years. The sooner you escape minimum payments, the more your money works for you.",
    },
    commonMistakes: [
      "Letting the payment decline as the balance drops—always keep a fixed, higher payment.",
      "Believing you're 'making progress' when most of your payment is interest.",
      "Making only the minimum on one card while leaving others untouched—focus your extra payments.",
      "Not reading the minimum payment warning on your statement—it's required by law and full of useful data.",
      "Treating a lower minimum as 'extra room in the budget' rather than a red flag.",
    ],
  },
  {
    slug: "credit-utilization",
    title: "Credit Utilization Explained",
    subtitle:
      "Your credit score is more sensitive to this number than almost anything else. Here's how to manage it strategically.",
    category: "credit",
    readingTime: 6,
    relatedTool: { label: "Balance Transfer Analyzer", href: "/balance-transfer" },
    keyTakeaways: [
      "Credit utilization is your total balance divided by your total credit limit, expressed as a percentage.",
      "It makes up approximately 30% of your FICO score—the second largest factor.",
      "Keeping utilization below 30% is the standard advice; below 10% is where scores improve most.",
      "Utilization is calculated both per-card and across all cards.",
      "Scores update as soon as your issuer reports your new balance—usually monthly.",
    ],
    sections: [
      {
        id: "what-is-utilization",
        heading: "What Credit Utilization Actually Measures",
        body: `Credit utilization measures how much of your available revolving credit you're currently using. It's calculated two ways simultaneously by credit bureaus:\n\n**Overall utilization:** Total balances across all cards ÷ Total credit limits across all cards.\n\n**Per-card utilization:** Balance on each card ÷ That card's individual limit.\n\nBoth matter. You can have a low overall utilization but a single maxed-out card dragging your score down. FICO and VantageScore models penalize high utilization on individual cards even when your total picture looks fine.\n\nUtilization only applies to revolving credit—credit cards and lines of credit. Installment loans (auto, student, mortgage) are treated differently and don't factor into utilization.`,
      },
      {
        id: "impact-on-score",
        heading: "How Much Does It Actually Affect Your Score?",
        body: `Utilization is the most volatile part of your credit score because it can change month to month as balances fluctuate. According to FICO, credit utilization accounts for approximately 30% of your score—second only to payment history (35%).\n\nThe relationship between utilization and score isn't linear. Going from 90% utilization to 50% is a meaningful improvement, but going from 30% to 9% often produces the biggest score jumps. This is because scoring models view very low utilization as a signal that you're managing credit conservatively.\n\nImportantly, utilization has no memory. Unlike late payments, which can affect your score for 7 years, high utilization can be "undone" the moment your balance drops. Pay off a maxed card today, and next month's score should reflect the improvement.`,
      },
      {
        id: "strategy",
        heading: "Strategic Utilization Management",
        body: `Once you understand that utilization is reported based on your statement balance—not your payment status—you can time your payments to optimize your score.\n\nYour issuer typically reports your balance to the credit bureaus around the time your statement closes. This means a balance you pay in full before the due date can still appear as a high utilization on your credit report if you ran up the balance mid-cycle.\n\nIf you're preparing for a major loan application (mortgage, auto loan), timing matters: make a large payment a few weeks before applying so your reported balance is low when the lender pulls your credit.`,
        steps: [
          {
            title: "Know your reporting date",
            detail:
              "Call your issuer or log in online to find when they report to bureaus. It's usually near statement closing.",
          },
          {
            title: "Pay down before the statement closes",
            detail:
              "Not just before the due date—before the statement closes. That's what gets reported.",
          },
          {
            title: "Don't close old cards",
            detail:
              "Closing a card reduces your total available credit, instantly increasing your utilization ratio.",
          },
          {
            title: "Request a credit limit increase",
            detail:
              "More available credit lowers your utilization without changing your balance. Ask issuers every 6–12 months.",
          },
          {
            title: "Spread balances across cards",
            detail:
              "A $1,000 balance on a $2,000 limit card (50%) hurts more than the same balance split across two $5,000 limit cards (10% each).",
          },
        ],
      },
      {
        id: "debt-payoff",
        heading: "Utilization While Paying Off Debt",
        body: `If you're carrying balances while also trying to improve your credit score, there's an inherent tension: the debt itself is the problem, but how quickly you address it affects your utilization month to month.\n\nThe most effective approach is to focus on paying down the card closest to its limit first, from a score perspective—even if another card has a higher interest rate. This is the score-optimized approach, distinct from the debt-optimized approach (Avalanche method).\n\nIn most cases, the interest savings from the Avalanche method outweigh the marginal score benefit of targeting high-utilization cards. But if your credit score is the immediate priority—say, you need a mortgage in 6 months—temporarily shifting focus to the most-utilized card can yield a meaningful score bump.`,
      },
    ],
    workedExample: {
      title: "Calculating Your Utilization Ratio",
      scenario:
        "You have three credit cards. Here's how to calculate your utilization—and why one card is hurting your score more than the others.",
      rows: [
        { label: "Card A — Limit: $5,000 | Balance: $4,200", value: "84% util" },
        { label: "Card B — Limit: $8,000 | Balance: $1,400", value: "17.5% util" },
        { label: "Card C — Limit: $2,000 | Balance: $0", value: "0% util" },
        {
          label: "Overall utilization ($5,600 ÷ $15,000)",
          value: "37.3%",
          highlight: false,
        },
        {
          label: "Card A alone is causing damage",
          value: "84% → high-risk flag",
          highlight: true,
        },
        {
          label: "Target: Pay Card A to $500",
          value: "New util = 10% — score jump likely",
          highlight: true,
        },
      ],
      conclusion:
        "Even though your overall utilization is 37%, Card A at 84% is being flagged individually by scoring models. Moving $3,700 from Card A to Card C (via balance transfer if rates allow) would drop Card A to 10% and improve your score significantly—without changing your total debt at all.",
    },
    commonMistakes: [
      "Closing old, unused cards to 'simplify'—this reduces available credit and spikes utilization.",
      "Paying on the due date instead of before the statement closes—high balances still get reported.",
      "Ignoring per-card utilization because overall looks fine—individual card limits matter separately.",
      "Requesting a credit limit increase right before applying for a loan—this triggers a hard inquiry.",
      "Assuming carrying a small balance 'builds credit'—it doesn't. Zero utilization is fine if you're active.",
    ],
  },
  {
    slug: "balance-transfers",
    title: "When Balance Transfers Make Sense",
    subtitle:
      "A 0% promotional APR can save you thousands—but only if you understand the fees, deadlines, and traps that come with it.",
    category: "debt",
    readingTime: 9,
    relatedTool: { label: "Balance Transfer Analyzer", href: "/balance-transfer" },
    keyTakeaways: [
      "Balance transfers move debt from high-APR cards to a new card with a promotional 0% period.",
      "Most transfers charge a fee of 3–5% of the amount transferred.",
      "The promotional period typically lasts 12–21 months—after which the regular APR kicks in.",
      "Any remaining balance at the end of the promo period is immediately subject to full APR.",
      "Balance transfers work best when you can pay off most or all of the balance during the promo window.",
    ],
    sections: [
      {
        id: "how-transfers-work",
        heading: "How a Balance Transfer Works",
        body: `A balance transfer is exactly what it sounds like: you move an existing credit card balance to a different card—usually one offering a 0% introductory APR period. During that promotional window, no interest accrues on the transferred amount, giving you a runway to pay down principal faster.\n\nHere's the process:\n1. Apply for a card with a 0% balance transfer offer.\n2. If approved, provide your old card details to the new issuer.\n3. The new issuer pays off your old card and creates a balance on the new one.\n4. You make payments on the new card, with 0% interest until the promo ends.\n\nThe practical effect is that every dollar you pay during the promo period goes entirely to principal—not split between principal and interest. On a $5,000 balance at 20% APR, that's roughly $80/month you'd no longer be wasting on interest charges.`,
      },
      {
        id: "the-fee",
        heading: "The Balance Transfer Fee: Is It Worth It?",
        body: `Almost all balance transfer cards charge a fee of 3% to 5% of the transferred amount. On a $5,000 transfer, that's $150–$250 added to your new balance upfront.\n\nBefore assuming the transfer is worth it, calculate your break-even point:\n\n**Break-even = Transfer Fee ÷ Monthly Interest Savings**\n\nIf your 20% APR card charges $83/month in interest on a $5,000 balance, and the transfer fee is $150, you break even after about 2 months. After that, every month in the promo period is pure savings.\n\nThe math almost always favors the transfer when the promo period is 12+ months and you have a clear payoff plan. The math works against you when you'd pay the transfer fee and then fail to pay down the balance before the promotional rate expires.`,
      },
      {
        id: "risks",
        heading: "The Real Risks of Balance Transfers",
        body: `Balance transfers are powerful tools used incorrectly surprisingly often. Here are the genuine risks:\n\n**The deferred interest trap:** Some offers (particularly from store cards) are "deferred interest," not true 0% APR. If you don't pay the full balance by the promo end date, all the interest that would have accrued is charged retroactively. Read the fine print carefully.\n\n**New purchases:** Payments on balance transfer cards typically apply to promotional balances last. If you make new purchases, those accrue interest at the regular APR immediately, and your payments go to the 0% balance first. Use a different card for new spending.\n\n**The credit score dip:** Opening a new card triggers a hard inquiry and reduces your average account age—both of which can temporarily lower your score by a few points. This usually recovers within 6–12 months.\n\n**The 0% expiration:** If you have a balance remaining when the promotional period ends, the full regular APR applies immediately—often 20%–29%. Plan your payoff before the deadline.`,
        steps: [
          {
            title: "Calculate your break-even",
            detail:
              "Transfer fee ÷ monthly interest savings = months to break even. If it's less than 3, the transfer is almost certainly worth it.",
          },
          {
            title: "Confirm it's true 0% APR (not deferred interest)",
            detail:
              "Read the terms. Look for language about 'interest will not be charged' vs. 'interest will be waived if paid in full.'",
          },
          {
            title: "Set up a payoff schedule before you transfer",
            detail:
              "Divide the transferred amount by the number of months in the promo period. That's your monthly payment target.",
          },
          {
            title: "Don't use the new card for purchases",
            detail:
              "New purchases won't benefit from the 0% rate and complicate your payoff math.",
          },
          {
            title: "Set a calendar alert 60 days before the promo ends",
            detail:
              "You need time to pay off any remaining balance or plan next steps before the rate spikes.",
          },
        ],
      },
      {
        id: "timing",
        heading: "Timing and Credit Score Considerations",
        body: `A balance transfer isn't free from a credit score perspective. Applying opens a hard inquiry (typically -2 to -5 points, temporary) and creates a new account that lowers your average account age (affects 15% of your score).\n\nThe score impact matters most when you have a major loan application coming up—mortgage, auto loan, apartment rental. In that case, wait until after the application if possible.\n\nIf you're not planning a major application in the next 6–12 months, the interest savings of a good balance transfer almost always outweigh the temporary score impact. A 20-point dip on your score costs you far less than thousands of dollars in interest.`,
      },
    ],
    workedExample: {
      title: "Real Transfer Savings: $6,000 at 22% APR",
      scenario:
        "You have $6,000 on a card at 22% APR. You're approved for a balance transfer card with 0% APR for 18 months and a 3% transfer fee.",
      rows: [
        { label: "Starting balance", value: "$6,000" },
        { label: "Transfer fee (3%)", value: "$180" },
        { label: "New balance on transfer card", value: "$6,180" },
        {
          label: "Monthly payment needed to clear in 18 months",
          value: "$343 / month",
        },
        { label: "Interest paid during 18-month promo", value: "$0" },
        {
          label: "Interest avoided vs. staying on old card",
          value: "~$1,740",
          highlight: true,
        },
        {
          label: "Net savings after transfer fee",
          value: "~$1,560",
          highlight: true,
        },
      ],
      conclusion:
        "The $180 fee buys you $1,560 in savings—a 767% return on the fee. The key assumption is that you make every $343 payment and clear the balance before month 18. If you miss that deadline with $2,000 remaining, the 22% APR applies immediately to that balance going forward. The transfer is a powerful tool only if paired with a firm payoff plan.",
    },
    commonMistakes: [
      "Confusing deferred interest with true 0% APR—always read the fine print.",
      "Making new purchases on the transfer card and wondering why interest is accruing.",
      "Calculating payoff loosely and running out of promo time with a remaining balance.",
      "Applying for a balance transfer card right before a mortgage application.",
      "Closing the original card after transferring—this reduces your available credit and hurts utilization.",
    ],
  },
  {
    slug: "emergency-fund",
    title: "Building an Emergency Fund While in Debt",
    subtitle:
      "Should you save or pay off debt first? The math, the psychology, and the right answer for most situations.",
    category: "planning",
    readingTime: 7,
    relatedTool: { label: "Budget Planner", href: "/budget" },
    keyTakeaways: [
      "A small starter emergency fund ($1,000–$2,000) should come before aggressive debt payoff.",
      "Without a cushion, unexpected expenses force you back into debt—resetting your progress.",
      "High-interest debt (over 7–8%) typically earns a better 'return' from payoff than saving.",
      "Once you have a starter fund, direct most extra dollars to debt until it's gone.",
      "The optimal split depends on your debt interest rates, income stability, and risk tolerance.",
    ],
    sections: [
      {
        id: "the-dilemma",
        heading: "The Core Dilemma",
        body: `This is one of the most common questions in personal finance, and it has a genuine tension at its core: paying off 20% APR debt is mathematically equivalent to earning a guaranteed 20% return on your money. No savings account or safe investment offers anything close to that.\n\nAnd yet, the personal finance community broadly agrees: build a small emergency fund first, even when you have debt. The reason is behavioral and systemic, not mathematical.\n\nWithout any emergency fund, a single unexpected expense—a car repair, a medical bill, a job disruption—forces you back onto high-interest credit. That one $800 emergency can undo months of debt progress. The emergency fund isn't just savings; it's protection for your debt payoff plan.`,
      },
      {
        id: "starter-fund",
        heading: "The Starter Emergency Fund",
        body: `The standard recommendation for most people carrying high-interest debt is a starter emergency fund of $1,000 to $2,000. This isn't a full emergency fund—financial planning guidelines suggest 3–6 months of expenses—but it's enough to handle most unexpected expenses without reaching for a credit card.\n\nOnce your starter fund is in place, the math shifts decisively toward debt payoff. High-interest debt (anything above roughly 6–7% APR) should be treated as your highest-priority investment, because paying it off is equivalent to earning that interest rate guaranteed.\n\nWhere to keep it: a high-yield savings account, separate from your checking account, easy to access but not so easy you spend it casually. Online banks routinely offer 4–5% APY on savings accounts, which makes the 'cost' of holding cash lower than it used to be.`,
      },
      {
        id: "the-math",
        heading: "The Math of Debt vs. Saving",
        body: `Let's be precise. If you have $200 of extra money each month, here are your options:\n\n**Option A: Save it.** At 4.5% APY in a high-yield savings account, $200/month grows to about $2,500 over 12 months (with interest).\n\n**Option B: Pay extra on 20% APR debt.** $200/month applied to a $5,000 balance saves approximately $1,240 in interest compared to minimum payments, and cuts payoff time dramatically.\n\nOption B wins financially—not because saving is bad, but because high-interest debt represents a guaranteed negative return that beats any safe savings rate. The exception: if your employer offers a 401(k) match, contribute enough to get the full match first. A 50% or 100% employer match is a guaranteed return that beats even 20% debt repayment.`,
        steps: [
          {
            title: "Save $1,000–$2,000 first",
            detail:
              "Build your starter emergency fund before making extra debt payments. This takes priority over aggressive payoff.",
          },
          {
            title: "Capture any employer 401(k) match",
            detail:
              "If your employer matches contributions, contribute at least enough to get the full match—that's free money.",
          },
          {
            title: "Focus extra payments on high-interest debt",
            detail:
              "Once the starter fund is set, direct all additional dollars to your highest-rate debt (Avalanche method).",
          },
          {
            title: "Rebuild the emergency fund after debt is paid",
            detail:
              "When high-interest debt is eliminated, redirect those payments to building a full 3–6 month emergency fund.",
          },
          {
            title: "Reassess as your situation changes",
            detail:
              "Job security changes, income changes, and family situations all affect the right savings-to-debt ratio.",
          },
        ],
      },
      {
        id: "income-stability",
        heading: "Adjusting for Income Stability",
        body: `The math-optimized answer (pay debt first) assumes stable income. If your income is irregular—freelance, seasonal, commission-based—or if your job feels at risk, the calculus shifts. A larger emergency fund provides more protection against the income disruption that could force you back into debt or worse.\n\nIf you're in a stable job with reliable income and low unemployment risk in your field, a $1,000–$2,000 starter fund is usually sufficient while you aggressively pay down debt. If your income is variable or your industry is volatile, consider building toward one to two months of expenses before redirecting all energy to debt payoff.\n\nThe psychological benefit also matters. Some people find that having a meaningful emergency fund—even while carrying debt—reduces financial anxiety enough that they make better decisions overall. Your plan has to be one you'll actually stick to.`,
      },
    ],
    workedExample: {
      title: "The True Cost of Skipping Your Emergency Fund",
      scenario:
        "You skip building an emergency fund and put all $300/month extra toward your $5,000 credit card at 20% APR. Three months in, your car needs $900 in repairs.",
      rows: [
        { label: "Month 1–3 progress on debt", value: "–$900 + interest saved" },
        {
          label: "Car repair charged to credit card",
          value: "+$900 back to card",
          highlight: true,
        },
        { label: "Net debt reduction after 3 months", value: "≈ $0" },
        { label: "Demoralizing effect", value: "Real—many people quit here" },
        {
          label: "Alternative: save $1,000 first (takes ~3.5 months)",
          value: "Car repair covered, no debt reset",
          highlight: true,
        },
        {
          label: "Extra interest cost of the 3.5-month delay",
          value: "~$88",
        },
        { label: "Protection provided", value: "Priceless, practically" },
      ],
      conclusion:
        "Delaying aggressive debt payoff by 3–4 months to save $1,000 costs about $88 in extra interest. One unexpected expense without that cushion could add $900 back to your debt and reset your psychological momentum entirely. The $88 'cost' of the delay is the cheapest insurance you can buy for your debt payoff plan.",
    },
    commonMistakes: [
      "Skipping the emergency fund entirely and going straight to aggressive debt payoff.",
      "Building a full 6-month emergency fund before paying high-interest debt—this is over-cautious.",
      "Keeping the emergency fund in a low-yield account while high-yield savings accounts pay 4–5%.",
      "Using the emergency fund for non-emergencies, then not replenishing it before the next crisis.",
      "Ignoring the 401(k) employer match while aggressively paying debt—this is leaving guaranteed returns on the table.",
    ],
  },
  {
    slug: "debt-to-income",
    title: "Debt-to-Income Ratio Demystified",
    subtitle:
      "Lenders look at this number more than almost anything else. Here's how DTI works, what's considered healthy, and how to improve yours.",
    category: "planning",
    readingTime: 6,
    relatedTool: { label: "Budget Planner", href: "/budget" },
    keyTakeaways: [
      "DTI is your total monthly debt payments divided by your gross monthly income.",
      "Most lenders want a DTI below 36%; for mortgages, under 43% is typically required.",
      "DTI affects approval odds and the interest rate you're offered—not just whether you qualify.",
      "You can improve DTI by reducing debt, increasing income, or both.",
      "Credit cards without balances don't affect DTI—only your minimum payments count.",
    ],
    sections: [
      {
        id: "what-is-dti",
        heading: "What Is Debt-to-Income Ratio?",
        body: `Debt-to-income ratio (DTI) is the percentage of your gross monthly income (before taxes) that goes toward monthly debt payments. It's one of the most important numbers in lending.\n\nThe formula:\n\n**DTI = Total Monthly Debt Payments ÷ Gross Monthly Income × 100**\n\nWhat counts as debt payments: mortgage or rent, minimum credit card payments, student loan payments, auto loans, personal loans, child support, alimony.\n\nWhat does not count: utilities, groceries, insurance, medical bills (unless court-ordered), subscriptions.\n\nNote that DTI uses minimum payments on credit cards, not your actual payment. Even if you're paying $500/month on a card that requires a $40 minimum, lenders count $40 in your DTI calculation.`,
      },
      {
        id: "benchmarks",
        heading: "What Lenders Actually Want to See",
        body: `Different loan types have different DTI thresholds, but here are the general standards:\n\n**Below 36%:** Most lenders consider this healthy. You're likely to qualify for most loan types at competitive rates.\n\n**36%–43%:** Acceptable for many lenders, including conventional mortgages. You may face stricter requirements or slightly higher rates.\n\n**43%–50%:** This is the outer edge. Some FHA mortgage programs allow up to 50%, but conventional lenders will often decline. You're seen as carrying significant credit risk.\n\n**Above 50%:** Most lenders will not approve new credit at this level. You're paying more than half your pre-tax income in debt service.\n\nFor mortgage lending specifically, lenders use two DTI numbers: the front-end ratio (only housing costs) and back-end ratio (all debt including housing). Most conventional loans require a back-end DTI below 43%, though Fannie Mae's Automated Underwriting allows up to 50% in some cases.`,
      },
      {
        id: "impact",
        heading: "How DTI Affects Your Loan Terms",
        body: `DTI doesn't just determine whether you qualify—it also affects your interest rate. Lenders price risk, and a higher DTI signals that you have less financial flexibility to absorb unexpected expenses or income disruptions. That risk gets priced into your rate.\n\nOn a mortgage, the difference between a 3.5% and 4.5% rate on a $350,000 loan is roughly $200/month—over 30 years, that's $72,000. Your DTI can move your rate meaningfully when it's in the 36%–50% range.\n\nThe relationship between DTI and credit score is also interactive. High DTI often correlates with high utilization (carrying balances) and heavy debt service, which can keep scores lower. Improving one often improves the other.`,
        steps: [
          {
            title: "Calculate your current DTI",
            detail:
              "Add all minimum monthly debt payments. Divide by your gross monthly income. Multiply by 100.",
          },
          {
            title: "Identify which debts have the highest minimums",
            detail:
              "Large minimums—auto loans, student loans—have outsized DTI impact. Eliminating one can drop DTI significantly.",
          },
          {
            title: "Pay off small debts to eliminate minimum payments",
            detail:
              "A $3,000 car loan with a $200/month payment, once eliminated, drops your DTI by the full $200—regardless of income.",
          },
          {
            title: "Avoid taking on new debt before a loan application",
            detail:
              "A new car loan, furniture financing, or personal loan before a mortgage application can push you over the DTI limit.",
          },
          {
            title: "Increase income where possible",
            detail:
              "DTI improves with income too. Document side income, rental income, or a recent raise before applying.",
          },
        ],
      },
      {
        id: "dti-vs-credit-score",
        heading: "DTI vs. Credit Score: Different Tools",
        body: `It's important to understand that DTI and credit score serve different purposes in lending decisions. Your credit score measures your history of managing debt—on-time payments, credit age, utilization. It's backward-looking.\n\nDTI measures your current capacity to handle new debt. It's forward-looking. A lender might approve someone with a 680 credit score and 28% DTI over someone with a 750 score and 52% DTI, because the second person's income is already strained by existing obligations.\n\nImproving both simultaneously is the goal, but they respond to different actions. Paying down credit card balances improves your credit score (utilization) quickly. Paying off installment loans improves your DTI. Both require paying down debt, but the prioritization may differ depending on which number is your current bottleneck.`,
      },
    ],
    workedExample: {
      title: "Calculating and Improving Your DTI",
      scenario:
        "Here's a complete DTI calculation for someone earning $5,500/month gross and looking to qualify for a mortgage.",
      rows: [
        { label: "Gross monthly income", value: "$5,500" },
        { label: "Rent (current)", value: "$1,200 / mo" },
        { label: "Car loan minimum", value: "$380 / mo" },
        { label: "Student loan minimum", value: "$290 / mo" },
        { label: "Credit card minimums", value: "$85 / mo" },
        {
          label: "Total debt payments",
          value: "$1,955 / mo",
        },
        {
          label: "Current DTI ($1,955 ÷ $5,500)",
          value: "35.5% ✓",
          highlight: true,
        },
        {
          label: "With new mortgage payment ($1,600)",
          value: "DTI = ($380 + $290 + $85 + $1,600) ÷ $5,500 = 43.2%",
          highlight: true,
        },
        {
          label: "Borderline — paying off car loan first drops DTI to 35.6%",
          value: "More comfortable approval",
        },
      ],
      conclusion:
        "At 35.5% current DTI, this person is in good shape for general borrowing. But when the new mortgage payment is added, DTI hits 43.2%—right at the threshold where lenders get cautious. Paying off the car loan first (DTI drops by 6.9%) before applying could mean a better rate and smoother approval. The math of sequencing debt payoffs matters enormously when a major loan is on the horizon.",
    },
    commonMistakes: [
      "Including gross income but forgetting that lenders also verify income with tax returns and pay stubs.",
      "Applying for new credit (auto loan, store card) in the months before a mortgage application.",
      "Thinking credit score is the only thing lenders look at—DTI often matters as much or more.",
      "Not knowing that minimum payments count for DTI, not actual payments—which can work in your favor.",
      "Ignoring DTI when it's the actual reason for a loan denial (lenders often cite it vaguely).",
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
