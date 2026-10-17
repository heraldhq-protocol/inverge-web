"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Analytics01Icon,
  Bookmark01Icon,
  Home01Icon,
  Idea01Icon,
  Notification01Icon,
  Settings01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DASHBOARD_HOME = "/d";
const ANALYTICS_INDEX = "/d/ideas/insights";

const primaryItems: readonly {
  href: string;
  label: string;
  icon: IconSvgElement;
}[] = [
  { href: DASHBOARD_HOME, label: "Home", icon: Home01Icon },
  { href: "/d/ideas", label: "Ideas", icon: Idea01Icon },
  { href: ANALYTICS_INDEX, label: "Analytics", icon: Analytics01Icon },
  { href: "/d/pre-pledges", label: "Pre-pledges", icon: Bookmark01Icon },
  { href: "/d/notifications", label: "Notifications", icon: Notification01Icon },
];

const mobileItems = [
  ...primaryItems,
  { href: "/d/profile", label: "Profile", icon: UserIcon },
] as const;

function isCurrentPath(pathname: string, href: string) {
  if (pathname === href) return true;

  // The dashboard root prefixes every other product route, so it must match
  // exactly; nested sections stay highlighted across their child routes.
  if (href === DASHBOARD_HOME) return false;
  if (href === "/d/ideas") {
    return (
      pathname.startsWith("/d/ideas/") &&
      !pathname.includes("/insights")
    );
  }
  if (href === ANALYTICS_INDEX) {
    return pathname === ANALYTICS_INDEX || /\/insights(\/|$)/.test(pathname);
  }
  return pathname.startsWith(`${href}/`);
}

export function DesktopNavigation({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Product navigation" className="space-y-1.5">
      {primaryItems.map(({ href, label, icon }) => {
        const isCurrent = isCurrentPath(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isCurrent ? "page" : undefined}
            title={collapsed ? label : undefined}
            className={`flex min-h-12 items-center overflow-hidden rounded-xl text-sm font-semibold transition-[padding,gap,background-color,color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              collapsed ? "justify-center gap-0 px-0" : "gap-3 px-3.5"
            } ${
              isCurrent
                ? "bg-white/10 text-brand"
                : "text-white/74 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <HugeiconsIcon
              icon={icon}
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
              className="shrink-0"
            />
            <span
              className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ${
                collapsed
                  ? "max-w-0 -translate-x-1 opacity-0"
                  : "max-w-36 translate-x-0 opacity-100"
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}

      <Link
        href="/d/settings"
        aria-current={isCurrentPath(pathname, "/d/settings") ? "page" : undefined}
        title={collapsed ? "Settings" : undefined}
        className={`flex min-h-12 items-center overflow-hidden rounded-xl text-sm font-semibold transition-[padding,gap,background-color,color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          collapsed ? "justify-center gap-0 px-0" : "gap-3 px-3.5"
        } ${
          isCurrentPath(pathname, "/d/settings")
            ? "bg-white/10 text-brand"
            : "text-white/74 hover:bg-white/[0.06] hover:text-white"
        }`}
      >
        <HugeiconsIcon
          icon={Settings01Icon}
          size={20}
          strokeWidth={1.8}
          aria-hidden="true"
          className="shrink-0"
        />
        <span
          className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ${
            collapsed
              ? "max-w-0 -translate-x-1 opacity-0"
              : "max-w-36 translate-x-0 opacity-100"
          }`}
        >
          Settings
        </span>
      </Link>
    </nav>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile product navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(13,29,21,0.08)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid h-14 max-w-2xl grid-cols-6">
        {mobileItems.map(({ href, label, icon }) => {
          const isCurrent = isCurrentPath(pathname, href);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isCurrent ? "page" : undefined}
                className={`relative flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[0.5625rem] font-semibold leading-none transition-colors focus-visible:outline-2 focus-visible:outline-brand sm:text-[0.625rem] ${
                  isCurrent ? "text-brand-strong" : "text-muted"
                }`}
              >
                {isCurrent ? (
                  <span className="absolute -top-2 h-0.5 w-8 rounded-full bg-brand" />
                ) : null}
                <HugeiconsIcon
                  icon={icon}
                  size={20}
                  strokeWidth={isCurrent ? 2.2 : 1.7}
                  aria-hidden="true"
                />
                <span className="max-w-full truncate px-0.5">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
