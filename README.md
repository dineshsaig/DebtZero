# DebtZero

> **From Balance to Freedom** — Educational debt payoff tools for people who are ready to make a plan.

DebtZero is a modern fintech-inspired educational web application for debt payoff planning, budgeting, balance transfers, and financial literacy. It runs entirely in the browser — no accounts, no servers, no data collection.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Tech Stack

| Layer       | Choice              |
|-------------|---------------------|
| Framework   | Next.js 14+ (App Router) |
| Language    | TypeScript (strict) |
| Styling     | Tailwind CSS + CSS custom properties |
| Charts      | Recharts            |
| Icons       | Lucide React        |
| Fonts       | Inter + DM Serif Display (Google Fonts) |
| Deployment  | Vercel              |

---

## Project Structure

```
debtzero/
├── app/
│   ├── globals.css          # Design tokens, base styles, component layer
│   ├── layout.tsx           # Root layout: header, footer, metadata
│   ├── page.tsx             # Home page
│   ├── not-found.tsx        # 404 page
│   ├── dashboard/           # (next) Debt overview dashboard
│   ├── calculators/         # (next) Payoff calculators
│   ├── strategies/          # (next) Avalanche vs Snowball comparison
│   ├── budget/              # (next) Budget planner
│   └── learn/               # (next) Financial literacy articles
│
├── components/
│   ├── ui/                  # Primitive components (Button, Card, Badge…)
│   └── layout/              # Layout components (Section, Container…)
│
├── lib/
│   ├── tokens.ts            # Design token constants
│   ├── types.ts             # TypeScript interfaces (Debt, PayoffPlan…)
│   └── utils.ts             # Financial math + formatting utilities
│
├── public/                  # Static assets
├── tailwind.config.ts       # Tailwind config with DebtZero design tokens
├── next.config.mjs
├── tsconfig.json
└── package.json
```

---

## Design System

### Color Palette

| Token          | Hex       | Use                            |
|----------------|-----------|--------------------------------|
| `bgPrimary`    | `#0D1B2A` | Main page background           |
| `bgSurface`    | `#1C2E40` | Cards, panels                  |
| `bgElevated`   | `#253A50` | Hover states, elevated cards   |
| `mint`         | `#00C9A7` | Progress, CTAs, positive state |
| `ember`        | `#FF6B6B` | Debt balances, danger          |
| `gold`         | `#F5A623` | Savings, goals                 |
| `textPrimary`  | `#EDF2F7` | Headings                       |
| `textMuted`    | `#8DA0B3` | Body copy, labels              |

### Typography

- **Display** — DM Serif Display (italic, used sparingly for hero numbers)
- **Body** — Inter (all weights, UI throughout)
- **Mono** — JetBrains Mono (numbers, financial figures)

### Signature Element

The **debt meter** — a 2px horizontal line with a glowing mint gradient and a glow-dot at the progress tip. Represents the journey from current balance to zero. Used in the hero section and debt overview cards.

---

## Financial Concepts Covered

- **Debt Avalanche** — highest interest rate first (minimizes total interest)
- **Debt Snowball** — lowest balance first (builds psychological momentum)
- **APR & Compounding** — how interest accrues monthly
- **Credit Utilization** — balance ÷ limit, impact on credit score
- **Balance Transfers** — 0% promotional periods, transfer fees, break-even
- **Minimum Payments** — why they extend debt for years
- **Emergency Fund** — how to balance saving vs. debt repayment
- **Debt-to-Income Ratio** — what lenders look at

---

## Roadmap

### Foundation ✅
- [x] App structure, layout, global styles
- [x] Design tokens and type system
- [x] Home page with hero, features, strategy preview
- [x] Financial utility functions

### Phase 2 — Core Features
- [ ] Debt entry form and dashboard
- [ ] Avalanche vs Snowball calculator
- [ ] Payoff timeline chart (Recharts)
- [ ] Monthly payment schedule table

### Phase 3 — Budget & Transfers
- [ ] Budget planner (income allocation)
- [ ] Balance transfer analyzer
- [ ] Credit utilization tracker

### Phase 4 — Learn & Polish
- [ ] Financial literacy article pages
- [ ] Appearance settings (themes, accents)
- [ ] LocalStorage persistence
- [ ] Print/export payoff plan

---

## Scripts

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm run type-check   # TypeScript check without building
```

---

## Important Notes

DebtZero is an **educational tool only**. It does not provide financial, legal, or tax advice. All calculations are estimates. Users should consult a qualified financial professional for personal advice.

**Privacy:** All data is stored in the browser (localStorage). Nothing is sent to any server.

---

*DebtZero — From Balance to Freedom*
