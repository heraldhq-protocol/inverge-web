import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CATEGORIES, type IdeaCategory } from '@/lib/feed/types';

/**
 * Category lane switcher. Links that write a search param rather than client state, so a lane is
 * shareable and the server renders it (brief §3). Five categories, matching the feed enum exactly —
 * an empty category is worse than a missing one (teardown §6).
 */
export function CategoryFilter({
  active,
  resultCount,
}: {
  active?: IdeaCategory;
  resultCount: number;
}) {
  const chip = (href: string, label: string, isActive: boolean) => (
    <Link
      key={label}
      href={href}
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2',
        isActive
          ? 'border-accent-500 bg-accent-100 font-semibold text-accent-900'
          : 'border-border bg-surface font-medium text-ink-muted hover:border-accent-500/40 hover:text-ink'
      )}
    >
      {isActive && <span aria-hidden="true" className="mr-1.5">✓</span>}
      {label}
    </Link>
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chip('/feed', 'All ideas', !active)}
      {CATEGORIES.map((c) => chip(`/feed?category=${c.value}`, c.label, active === c.value))}

      <p className="ml-auto text-sm text-ink-muted tabular-nums" aria-live="polite">
        {resultCount} {resultCount === 1 ? 'idea' : 'ideas'}
      </p>
    </div>
  );
}
