import type { ComponentPropsWithoutRef } from "react";

/**
 * Small uppercase section label.
 *
 * The reference designs use these sparingly, so the component exists to keep
 * tracking, size, and colour identical wherever one is genuinely needed rather
 * than to encourage uppercase text on every section.
 */
export function Eyebrow({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"p">) {
  return (
    <p
      className={`text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong sm:text-xs ${className}`}
      {...props}
    />
  );
}
