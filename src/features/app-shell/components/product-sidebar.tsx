import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChevronRightIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { BrandMark } from "@/components/shared/brand-mark";
import { DesktopNavigation } from "@/features/app-shell/components/product-navigation";
import type { DashboardViewer } from "@/features/app-shell/types";

function initialsFor(name: string | null): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const first = words.at(0)?.[0] ?? "";
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase() || "?";
}

export function ProductSidebar({
  collapsed,
  onToggle,
  unreadCount,
  viewer,
}: {
  collapsed: boolean;
  onToggle: () => void;
  unreadCount: number;
  viewer: DashboardViewer;
}) {
  const displayName = viewer.displayName ?? "Your account";
  const identity = viewer.handle ? `@${viewer.handle}` : "Signed in";

  return (
    <aside
      id="product-sidebar"
      data-collapsed={collapsed || undefined}
      className={`product-sidebar-surface sticky top-0 hidden h-dvh min-w-0 flex-col overflow-x-hidden overflow-y-auto py-5 text-white lg:flex ${
        collapsed ? "px-3" : "px-4 xl:px-5"
      }`}
    >
      <div
        className={`flex min-h-11 items-center transition-[gap,padding] duration-200 ${
          collapsed
            ? "justify-center px-0"
            : "justify-between gap-3 px-2"
        }`}
      >
        <div
          className={`overflow-hidden transition-[max-width,opacity] duration-200 ${
            collapsed
              ? "max-w-0 opacity-0 pointer-events-none"
              : "max-w-40 opacity-100"
          }`}
          aria-hidden={collapsed || undefined}
        >
          <BrandMark href="/d" inverted />
        </div>
        <button
          type="button"
          aria-controls="product-sidebar"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={onToggle}
          className="grid size-11 shrink-0 place-items-center rounded-xl text-white/65 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <HugeiconsIcon
            icon={collapsed ? PanelLeftOpenIcon : PanelLeftCloseIcon}
            size={20}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </button>
      </div>

      <Link
        href="/d/creator/ideas/new"
        aria-label={collapsed ? "Start an idea" : undefined}
        title={collapsed ? "Start an idea" : undefined}
        className={`mt-6 inline-flex min-h-11 items-center justify-center overflow-hidden rounded-xl bg-brand text-sm font-semibold text-white transition-[padding,gap,background-color] duration-200 hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand ${
          collapsed ? "gap-0 px-0" : "gap-2 px-4"
        }`}
      >
        <HugeiconsIcon
          icon={PlusSignIcon}
          size={18}
          strokeWidth={2}
          aria-hidden="true"
          className="shrink-0"
        />
        <span
          className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ${
            collapsed ? "max-w-0 opacity-0" : "max-w-32 opacity-100"
          }`}
        >
          Start an idea
        </span>
      </Link>

      <div className="mt-7">
        <DesktopNavigation collapsed={collapsed} unreadCount={unreadCount} />
      </div>

      <div className="mt-auto pt-8">
        <Link
          href="/d/profile"
          aria-label={collapsed ? `Open ${displayName}'s profile` : undefined}
          title={collapsed ? displayName : undefined}
          className={`flex min-h-16 items-center overflow-hidden rounded-xl py-3 text-white transition-[padding,gap,background-color] duration-200 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
            collapsed ? "justify-center gap-0 px-0" : "gap-3 px-2"
          }`}
        >
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 bg-brand/20 text-sm font-bold text-white"
          >
            {initialsFor(viewer.displayName)}
          </span>
          <span
            className={`min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ${
              collapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100"
            }`}
          >
            <span className="block truncate text-sm font-semibold">
              {displayName}
            </span>
            <span className="block truncate text-xs text-white/52">
              {identity}
            </span>
          </span>
          <HugeiconsIcon
            icon={ChevronRightIcon}
            size={16}
            strokeWidth={1.8}
            aria-hidden="true"
            className={`shrink-0 text-white/52 transition-[width,opacity] duration-200 ${
              collapsed ? "w-0 opacity-0" : "opacity-100"
            }`}
          />
        </Link>
      </div>
    </aside>
  );
}
