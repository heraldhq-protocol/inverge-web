import { HugeiconsIcon } from "@hugeicons/react";
import { Comment01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

/**
 * Backer discussion.
 *
 * This client has no comments data model, so the section says so instead of
 * seeding a conversation. On a money surface a plausible-looking thread of
 * answers would read as product guidance; the honest state is a pointer to the
 * places that are real — the campaign's published questions and updates, and the
 * support route.
 */
export function CampaignDiscussion() {
  return (
    <div className="rounded-2xl border border-border bg-canvas p-5 sm:p-6">
      <span className="grid size-9 place-items-center rounded-xl bg-canvas text-muted ring-1 ring-border">
        <HugeiconsIcon
          icon={Comment01Icon}
          size={18}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </span>
      <h3 className="mt-3 text-base font-semibold text-ink">
        Backer discussion is not available yet
      </h3>
      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
        This build has no comments store, so nothing is shown here rather than a
        simulated thread. Questions the creator has already answered are in the
        campaign&apos;s questions above, and progress posts are in the updates.
      </p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <a
          href="#faq"
          className="inline-flex min-h-9 items-center font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Read the campaign questions
        </a>
        <Link
          href="/contact"
          className="inline-flex min-h-9 items-center font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Contact Inverge
        </Link>
      </div>
    </div>
  );
}
