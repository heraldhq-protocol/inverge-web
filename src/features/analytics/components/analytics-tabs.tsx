"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const tabs = [
  { href: "", label: "Overview" },
  { href: "/supporters", label: "Supporters" },
  { href: "/interest", label: "Interest & feedback" },
  { href: "/traffic", label: "Traffic" },
  { href: "/referrals", label: "Referrals" },
] as const;

/**
 * Analytics sections as real routes. The current query (the chosen period) is
 * carried across tabs so switching views does not silently reset the window.
 */
export function AnalyticsTabs({ basePath }: { basePath: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const suffix = query ? `?${query}` : "";

  return (
    <nav
      aria-label="Analytics sections"
      className="overflow-x-auto border-b border-border"
    >
      <ul className="flex min-w-max items-center gap-1">
        {tabs.map((tab) => {
          const href = `${basePath}${tab.href}`;
          const current =
            tab.href === ""
              ? pathname === basePath
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={tab.href}>
              <Link
                href={`${href}${suffix}`}
                aria-current={current ? "page" : undefined}
                className={`relative inline-flex min-h-11 items-center px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
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
