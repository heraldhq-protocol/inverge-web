import type { ComponentProps, ReactNode } from "react";

export type PillTone = "neutral" | "accent" | "danger" | "promoted" | "warning";

const toneClasses: Record<PillTone, string> = {
  neutral: "bg-ink/[0.06] text-muted",
  accent: "bg-brand/10 text-brand-strong",
  danger: "bg-danger/10 text-danger",
  promoted: "border border-brand/40 bg-surface text-ink",
  warning: "bg-warning/10 text-warning-strong",
};

const sizeClasses = {
  xs: "gap-1 px-2 py-px text-[10px]",
  sm: "gap-1 px-2.5 py-0.5 text-xs",
} as const;

/**
 * Small status label.
 *
 * Every tone carries meaning in its text, never in colour alone (WCAG 1.4.1).
 * The badge vocabulary is a short, closed list — promoted, featured, threshold
 * met, ending soon, and similar — so nothing becomes a pill without a field or a
 * rule behind it. Green text steps down to `brand-strong`, because mid-green on
 * a light surface fails contrast for body-size text.
 */
export function Pill({
  tone = "neutral",
  size = "sm",
  marker,
  className = "",
  children,
  ...props
}: ComponentProps<"span"> & {
  tone?: PillTone;
  /** `xs` is the card scale (metadata); `sm` is for detail pages. */
  size?: keyof typeof sizeClasses;
  /** A leading glyph for tones that need shape as well as colour. */
  marker?: ReactNode;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full font-semibold ${sizeClasses[size]} ${toneClasses[tone]} ${className}`}
      {...props}
    >
      {marker}
      {children}
    </span>
  );
}
