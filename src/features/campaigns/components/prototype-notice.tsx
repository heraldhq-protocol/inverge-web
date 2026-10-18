import type { ReactNode } from "react";

/**
 * Preview notices.
 *
 * Inverge's web client has no campaign API, no wallet, and no chain connection,
 * so every campaign surface is populated from fixtures. The product rule is that
 * a demo must never be mistakable for a live financial system, so the notices
 * are explicit about what is and is not real: figures are illustrative, no money
 * moves, and no transaction exists.
 */

/** The inline chip used in page headers, matching the dashboard's existing vocab. */
export function PreviewDataChip({
  title = "This page renders preview content until the campaign API is connected",
}: {
  title?: string;
}) {
  return (
    <span
      className="rounded-full border border-border bg-surface px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-muted"
      title={title}
    >
      Preview data
    </span>
  );
}

/**
 * The block notice used where a reader could otherwise think they are about to
 * pay money — the contribution flow, the receipt, and the creator's payout card.
 */
export function PrototypeNotice({
  children,
  title = "This is a preview",
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <section className="rounded-2xl border border-warning/30 bg-warning/[0.07] px-4 py-3.5">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted">{children}</p>
    </section>
  );
}
