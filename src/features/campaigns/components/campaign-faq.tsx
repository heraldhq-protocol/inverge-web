import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDownIcon } from "@hugeicons/core-free-icons";

import type { Campaign } from "@/features/campaigns/types";

/**
 * Campaign questions.
 *
 * A native disclosure widget rather than a scripted accordion: it works without
 * JavaScript, is keyboard-operable for free, and is announced correctly. Answers
 * are authored upstream and shown verbatim.
 */
export function CampaignFaq({ campaign }: { campaign: Campaign }) {
  if (campaign.faqs.length === 0) {
    return (
      <p className="text-sm leading-6 text-muted">
        The creator has not published any questions for this campaign yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      {campaign.faqs.map((faq) => (
        <li key={faq.id}>
          <details className="group">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand sm:px-5">
              {faq.question}
              <HugeiconsIcon
                icon={ChevronDownIcon}
                size={18}
                strokeWidth={1.9}
                aria-hidden="true"
                className="shrink-0 text-muted transition-transform group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>
            <p className="px-4 pb-4 text-sm leading-6 text-muted sm:px-5">
              {faq.answer}
            </p>
          </details>
        </li>
      ))}
    </ul>
  );
}
