import Link from "next/link";

export type TabItem = {
  href: string;
  label: string;
  /** Rendered as a superscript count. Counts tell a reader which tab is worth opening. */
  count?: number;
  active: boolean;
};

/**
 * Underlined tab bar for detail pages.
 *
 * These are **routes, not widgets**: real links with `aria-current`, so a tab is
 * shareable, works without JavaScript, and needs no tablist keyboard model.
 * `role="tablist"` would be a lie here. The bar scrolls horizontally on small
 * screens rather than wrapping, which would read as two rows of navigation.
 */
export function Tabs({
  items,
  className = "",
  label = "Sections",
}: {
  items: readonly TabItem[];
  className?: string;
  /** Accessible name for the navigational region. */
  label?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={`w-full min-w-0 overflow-x-auto border-b border-border ${className}`}
    >
      <ul className="flex min-w-max items-center gap-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              scroll={false}
              className={`relative inline-flex min-h-11 items-center gap-1.5 px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                item.active
                  ? "font-semibold text-ink after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-ink"
                  : "font-medium text-muted hover:text-ink"
              }`}
            >
              {item.label}
              {item.count !== undefined && item.count > 0 ? (
                <span className="text-[11px] font-semibold tabular-nums text-muted">
                  {item.count}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
