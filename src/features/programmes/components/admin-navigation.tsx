"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Analytics01Icon,
  ArrowLeft02Icon,
  Invoice01Icon,
  Note01Icon,
  TrophyIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items: readonly { href: string; icon: IconSvgElement; label: string }[] = [
  { href: "/admin/programmes", icon: TrophyIcon, label: "Programmes" },
  { href: "/admin/payments", icon: Invoice01Icon, label: "Payments" },
  { href: "/admin/audit", icon: Note01Icon, label: "Audit log" },
];

function current(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="space-y-1">
      {items.map(({ href, icon, label }) => {
        const active = current(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              active
                ? "bg-white/10 text-brand"
                : "text-white/72 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <HugeiconsIcon
              icon={icon}
              size={19}
              strokeWidth={1.8}
              aria-hidden="true"
              className="shrink-0"
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminMobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin sections"
      className="flex gap-1 overflow-x-auto border-b border-border bg-surface px-3 py-2 lg:hidden"
    >
      {items.map(({ href, icon, label }) => {
        const active = current(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              active
                ? "bg-brand-soft text-brand-strong"
                : "text-muted hover:bg-canvas hover:text-ink"
            }`}
          >
            <HugeiconsIcon icon={icon} size={15} strokeWidth={1.9} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminBackLink() {
  return (
    <Link
      href="/d"
      className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-white/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <HugeiconsIcon icon={ArrowLeft02Icon} size={14} strokeWidth={1.9} aria-hidden="true" />
      Back to product
    </Link>
  );
}

export function AdminAnalyticsMark() {
  return (
    <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-brand">
      <HugeiconsIcon icon={Analytics01Icon} size={18} strokeWidth={1.8} aria-hidden="true" />
    </span>
  );
}
