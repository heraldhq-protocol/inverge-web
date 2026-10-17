import { formatCompactMoney, formatMoney, type MoneyAmount } from "@/lib/money";

/**
 * Money, in tabular figures so columns align.
 *
 * `compact` picks the short form (`$8.4M`) for cards, where several values sit
 * side by side and the full figure would dominate; the default is the exact
 * amount for detail pages and totals.
 */
export function Amount({
  value,
  compact = false,
  className = "",
}: {
  value: MoneyAmount;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={`tabular-nums ${className}`}>
      {compact ? formatCompactMoney(value) : formatMoney(value)}
    </span>
  );
}

/** A plain count (supporters, feedback). Tabular, no currency symbol. */
export function Count({
  value,
  className = "",
}: {
  value: number | string;
  className?: string;
}) {
  const parsed =
    typeof value === "string" ? Number(value.replace(/[^0-9.-]+/g, "")) : value;
  const safe = Number.isFinite(parsed) ? parsed : 0;

  return (
    <span className={`tabular-nums ${className}`}>
      {safe.toLocaleString("en-US")}
    </span>
  );
}
