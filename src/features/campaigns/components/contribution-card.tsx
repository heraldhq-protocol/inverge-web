import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Alert02Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Amount } from "@/components/ui/amount";
import { Cover } from "@/components/ui/cover";
import {
  ContributionPill,
  PaymentPill,
  RefundPill,
} from "@/features/campaigns/components/campaign-status-pill";
import { contributionNeedsAction } from "@/features/campaigns/lib/backing";
import { formatShortDate } from "@/features/campaigns/lib/dates";
import type { Contribution } from "@/features/campaigns/types";

/**
 * One row of a backer's history.
 *
 * All three legs are shown, always: a backer whose payment succeeded but whose
 * contribution is still reconciling needs to see both, and collapsing them into
 * one word is exactly how a page ends up implying money moved when it has not.
 */
export function ContributionCard({
  contribution,
}: {
  contribution: Contribution;
}) {
  const needsAction = contributionNeedsAction(contribution);

  return (
    <article className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex gap-4">
        <div className="hidden w-28 shrink-0 overflow-hidden rounded-xl sm:block">
          <Cover
            seed={contribution.campaignSlug}
            label="Campaign"
            src={contribution.cover}
            ratio="thumbnail"
            size="lane"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <p className="text-xs text-muted">
              {formatShortDate(contribution.submittedAt)}
            </p>
            {needsAction ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-warning-strong">
                <HugeiconsIcon
                  icon={Alert02Icon}
                  size={11}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                Needs your attention
              </span>
            ) : null}
          </div>

          <h3 className="mt-1 text-base font-semibold leading-snug text-ink">
            <Link
              href={`/d/backing/${contribution.id}`}
              className="rounded hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {contribution.campaignTitle}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs text-muted">by {contribution.creator}</p>

          <p className="mt-2 text-lg font-bold tracking-[-0.03em] tabular-nums text-ink">
            <Amount value={contribution.amount} />{" "}
            <span className="text-xs font-semibold text-muted">
              {contribution.fundingAsset}
            </span>
          </p>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 border-t border-border pt-3.5 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted">Payment</dt>
          <dd className="mt-1">
            <PaymentPill state={contribution.payment.state} size="xs" />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Contribution</dt>
          <dd className="mt-1">
            <ContributionPill
              state={contribution.contribution.state}
              size="xs"
            />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Refund</dt>
          <dd className="mt-1">
            <RefundPill state={contribution.refund.state} size="xs" />
          </dd>
        </div>
      </dl>

      <div className="mt-3.5 border-t border-border pt-3">
        <Link
          href={`/d/backing/${contribution.id}`}
          className="inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {contribution.refund.state === "available"
            ? "See refund options"
            : "View the full record"}
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={15}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}
