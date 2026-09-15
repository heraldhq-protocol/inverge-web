import { type ComponentProps, forwardRef } from "react";

export const selectClass =
  "min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-[0.9375rem] text-ink outline-none transition hover:border-muted/45 focus:border-brand focus:ring-3 focus:ring-brand/12 disabled:cursor-not-allowed disabled:opacity-50";

export const Select = forwardRef<HTMLSelectElement, ComponentProps<"select">>(
  function Select({ className = "", children, ...props }, ref) {
    return (
      <select ref={ref} className={`${selectClass} ${className}`} {...props}>
        {children}
      </select>
    );
  },
);
Select.displayName = "Select";
