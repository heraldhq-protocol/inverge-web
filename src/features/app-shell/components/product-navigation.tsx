"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Analytics01Icon,
  Bookmark01Icon,
  BookOpen01Icon,
  Compass01Icon,
  Home01Icon,
  Idea01Icon,
  Notification01Icon,
  PlusSignIcon,
  Settings01Icon,
  TrophyIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  isCurrentNavigationHref,
  mobileSectionHref,
} from "@/features/app-shell/lib/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: IconSvgElement;
  /** Only rendered when the value is a positive number. */
  badgeCount?: number;
};

type NavGroup = {
  label: string;
  items: readonly NavItem[];
};

/**
 * One label per destination the product actually has.
 *
 * "Following and saved" and "My feedback" are absent on purpose: neither has a
 * data model in this repository yet, and a nav item that cannot show real
 * activity is worse than a shorter menu.
 */
export function sidebarGroups(unreadCount: number): readonly NavGroup[] {
  return [
    {
      label: "Your space",
      items: [
        { href: "/d", icon: Home01Icon, label: "Home" },
        { href: "/d/discover", icon: Compass01Icon, label: "Discover" },
        {
          href: "/d/pre-pledges",
          icon: Bookmark01Icon,
          label: "Pre-pledges",
        },
      ],
    },
    {
      label: "Create",
      items: [
        {
          href: "/d/creator",
          icon: Analytics01Icon,
          label: "Creator Studio",
        },
        { href: "/d/creator/ideas", icon: Idea01Icon, label: "My ideas" },
        { href: "/d/ideathons", icon: TrophyIcon, label: "Ideathons" },
        { href: "/guides", icon: BookOpen01Icon, label: "Guides & journal" },
      ],
    },
    {
      label: "Account",
      items: [
        {
          href: "/d/notifications",
          icon: Notification01Icon,
          label: "Notifications",
          badgeCount: unreadCount,
        },
        { href: "/d/settings", icon: Settings01Icon, label: "Settings" },
      ],
    },
  ];
}

function NavBadge({ count }: { count: number }) {
  return (
    <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-brand px-1.5 py-0.5 text-[0.625rem] font-bold text-white">
      {count > 9 ? "9+" : count}
      <span className="sr-only"> unread</span>
    </span>
  );
}

export function DesktopNavigation({
  collapsed,
  unreadCount,
}: {
  collapsed: boolean;
  unreadCount: number;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Product navigation" className="space-y-6">
      {sidebarGroups(unreadCount).map((group) => (
        <div key={group.label}>
          <p
            className={`overflow-hidden px-3 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-white/42 transition-[max-height,opacity] duration-200 ${
              collapsed ? "max-h-0 opacity-0" : "max-h-6 opacity-100"
            }`}
            aria-hidden={collapsed || undefined}
          >
            {group.label}
          </p>
          <ul className="mt-1.5 space-y-1">
            {group.items.map(({ badgeCount, href, icon, label }) => {
              const isCurrent = isCurrentNavigationHref(pathname, href);

              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isCurrent ? "page" : undefined}
                    title={collapsed ? label : undefined}
                    className={`relative flex min-h-11 items-center overflow-hidden rounded-xl text-sm font-semibold transition-[padding,gap,background-color,color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                      collapsed ? "justify-center gap-0 px-0" : "gap-3 px-3"
                    } ${
                      isCurrent
                        ? "bg-brand/18 text-white"
                        : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <HugeiconsIcon
                      icon={icon}
                      size={20}
                      strokeWidth={isCurrent ? 2 : 1.7}
                      aria-hidden="true"
                      className={`shrink-0 ${isCurrent ? "text-brand" : ""}`}
                    />
                    <span
                      className={`min-w-0 flex-1 truncate text-left transition-[max-width,opacity] duration-200 ${
                        collapsed
                          ? "max-w-0 opacity-0"
                          : "max-w-none opacity-100"
                      }`}
                    >
                      {label}
                    </span>
                    {badgeCount && badgeCount > 0 ? (
                      collapsed ? (
                        <span
                          aria-hidden="true"
                          className="absolute right-2 top-2 size-1.5 rounded-full bg-brand"
                        />
                      ) : (
                        <NavBadge count={badgeCount} />
                      )
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

const mobileItems = [
  { href: "/d", icon: Home01Icon, label: "Home" },
  { href: "/d/discover", icon: Compass01Icon, label: "Discover" },
  { href: "/d/creator/ideas/new", icon: PlusSignIcon, label: "Create" },
  { href: "/d/creator", icon: Analytics01Icon, label: "Studio" },
  {
    href: "/d/notifications",
    icon: Notification01Icon,
    label: "Notifications",
  },
] as const satisfies readonly {
  href: string;
  icon: IconSvgElement;
  label: string;
}[];

export function MobileNavigation({ unreadCount }: { unreadCount: number }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile product navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(13,29,21,0.08)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid h-14 max-w-2xl grid-cols-5">
        {mobileItems.map(({ href, icon, label }) => {
          const isCurrent = isCurrentNavigationHref(
            pathname,
            mobileSectionHref(href),
          );

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
                <span className="relative">
                  <HugeiconsIcon
                    icon={icon}
                    size={20}
                    strokeWidth={isCurrent ? 2.2 : 1.7}
                    aria-hidden="true"
                  />
                  {label === "Notifications" && unreadCount > 0 ? (
                    <span
                      aria-hidden="true"
                      className="absolute -right-1 -top-0.5 size-2 rounded-full bg-brand ring-2 ring-surface"
                    />
                  ) : null}
                </span>
                <span className="max-w-full truncate px-0.5">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
