// Money renders with tabular figures so columns align (plan §12).
export function Amount({
  value,
  currency = 'USD',
  className = '',
}: {
  value: number | string;
  currency?: string;
  className?: string;
}) {
  const n = typeof value === 'string' ? Number(value) : value;
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
  return <span className={`font-mono tabular-nums ${className}`}>{formatted}</span>;
}

// Plain counts (supporters, feedback) — tabular, no currency symbol.
export function Count({ value, className = '' }: { value: number; className?: string }) {
  return <span className={`tabular-nums ${className}`}>{value}</span>;
}
