"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { BrandMark } from "@/components/shared/brand-mark";
import { AccountMenu } from "@/features/app-shell/components/product-topbar";
import type { ShellData } from "@/features/app-shell/types";
import { CommandPaletteTrigger } from "@/features/command-palette/components/command-palette-trigger";

/**
 * The small-screen header.
 *
 * Search opens the same command palette as the desktop topbar, full-screen on a
 * phone, so there is one search surface rather than a second inline form.
 */
export function ProductHeader({ data }: { data: ShellData }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/75 bg-canvas/92 backdrop-blur lg:hidden">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:min-h-18 sm:px-6">
        <BrandMark href="/d" />

        <div className="flex items-center gap-1">
          <CommandPaletteTrigger variant="icon" />
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
    </header>
  );
}
