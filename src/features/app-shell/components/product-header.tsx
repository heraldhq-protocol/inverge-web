"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useState } from "react";

import { BrandMark } from "@/components/shared/brand-mark";
import { AccountMenu } from "@/features/app-shell/components/product-topbar";
import type { ShellData } from "@/features/app-shell/types";

/**
 * The small-screen header.
 *
 * Search collapses to an icon that reveals the field in place, so the bar stays
 * one row tall at 320px while search remains reachable without a detour.
 */
export function ProductHeader({ data }: { data: ShellData }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border/75 bg-canvas/92 backdrop-blur lg:hidden">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:min-h-18 sm:px-6">
        <BrandMark href="/d" />

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-expanded={searchOpen}
            aria-controls="mobile-shell-search"
            aria-label={searchOpen ? "Close search" : "Search"}
            onClick={() => setSearchOpen((open) => !open)}
            className="grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand"
          >
            <HugeiconsIcon
              icon={Search01Icon}
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>
          <Link
            href="/d/notifications"
            aria-label={
              data.unreadCount > 0
                ? `Notifications, ${data.unreadCount} unread`
                : "Notifications"
            }
            className="relative grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand"
          >
            <HugeiconsIcon
              icon={Notification01Icon}
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            {data.unreadCount > 0 ? (
              <span
                aria-hidden="true"
                className="absolute right-2.5 top-2.5 size-2 rounded-full bg-brand ring-2 ring-canvas"
              />
            ) : null}
          </Link>
          <AccountMenu viewer={data.viewer} />
        </div>
      </div>

      {searchOpen ? (
        <div className="border-t border-border/70 px-4 pb-3 pt-2 sm:px-6">
          <form action="/d/discover" role="search" className="relative">
            <label htmlFor="mobile-shell-search" className="sr-only">
              Search ideas, creators, and topics
            </label>
            <HugeiconsIcon
              icon={Search01Icon}
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              id="mobile-shell-search"
              name="q"
              type="search"
              autoFocus
              placeholder="Search ideas, creators, or topics..."
              className="min-h-11 w-full rounded-xl border border-border bg-surface py-2 pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-3 focus:ring-brand/12"
            />
          </form>
        </div>
      ) : null}
    </header>
  );
}
