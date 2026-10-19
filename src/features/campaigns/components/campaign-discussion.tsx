import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Comment01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { campaignTabHref } from "@/features/campaigns/lib/campaign-tabs";

/**
 * Backer discussion.
 *
 * This client has no comments data model, so the tab says so instead of seeding
 * a conversation. On a money surface a plausible-looking thread of answers would
 * read as product guidance, and a composer that cannot post is worse than no
 * composer: the honest state names what is missing and points at the places that
 * are real — the creator's published answers, their journal, and support.
 */
export function CampaignDiscussion({ slug }: { slug: string }) {
  return (
    <div className="max-w-3xl">
      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <span className="grid size-9 place-items-center rounded-xl bg-canvas text-muted ring-1 ring-border">
          <HugeiconsIcon
            icon={Comment01Icon}
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>

        <h2 className="mt-3 text-lg font-bold tracking-tight text-ink">
          Backer discussion is not available yet
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          This build has no comments store, so nothing is shown here rather than
          a simulated thread. Questions the creator has already answered are in
          the FAQs, and progress posts are in the updates.
        </p>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          <Link
            className="inline-flex min-h-11 text-sm items-center font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            href={campaignTabHref(slug, "faqs")}
          >
            Read the FAQs
          </Link>
          <Link
            className="inline-flex min-h-11 text-sm items-center font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            href={campaignTabHref(slug, "updates")}
          >
            See the updates
          </Link>
          <Link
            className="inline-flex min-h-11 text-sm items-center font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            href="/contact"
          >
            Contact Inverge
          </Link>
        </div>
      </div>

      <section aria-labelledby="discussion-planned-heading" className="mt-6">
        <h3
          className="text-sm font-semibold text-ink"
          id="discussion-planned-heading"
        >
          What the finished experience will support
        </h3>
        <ul className="mt-3 space-y-2">
          {[
            "Questions and replies from backers, with author and timestamp.",
            "Creator responses marked as coming from the creator.",
            "Reporting and moderation controls, and the rules a post is held to.",
            "A clear split between backer conversation and the creator's own announcements.",
          ].map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-6 text-muted">
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                size={15}
                strokeWidth={1.9}
                aria-hidden="true"
                className="mt-1 shrink-0 text-muted"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
