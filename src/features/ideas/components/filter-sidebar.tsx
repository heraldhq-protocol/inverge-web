"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  FilterHorizontalIcon,
  Idea01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { discoveryCategories } from "@/features/home/discovery-categories";
import type { IdeaFilterState } from "@/features/ideas/lib/filters";
import type { IdeaRegion, IdeaValidationStage } from "@/features/ideas/types";

type Option<Value extends string> = {
  count?: number;
  label: string;
  value: Value;
};

const stageOptions: readonly Option<IdeaValidationStage | "all">[] = [
  { value: "all", label: "All stages" },
  { value: "early", label: "Early signal" },
  { value: "growing", label: "Growing support" },
  { value: "near", label: "Near validation" },
];

const regionOptions: readonly Option<IdeaRegion | "all">[] = [
  { value: "all", label: "All locations" },
  { value: "nigeria", label: "Nigeria" },
  { value: "ghana", label: "Ghana" },
  { value: "senegal", label: "Senegal" },
];

function RadioGroup<Value extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: Value) => void;
  options: readonly Option<Value>[];
  value: Value;
}) {
  const groupName = useId();

  return (
    <fieldset>
      <legend className="text-xs font-semibold text-ink">{label}</legend>
      <div className="mt-2.5 space-y-0.5">
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <label
              key={option.value}
              className={`flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand ${
                selected
                  ? "bg-brand-soft font-semibold text-brand-strong"
                  : "text-ink-soft hover:bg-canvas hover:text-ink"
              }`}
            >
              <input
                type="radio"
                name={groupName}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                aria-label={option.label}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`grid size-4 shrink-0 place-items-center rounded-full border ${
                  selected
                    ? "border-brand bg-brand"
                    : "border-border-strong bg-surface"
                }`}
              >
                {selected ? (
                  <span className="size-1.5 rounded-full bg-white" />
                ) : null}
              </span>
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              {option.count !== undefined ? (
                <span className="text-[0.6875rem] font-normal tabular-nums text-muted">
                  {option.count.toLocaleString("en-US")}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function FilterControls({
  activeFilterCount,
  categoryCounts,
  onChange,
  onClear,
  state,
}: {
  activeFilterCount: number;
  categoryCounts: Record<string, number>;
  onChange: (patch: Partial<IdeaFilterState>) => void;
  onClear: () => void;
  state: IdeaFilterState;
}) {
  const categoryOptions: readonly Option<IdeaFilterState["category"]>[] = [
    { value: "all", label: "All ideas", count: categoryCounts.all ?? 0 },
    ...discoveryCategories.map((category) => ({
      value: category.value,
      label: category.label,
      count: categoryCounts[category.value] ?? 0,
    })),
  ];

  return (
    <div className="divide-y divide-border">
      <div className="pb-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-ink">Filter by</h2>
          <button
            type="button"
            onClick={onClear}
            disabled={activeFilterCount === 0}
            className="min-h-9 rounded-lg px-1 text-xs font-semibold text-brand-strong transition-colors hover:text-brand disabled:cursor-not-allowed disabled:text-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Clear all
          </button>
        </div>
        <div className="mt-4">
          <RadioGroup
            label="Category"
            options={categoryOptions}
            value={state.category}
            onChange={(category) => onChange({ category, page: 1 })}
          />
        </div>
      </div>

      <div className="py-5">
        <RadioGroup
          label="Validation stage"
          options={stageOptions}
          value={state.stage}
          onChange={(stage) => onChange({ page: 1, stage })}
        />
      </div>

      <div className="py-5">
        <RadioGroup
          label="Location"
          options={regionOptions}
          value={state.region}
          onChange={(region) => onChange({ page: 1, region })}
        />
      </div>

      <div className="pt-5">
        <div className="rounded-2xl bg-brand-soft px-4 py-5">
          <span className="grid size-9 place-items-center rounded-full bg-brand/12 text-brand-strong">
            <HugeiconsIcon
              icon={Idea01Icon}
              size={18}
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </span>
          <p className="mt-3 text-base font-bold tracking-[-0.02em] text-ink">
            Have an idea?
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Publish it, gather real signal, and find out what people would
            support before you build.
          </p>
          <Link
            href="/auth"
            className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Start building
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Filter rail on desktop, a modal sheet below `lg`.
 *
 * The sheet uses a real dialog role, traps Tab, closes on Escape, restores
 * focus to its trigger, and stops the page behind it from scrolling. The
 * mobile trigger reports how many filters are active so a collapsed panel never
 * masquerades as an unfiltered result set.
 */
export function FilterSidebar({
  activeFilterCount,
  categoryCounts,
  onChange,
  onClear,
  state,
}: {
  activeFilterCount: number;
  categoryCounts: Record<string, number>;
  onChange: (patch: Partial<IdeaFilterState>) => void;
  onClear: () => void;
  state: IdeaFilterState;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = `${useId()}-filter-title`;

  useEffect(() => {
    if (!open) return;

    const trigger = triggerRef.current;
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <aside aria-label="Idea filters" className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-border bg-surface px-5 py-5">
          <FilterControls
            activeFilterCount={activeFilterCount}
            categoryCounts={categoryCounts}
            onChange={onChange}
            onClear={onClear}
            state={state}
          />
        </div>
      </aside>

      <div className="lg:hidden">
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <HugeiconsIcon
            icon={FilterHorizontalIcon}
            size={16}
            strokeWidth={1.8}
            aria-hidden="true"
          />
          Filters
          {activeFilterCount > 0 ? (
            <span className="grid size-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[0.6875rem] font-bold tabular-nums text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-contrast/35 backdrop-blur-[2px]"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl border-t border-border bg-surface px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 shadow-2xl motion-safe:animate-[inv-fade-in_160ms_ease-out]"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id={titleId} className="text-lg font-bold text-ink">
                Filter ideas
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="grid size-11 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </button>
            </div>
            <FilterControls
              activeFilterCount={activeFilterCount}
              categoryCounts={categoryCounts}
              onChange={onChange}
              onClear={onClear}
              state={state}
            />
            <Button
              type="button"
              size="lg"
              className="mt-5 w-full"
              onClick={() => setOpen(false)}
            >
              Show results
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
