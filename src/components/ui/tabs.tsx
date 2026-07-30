import Link from 'next/link';
import { cn } from '@/lib/utils';

export type TabItem = {
  href: string;
  label: string;
  /** Rendered as a superscript count. Counts tell a reader which tab is worth opening. */
  count?: number;
  active: boolean;
};

/**
 * Underlined tab bar for detail pages (teardown §4, band 5).
 *
 * These are **routes, not widgets**: real links with `aria-current`, so a tab is shareable, works
 * without JavaScript, and needs no tablist keyboard model. `role="tablist"` would be a lie here.
 *
 * Scrolls horizontally on small screens rather than wrapping — a wrapped tab bar reads as two rows of
 * navigation and loses the "one bar" affordance.
 */
export function Tabs({ items, className }: { items: TabItem[]; className?: string }) {
  return (
    <nav
      aria-label="Sections"
      className={cn('-mx-4 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0', className)}
    >
      <ul className="flex min-w-max items-center gap-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
              scroll={false}
              className={cn(
                'relative inline-flex min-h-11 items-center gap-1.5 px-3 text-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2',
                item.active
                  ? 'font-semibold text-ink after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-ink'
                  : 'font-medium text-ink-muted hover:text-ink'
              )}
            >
              {item.label}
              {item.count !== undefined && item.count > 0 && (
                <span className="text-[11px] font-semibold text-ink-muted tabular-nums">
                  {item.count}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
