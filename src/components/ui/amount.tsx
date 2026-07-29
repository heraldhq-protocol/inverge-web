import { cn } from '@/lib/utils';

// Money renders with tabular figures so columns align.
export function Amount({
  value,
  currency = 'NGN',
  className,
}: {
  value: number | string;
  currency?: string;
  className?: string;
}) {
  const n = typeof value === 'string' ? Number(value.replace(/[^0-9.-]+/g, '')) : value;
  const num = Number.isFinite(n) ? n : 0;

  let formatted = '';
  if (currency === 'NGN') {
    formatted = `₦${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  } else {
    formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(num);
  }

  // Tabular only — mono is reserved for receipts and technical data (conventions §5.1), so
  // callers rendering an actual receipt opt in with `font-mono` rather than inheriting it here.
  return <span className={cn('tabular-nums', className)}>{formatted}</span>;
}

// Plain counts (supporters, feedback) — tabular, no currency symbol.
export function Count({ value, className }: { value: number | string; className?: string }) {
  const n = typeof value === 'string' ? Number(value.replace(/[^0-9.-]+/g, '')) : value;
  const num = Number.isFinite(n) ? n : 0;
  return <span className={cn('tabular-nums', className)}>{num.toLocaleString('en-US')}</span>;
}
