"use client";

import {
  Bell,
  Bookmark,
  Home,
  Lightbulb,
  Settings,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/pre-pledges", label: "Pre-pledges", icon: Bookmark },
  { href: "/notifications", label: "Notifications", icon: Bell },
] as const;

const mobileItems = [
  ...primaryItems,
  { href: "/profile", label: "Profile", icon: UserRound },
] as const;

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Product navigation" className="space-y-1.5">
      {primaryItems.map(({ href, label, icon: Icon }) => {
        const isCurrent = isCurrentPath(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isCurrent ? "page" : undefined}
            className={`flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              isCurrent
                ? "bg-white/10 text-brand"
                : "text-white/74 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
            {label}
          </Link>
        );
      })}

      <Link
        href="/settings"
        aria-current={isCurrentPath(pathname, "/settings") ? "page" : undefined}
        className={`flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          isCurrentPath(pathname, "/settings")
            ? "bg-white/10 text-brand"
            : "text-white/74 hover:bg-white/[0.06] hover:text-white"
        }`}
      >
        <Settings className="size-5" strokeWidth={1.8} aria-hidden="true" />
        Settings
      </Link>
    </nav>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile product navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-10px_30px_rgba(13,29,21,0.08)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-5">
        {mobileItems.map(({ href, label, icon: Icon }) => {
          const isCurrent = isCurrentPath(pathname, href);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isCurrent ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[0.6875rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand sm:text-xs ${
                  isCurrent ? "text-brand-strong" : "text-muted"
                }`}
              >
                <Icon
                  className="size-5 sm:size-[1.375rem]"
                  strokeWidth={isCurrent ? 2.2 : 1.7}
                  aria-hidden="true"
                />
                <span className="max-w-full truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
