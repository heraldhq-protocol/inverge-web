import type { ReactNode } from "react";

/**
 * One anchored section of the campaign detail page.
 *
 * Every section shares the anchor, the heading id, and the scroll offset, so the
 * section nav and a deep link cannot drift from the markup. `scroll-mt` clears
 * the sticky header and section bar rather than leaving the heading hidden under
 * them.
 */
export function CampaignSection({
  id,
  title,
  description,
  action,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2
            id={`${id}-heading`}
            className="text-xl font-bold tracking-[-0.03em] text-ink sm:text-2xl"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
