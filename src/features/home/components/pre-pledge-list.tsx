import { formatNaira } from "@/features/home/lib/format-money";
import type { PrePledgeSummary } from "@/features/home/types";

const statusCopy = {
  gathering: "Still gathering support",
  waiting: "Waiting for validation",
} as const;

export function PrePledgeList({ items }: { items: PrePledgeSummary[] }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      {items.map(({ idea, intent, status }) => (
        <li
          key={idea.id}
          className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(12rem,1.45fr)_minmax(9rem,0.65fr)_minmax(20rem,1.15fr)] md:items-center md:gap-6 md:px-5 md:py-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-contrast text-[0.625rem] font-bold text-white">
              {idea.creatorInitials}
            </span>
            <span className="truncate text-sm font-semibold text-ink">
              {idea.title}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-3 md:block">
            <span className="text-xs text-muted md:sr-only">Intent</span>
            <span className="text-sm font-medium tabular-nums text-ink">
              {formatNaira(intent)} intent
            </span>
          </div>

          <div className="grid grid-cols-[minmax(7rem,0.75fr)_minmax(10rem,1fr)] items-center gap-5">
            <div>
              <span className="text-xs font-medium text-ink">
                {idea.validationPercent}% validated
              </span>
              <div
                className="mt-1 h-1.5 overflow-hidden rounded-full bg-border"
                role="progressbar"
                aria-label={`${idea.title} validation progress`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={idea.validationPercent}
              >
                <span
                  className="block h-full rounded-full bg-brand"
                  style={{ width: `${idea.validationPercent}%` }}
                />
              </div>
            </div>
            <span className="inline-flex items-center gap-2 text-xs text-muted">
              <span
                className={`size-2 rounded-full ${
                  status === "waiting" ? "bg-warning" : "bg-muted/45"
                }`}
                aria-hidden="true"
              />
              <span>{statusCopy[status]}</span>
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
