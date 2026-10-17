"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/ideathon", label: "Standings" },
  { href: "/ideathon/about", label: "About" },
  { href: "/ideathon/rules", label: "Rules" },
  { href: "/ideathon/past", label: "Past ideathons" },
] as const;

function isCurrent(pathname: string, href: string): boolean {
  if (href === "/ideathon") return pathname === "/ideathon";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Competition sections as real routes, so each is linkable and needs no
 * tablist keyboard model. The active underline is green to match the brand
 * rather than inheriting a generic chrome colour.
 */
export function CompetitionNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Ideathon sections"
      className="border-b border-border"
    >
      <ul className="flex min-w-max items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const current = isCurrent(pathname, tab.href);

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={current ? "page" : undefined}
                className={`relative inline-flex min-h-12 items-center px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  current
                    ? "font-semibold text-ink after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-brand"
                    : "font-medium text-muted hover:text-ink"
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
