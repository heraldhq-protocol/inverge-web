import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChevronDownIcon,
  MessageQuestionIcon,
} from "@hugeicons/core-free-icons";

import { RailCard } from "@/features/campaigns/components/campaign-rail-card";
import type { Campaign } from "@/features/campaigns/types";

/**
 * Campaign questions.
 *
 * A native disclosure widget rather than a scripted accordion: it works without
 * JavaScript, is keyboard-operable for free, and is announced correctly. Answers
 * are authored upstream and shown verbatim — a fabricated answer on a funding
 * page reads as product guidance, which is why an unanswered campaign gets an
 * empty state instead of plausible copy.
 *
 * The same list serves the rail and the FAQ tab. Only the shell differs: the rail
 * version is a card with smaller type so it reads at 23rem, and the tab version
 * is an editorial section. The questions, answers, and empty state are shared, so
 * the two cannot drift apart.
 */
export function CampaignFaq({
  campaign,
  variant = "page",
}: {
  campaign: Campaign;
  /** `rail` is the supporting column beside the story; `page` is the FAQ tab. */
  variant?: "page" | "rail";
}) {
  if (variant === "rail") {
    return (
      <RailCard icon={MessageQuestionIcon} id="faq" title="FAQs">
        {campaign.faqs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-canvas p-3 text-xs leading-5 text-muted">
            The creator has not published any questions for this campaign yet.
          </p>
        ) : (
          <ul className="-my-1 divide-y divide-border">
            {campaign.faqs.map((faq) => (
              <li key={faq.id}>
                <details className="group">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-2.5 text-sm font-medium text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
                    {faq.question}
                    <HugeiconsIcon
                      icon={ChevronDownIcon}
                      size={16}
                      strokeWidth={1.9}
                      aria-hidden="true"
                      className="shrink-0 text-muted transition-transform group-open:rotate-180 motion-reduce:transition-none"
                    />
                  </summary>
                  <p className="pb-3 text-xs leading-5 text-muted">
                    {faq.answer}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        )}
      </RailCard>
    );
  }

  return (
    <section aria-labelledby="faq-heading" className="max-w-4xl">
      <div className="flex items-center gap-1.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand-strong">
          <HugeiconsIcon
            icon={MessageQuestionIcon}
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
        <h2
          className="text-xl font-bold tracking-[-0.03em] text-ink sm:text-2xl"
          id="faq-heading"
        >
          FAQs
        </h2>
      </div>

      {campaign.faqs.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-canvas p-8 text-center text-sm leading-6 text-muted">
          The creator has not published any questions for this campaign yet.
          Their plan and published evidence are on the Milestones tab.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {campaign.faqs.map((faq) => (
            <li key={faq.id}>
              <details className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-base font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand sm:px-5">
                  {faq.question}
                  <HugeiconsIcon
                    icon={ChevronDownIcon}
                    size={18}
                    strokeWidth={1.9}
                    aria-hidden="true"
                    className="shrink-0 text-muted transition-transform group-open:rotate-180 motion-reduce:transition-none"
                  />
                </summary>
                <p className="max-w-3xl px-4 pb-4 text-sm leading-6 text-muted sm:px-5">
                  {faq.answer}
                </p>
              </details>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
