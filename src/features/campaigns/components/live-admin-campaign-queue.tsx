import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Pill } from "@/components/ui/pill";
import { AdminReviewRefresh } from "@/features/campaigns/components/admin-review-refresh";
import {
  adminCampaignTitle,
  adminCreatorName,
  reviewDate,
  reviewFilterSchema,
  reviewLabels,
  reviewQueueHref,
  reviewUsd,
  type AdminCampaignQueue,
} from "@/features/campaigns/lib/admin-campaign-review";

const linkClass =
  "inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-brand-strong hover:bg-brand-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export function LiveAdminCampaignQueue({
  queue,
}: {
  queue: AdminCampaignQueue;
}) {
  const end = queue.skip + queue.items.length;
  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>Admin · Campaigns</Eyebrow>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Campaign review queue
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Review submitted campaigns and the decisions recorded for them.
            Approval clears a campaign for publication; funding has its own
            lifecycle.
          </p>
        </div>
        <AdminReviewRefresh />
      </header>

      <form
        action="/admin/campaigns"
        method="get"
        className="my-5 flex flex-wrap items-end gap-3"
      >
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="review-status"
            className="text-sm font-semibold text-ink"
          >
            Review status
          </label>
          <select
            id="review-status"
            name="reviewStatus"
            defaultValue={queue.reviewStatus}
            key={queue.reviewStatus}
            className="min-h-11 rounded-xl border border-border bg-surface px-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-brand"
          >
            {reviewFilterSchema.options.map((value) => (
              <option key={value} value={value}>
                {reviewLabels[value]}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="sm">
          Apply filter
        </Button>
      </form>

      <section
        aria-label={reviewLabels[queue.reviewStatus]}
        className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
      >
        <p className="text-sm text-muted">
          {queue.total} {queue.total === 1 ? "campaign" : "campaigns"} ·{" "}
          {reviewLabels[queue.reviewStatus]}
        </p>
        {queue.items.length === 0 ? (
          <p className="py-8 text-sm text-muted">
            {queue.skip > 0
              ? "There are no campaigns on this page. Return to the first page or change the filter."
              : "No campaigns match this review status."}
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {queue.items.map((campaign) => (
              <li key={campaign.id} className="py-4">
                <Link
                  href={`/admin/campaigns/${encodeURIComponent(campaign.id)}`}
                  className="group flex flex-wrap items-start justify-between gap-4 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
                >
                  <div className="min-w-0 flex-1 basis-56">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="break-words text-base font-semibold text-ink group-hover:text-brand-strong">
                        {adminCampaignTitle(campaign)}
                      </h2>
                      <Pill
                        size="xs"
                        tone={
                          campaign.reviewStatus === "REJECTED"
                            ? "danger"
                            : campaign.reviewStatus === "APPROVED"
                              ? "accent"
                              : "neutral"
                        }
                      >
                        {reviewLabels[campaign.reviewStatus]}
                      </Pill>
                    </div>
                    <p className="mt-1 break-words text-sm text-muted">
                      {adminCreatorName(campaign)}
                      {campaign.idea?.region
                        ? ` · ${campaign.idea.region}`
                        : ""}
                    </p>
                    {campaign.reviewReason && (
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted">
                        Reviewer note: {campaign.reviewReason}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-muted sm:text-right">
                    <p className="font-semibold tabular-nums text-ink">
                      Target: {reviewUsd(campaign.targetAmount)}
                    </p>
                    <p>{campaign._count.milestones} milestones</p>
                    <p>
                      {campaign.reviewStatus === "IN_REVIEW"
                        ? "Submitted"
                        : "Reviewed"}
                      :{" "}
                      {reviewDate(
                        campaign.reviewStatus === "IN_REVIEW"
                          ? campaign.submittedAt
                          : campaign.reviewedAt,
                      )}
                    </p>
                    <p className="mt-2 font-semibold text-brand-strong">
                      {campaign.reviewStatus === "IN_REVIEW"
                        ? "Review campaign"
                        : "View campaign"}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <nav
        aria-label="Review queue pages"
        className="mt-4 flex flex-wrap items-center justify-between gap-3"
      >
        <p className="text-sm text-muted">
          {queue.items.length
            ? `${queue.skip + 1}–${end} of ${queue.total}`
            : `0 shown of ${queue.total}`}
        </p>
        <div className="flex flex-wrap gap-2">
          {queue.skip > 0 && (
            <>
              <Link
                className={linkClass}
                href={reviewQueueHref({ ...queue, skip: 0 })}
              >
                First page
              </Link>
              <Link
                className={linkClass}
                href={reviewQueueHref({
                  ...queue,
                  skip: Math.max(0, queue.skip - queue.take),
                })}
              >
                Previous page
              </Link>
            </>
          )}
          {end < queue.total && queue.items.length > 0 && (
            <Link
              className={linkClass}
              href={reviewQueueHref({
                ...queue,
                skip: queue.skip + queue.take,
              })}
            >
              Next page
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
