import { ChevronDown, PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/shared/brand-mark";
import { DesktopNavigation } from "@/features/app-shell/components/product-navigation";

export function ProductSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      id="product-sidebar"
      data-collapsed={collapsed || undefined}
      className={`sticky top-0 hidden h-dvh min-w-0 flex-col overflow-x-hidden overflow-y-auto bg-contrast py-6 text-white transition-[padding] duration-300 ease-out lg:flex ${
        collapsed ? "px-3" : "px-4 xl:px-5"
      }`}
    >
      <div
        className={`flex min-h-11 items-center transition-[gap,padding] duration-300 ${
          collapsed
            ? "justify-between gap-1 px-0"
            : "justify-between gap-3 px-2"
        }`}
      >
        <BrandMark href="/home" inverted compact={collapsed} />
        <button
          type="button"
          aria-controls="product-sidebar"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={onToggle}
          className="grid size-11 shrink-0 place-items-center rounded-xl text-white/65 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {collapsed ? (
            <PanelLeftOpen
              className="size-5"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          ) : (
            <PanelLeftClose
              className="size-5"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          )}
        </button>
      </div>

      <div className="mt-9">
        <DesktopNavigation collapsed={collapsed} />
      </div>

      <Link
        href="/ideas"
        aria-label={collapsed ? "Start an idea" : undefined}
        title={collapsed ? "Start an idea" : undefined}
        className={`mt-8 inline-flex min-h-12 items-center justify-center overflow-hidden rounded-xl border border-brand bg-transparent text-sm font-semibold text-white transition-[padding,gap,background-color,color] duration-300 hover:bg-brand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand ${
          collapsed ? "gap-0 px-0" : "gap-2 px-4"
        }`}
      >
        <Plus className="size-4.5 shrink-0" aria-hidden="true" />
        <span
          className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ${
            collapsed
              ? "max-w-0 -translate-x-1 opacity-0"
              : "max-w-32 translate-x-0 opacity-100"
          }`}
        >
          Start an idea
        </span>
      </Link>

      <Link
        href="/profile"
        aria-label={collapsed ? "Open Amara Okonkwo's profile" : undefined}
        title={collapsed ? "Amara Okonkwo" : undefined}
        className={`mt-auto flex min-h-16 items-center overflow-hidden rounded-xl py-3 text-white transition-[padding,gap,background-color] duration-300 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          collapsed ? "justify-center gap-0 px-0" : "gap-3 px-2"
        }`}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 bg-brand/[0.18] text-sm font-bold text-white">
          AO
        </span>
        <span
          className={`min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-200 ${
            collapsed
              ? "max-w-0 -translate-x-1 opacity-0"
              : "max-w-40 translate-x-0 opacity-100"
          }`}
        >
          <span className="block truncate text-sm font-semibold">
            Amara Okonkwo
          </span>
          <span className="block truncate text-xs text-white/52">
            @amaraokonkwo
          </span>
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-white/52 transition-[width,opacity] duration-200 ${
            collapsed ? "w-0 opacity-0" : "opacity-100"
          }`}
          aria-hidden="true"
        />
      </Link>
    </aside>
  );
}
