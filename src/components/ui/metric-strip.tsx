import type { ReactNode } from "react";

type Metric = {
  label: string;
  value: ReactNode;
};

export function MetricStrip({
  className = "",
  items,
}: {
  className?: string;
  items: readonly Metric[];
}) {
  return (
    <dl className={`grid grid-cols-3 divide-x divide-border ${className}`}>
      {items.map(({ label, value }, index) => (
        <div
          key={label}
          className={`flex min-w-0 flex-col ${
            index === 0 ? "pr-3 sm:pr-6" : "px-3 sm:px-6"
          }`}
        >
          <dt className="order-2 mt-1 text-xs leading-4 text-muted sm:text-sm sm:leading-5">
            {label}
          </dt>
          <dd className="order-1 truncate text-xl font-semibold tabular-nums text-ink sm:text-2xl">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
