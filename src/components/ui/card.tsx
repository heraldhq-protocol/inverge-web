import type { ComponentProps } from "react";

export type CardTone = "default" | "promoted" | "quiet";

const toneClasses: Record<CardTone, string> = {
  default: "border-border bg-surface",
  promoted: "border-brand/35 bg-brand/[0.06]",
  quiet: "border-border bg-canvas",
};

/**
 * Grouped content on a surface with a warm hairline.
 *
 * No shadow by default: elevation is used sparingly and never on every card at
 * once. `promoted` is the paid-placement treatment and is deliberately a
 * different surface and border rather than a badge, so it cannot be mistaken for
 * an organic result.
 */
export function Card({
  tone = "default",
  className = "",
  children,
  ...props
}: ComponentProps<"div"> & { tone?: CardTone }) {
  return (
    <div
      className={`rounded-xl border ${toneClasses[tone]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
