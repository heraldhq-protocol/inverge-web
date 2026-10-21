"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { ChevronDownIcon } from "@hugeicons/core-free-icons";
import { useId, useState, type ReactNode } from "react";

/**
 * A collapsible filter section shared by campaign and idea discovery.
 *
 * The panel stays mounted while collapsed so `aria-controls` always resolves and
 * a selected value is never lost by folding the section away. The header states
 * the facet and how many of its values are selected, matching the filter-panel
 * reference: an accordion card rather than a long flat column.
 */
export function FilterSection({
  children,
  count,
  defaultOpen = true,
  icon,
  label,
}: {
  children: ReactNode;
  count?: number | undefined;
  defaultOpen?: boolean;
  icon: IconSvgElement;
  label: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-canvas/60">
      <button
        type="button"
        aria-controls={panelId}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-11 w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
      >
        <span
          className={`grid size-7 shrink-0 place-items-center rounded-lg transition-colors ${
            open ? "bg-brand/10 text-brand-strong" : "bg-surface text-muted"
          }`}
        >
          <HugeiconsIcon
            icon={icon}
            size={15}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
        <span className="flex-1 text-sm font-semibold text-ink">{label}</span>
        {count ? (
          <span className="grid size-5 place-items-center rounded-full bg-brand text-[11px] font-bold text-white">
            {count}
          </span>
        ) : null}
        <HugeiconsIcon
          icon={ChevronDownIcon}
          size={15}
          strokeWidth={2}
          aria-hidden="true"
          className={`shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="border-t border-border/70 px-3 pb-3 pt-2"
      >
        {children}
      </div>
    </section>
  );
}
