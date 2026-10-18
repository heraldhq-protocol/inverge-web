import { HugeiconsIcon } from "@hugeicons/react";
import { Link01Icon, Megaphone01Icon } from "@hugeicons/core-free-icons";

import { formatShortDate } from "@/features/campaigns/lib/dates";
import type { Campaign, CampaignMilestone } from "@/features/campaigns/types";

/**
 * Campaign updates.
 *
 * A general update and a milestone report are labelled differently, because a
 * backer checking on their money needs to know which they are reading. Attached
 * files are links the creator published; nothing here invents one.
 */
export function CampaignUpdates({ campaign }: { campaign: Campaign }) {
  if (campaign.updates.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-canvas p-5 text-center">
        <p className="text-sm font-semibold text-ink">
          No updates published yet
        </p>
        <p className="mt-1 text-sm text-muted">
          The creator has not posted an update. When they do, it appears here
          and on the campaign&apos;s followers&apos; activity.
        </p>
      </div>
    );
  }

  const byId = new Map<string, CampaignMilestone>(
    campaign.milestones.map((milestone) => [milestone.id, milestone]),
  );

  const ordered = [...campaign.updates].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  return (
    <ol className="space-y-4">
      {ordered.map((update) => {
        const milestone = update.milestoneId
          ? byId.get(update.milestoneId)
          : undefined;

        return (
          <li key={update.id}>
            <article className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-strong">
                  <HugeiconsIcon
                    icon={Megaphone01Icon}
                    size={14}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  {milestone
                    ? `Milestone ${milestone.sequence} report`
                    : "Campaign update"}
                </span>
                <span className="text-xs text-muted">
                  {formatShortDate(update.createdAt)}
                </span>
              </div>

              <h3 className="mt-2 text-base font-bold tracking-[-0.02em] text-ink">
                {update.title}
              </h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink">
                {update.body}
              </p>

              {update.attachments.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {update.attachments.map((attachment) => (
                    <li key={attachment.id}>
                      <a
                        href={attachment.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-canvas px-3 text-xs font-semibold text-brand-strong hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        <HugeiconsIcon
                          icon={Link01Icon}
                          size={13}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                        {attachment.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
