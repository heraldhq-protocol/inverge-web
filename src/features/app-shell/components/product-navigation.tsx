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

export function DesktopNavigation({ collapsed }: { collapsed: boolean }) {
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
            title={collapsed ? label : undefined}
            className={`flex min-h-12 items-center overflow-hidden rounded-xl text-sm font-semibold transition-[padding,gap,background-color,color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              collapsed ? "justify-center gap-0 px-0" : "gap-3 px-3.5"
            } ${
              isCurrent
                ? "bg-white/10 text-brand"
                : "text-white/74 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <Icon
              className="size-5 shrink-0"
              strokeWidth={1.8}
              aria-hidden="true"
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
        href="/settings"
        aria-current={isCurrentPath(pathname, "/settings") ? "page" : undefined}
        title={collapsed ? "Settings" : undefined}
        className={`flex min-h-12 items-center overflow-hidden rounded-xl text-sm font-semibold transition-[padding,gap,background-color,color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          collapsed ? "justify-center gap-0 px-0" : "gap-3 px-3.5"
        } ${
          isCurrentPath(pathname, "/settings")
            ? "bg-white/10 text-brand"
            : "text-white/74 hover:bg-white/[0.06] hover:text-white"
        }`}
      >
        <Settings
          className="size-5 shrink-0"
          strokeWidth={1.8}
          aria-hidden="true"
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
      <ul className="mx-auto grid h-14 max-w-2xl grid-cols-5">
        {mobileItems.map(({ href, label, icon: Icon }) => {
          const isCurrent = isCurrentPath(pathname, href);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isCurrent ? "page" : undefined}
                className={`relative flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[0.625rem] font-semibold leading-none transition-colors focus-visible:outline-2 focus-visible:outline-brand sm:text-[0.6875rem] ${
                  isCurrent ? "text-brand-strong" : "text-muted"
                }`}
              >
                {isCurrent ? (
                  <span className="absolute -top-2 h-0.5 w-9 rounded-full bg-brand" />
                ) : null}
                <Icon
                  className="size-5 sm:size-[1.375rem]"
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
