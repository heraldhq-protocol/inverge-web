import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowUp01Icon, MinusSignIcon } from "@hugeicons/core-free-icons";
import type { ReactNode } from "react";

import { IconTile } from "@/components/ui/icon-tile";

export type MetricDelta = {
  /** Absolute change in the metric's own unit, never a fabricated percentage. */
  value: number;
  /** Human-readable comparison window, e.g. "vs. previous 30 days". */
  period: string;
  /** Whether an increase is good. Refunds, for example, are not. */
  higherIsBetter?: boolean;
  /** Render as a percentage point change rather than a count. */
  percentagePoints?: boolean;
};

function Delta({ delta }: { delta: MetricDelta }) {
  const isFlat = delta.value === 0;
  const isPositive = delta.value > 0;
  const isGood = delta.higherIsBetter === false ? !isPositive : isPositive;
  const icon = isFlat ? MinusSignIcon : isPositive ? ArrowUp01Icon : ArrowDown01Icon;

  return (
    <p
      className={`mt-3 inline-flex flex-wrap items-center gap-1 text-xs font-medium ${
        isFlat ? "text-muted" : isGood ? "text-brand-strong" : "text-danger"
      }`}
    >
      <HugeiconsIcon icon={icon} size={14} strokeWidth={1.9} aria-hidden="true" />
      <span className="tabular-nums">
        {isPositive ? "+" : ""}
        {delta.value.toLocaleString("en-US")}
        {delta.percentagePoints ? " pts" : ""}
      </span>
      <span className="font-normal text-muted">{delta.period}</span>
    </p>
  );
}

/**
 * One observed or derived figure with its label and, only when a real
 * comparison exists, a change value.
 */
export function MetricCard({
  label,
  value,
  hint,
  icon,
  delta,
  unavailable,
  footer,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: IconSvgElement;
  delta?: MetricDelta | null;
  unavailable?: string;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-muted">{label}</p>
        {icon ? <IconTile icon={icon} size="sm" tone="soft" /> : null}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-[-0.035em] tabular-nums text-ink sm:text-[1.75rem]">
        {value}
      </p>
      {unavailable ? (
        <p className="mt-2 text-xs leading-5 text-muted">{unavailable}</p>
      ) : null}
      {delta ? <Delta delta={delta} /> : null}
      {hint ? <p className="mt-2 text-xs leading-5 text-muted">{hint}</p> : null}
      {footer ? <div className="mt-auto pt-3">{footer}</div> : null}
    </div>
  );
}
