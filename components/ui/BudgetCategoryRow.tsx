"use client";

import { formatPercent } from "@/lib/utils";
import type { Category } from "@/app/budget/page";

interface Props {
  category: Category;
  income: number;
  onChange: (amount: number) => void;
}

export default function BudgetCategoryRow({ category, income, onChange }: Props) {
  const pct = income > 0 && category.amount > 0 ? category.amount / income : 0;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0;
    onChange(val);
  }

  return (
    <div className="cat-row">
      <div className="cat-dot-wrap">
        <span className="cat-dot" style={{ background: category.color }} />
      </div>

      <div className="cat-body">
        <div className="cat-top">
          <label className="cat-label" htmlFor={`cat-${category.key}`}>
            {category.label}
          </label>
          {pct > 0 && (
            <span className="cat-pct" style={{ color: category.color }}>
              {formatPercent(pct)}
            </span>
          )}
        </div>

        <div className="cat-input-wrap">
          <span className="cat-prefix">$</span>
          <input
            id={`cat-${category.key}`}
            className="cat-input"
            type="number"
            min="0"
            step="10"
            placeholder="0"
            value={category.amount === 0 ? "" : category.amount}
            onChange={handleChange}
          />
        </div>

        {pct > 0 && income > 0 && (
          <div className="cat-bar-track">
            <div
              className="cat-bar-fill"
              style={{
                width: `${Math.min(pct * 100, 100)}%`,
                background: category.color,
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        .cat-row {
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          padding: 0.6rem 0;
          border-bottom: 1px solid var(--border-subtle, rgba(255,255,255,0.06));
        }
        .cat-row:last-child { border-bottom: none; }

        .cat-dot-wrap {
          padding-top: 0.3rem;
          flex-shrink: 0;
        }
        .cat-dot {
          display: block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 4px;
        }
        .cat-body {
          flex: 1;
          min-width: 0;
        }
        .cat-top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.3rem;
        }
        .cat-label {
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-primary, #f1f5f9);
        }
        .cat-pct {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          opacity: 0.9;
        }

        .cat-input-wrap {
          display: flex;
          align-items: center;
          background: var(--bg-base, #0f1117);
          border: 1px solid var(--border-subtle, rgba(255,255,255,0.1));
          border-radius: 7px;
          overflow: hidden;
          transition: border-color 0.15s;
        }
        .cat-input-wrap:focus-within {
          border-color: var(--accent-primary, #6366f1);
        }
        .cat-prefix {
          padding: 0 0.5rem 0 0.625rem;
          font-size: 0.8125rem;
          color: var(--text-secondary, #94a3b8);
        }
        .cat-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          padding: 0.4375rem 0.5rem 0.4375rem 0;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary, #f1f5f9);
          width: 100%;
          -moz-appearance: textfield;
        }
        .cat-input::-webkit-outer-spin-button,
        .cat-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .cat-input::placeholder { color: var(--text-muted, #4b5563); font-weight: 400; }

        .cat-bar-track {
          margin-top: 0.3rem;
          height: 3px;
          background: rgba(255,255,255,0.07);
          border-radius: 9999px;
          overflow: hidden;
        }
        .cat-bar-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.3s ease;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}
