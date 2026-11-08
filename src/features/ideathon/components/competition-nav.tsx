"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/ideathon", label: "Programmes" },
  { href: "/ideathon/about", label: "How it works" },
  { href: "/ideathon/rules", label: "Ranking rules" },
  { href: "/ideathon/past", label: "Past editions" },
] as const;

function isCurrent(pathname: string, href: string): boolean {
  if (href === "/ideathon") return pathname === "/ideathon";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Public ideathon navigation.
 *
 * The four destinations remain real routes rather than a client tablist, so
 * every section is linkable, server-rendered and usable with browser history.
 * The link row scrolls horizontally at 320px instead of forcing the page wider
 * than the viewport.
 */
export function CompetitionNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Ideathon sections" className="border-b border-border">
      <ul className="-mx-5 flex items-center gap-1 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        {tabs.map((tab) => {
          const current = isCurrent(pathname, tab.href);
          return (
            <li key={tab.href} className="shrink-0">
              <Link
                href={tab.href}
                aria-current={current ? "page" : undefined}
                className={`relative inline-flex min-h-12 items-center px-3 text-sm font-semibold transition-colors first:pl-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  current ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {tab.label}
                {current ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-0 h-0.5 bg-brand first:left-0"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
