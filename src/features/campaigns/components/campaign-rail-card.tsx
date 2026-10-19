import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import type { ReactNode } from "react";

/**
 * One card in the campaign rail.
 *
 * The rail is the campaign's supporting column: who is asking, what the money
 * buys, what the rules are, and what has already been asked. Every card has to
 * be scannable at 23rem, so they share one shell — a small icon, a short
 * heading, and the content — rather than each inventing its own heading size and
 * padding. Consistency here is what stops the rail reading as a pile of boxes.
 *
 * The heading is an `h2` and names the section through `aria-labelledby`, so the
 * rail is navigable by heading even though it sits beside the main column.
 */
export function RailCard({
  children,
  icon,
  id,
  title,
  tone = "default",
}: {
  children: ReactNode;
  icon: IconSvgElement;
  /** Anchor id for the heading. Kept explicit so it cannot drift from a link. */
  id: string;
  title: string;
  /** `brand` for the escrow card, which explains the model rather than listing it. */
  tone?: "brand" | "default";
}) {
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className={`rounded-2xl border p-4 sm:p-5 ${
        tone === "brand"
          ? "border-brand/20 bg-brand/[0.05]"
          : "border-border bg-surface"
      }`}
      id={id}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`grid size-7 shrink-0 place-items-center rounded-lg ${
            tone === "brand"
              ? "bg-brand/15 text-brand-strong"
              : "bg-canvas text-muted ring-1 ring-border"
          }`}
        >
          <HugeiconsIcon icon={icon} size={15} strokeWidth={1.9} />
        </span>
        <h2
          className="text-sm font-semibold tracking-[-0.01em] text-ink"
          id={`${id}-heading`}
        >
          {title}
        </h2>
      </div>

      <div className="mt-3.5">{children}</div>
    </section>
  );
}
