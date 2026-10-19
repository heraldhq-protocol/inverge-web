import { HugeiconsIcon } from "@hugeicons/react";
import {
  Link01Icon,
  Megaphone01Icon,
  MilestoneIcon,
} from "@hugeicons/core-free-icons";

import { formatShortDate } from "@/features/campaigns/lib/dates";
import type { Campaign, CampaignMilestone } from "@/features/campaigns/types";

/**
 * Campaign updates.
 *
 * A progress journal rather than a feed: a dated entry beside the project it
 * reports on, so a reader can see the campaign advancing instead of scrolling a
 * wall of identical cards. The date is a real gutter on wide screens and folds
 * above the entry on narrow ones.
 *
 * A general update and a milestone report are labelled differently, because a
 * backer checking on their money needs to know which they are reading. Attached
 * files are links the creator published; nothing here invents one.
 */
export function CampaignUpdates({ campaign }: { campaign: Campaign }) {
  if (campaign.updates.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-canvas p-8 text-center">
        <p className="text-sm font-semibold text-ink">
          No updates published yet
        </p>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-muted">
          This journal fills in as the creator reports progress. Their plan and
          published evidence are on the Milestones tab.
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
    <ol className="space-y-8">
      {ordered.map((update) => {
        const milestone = update.milestoneId
          ? byId.get(update.milestoneId)
          : undefined;

        return (
          <li key={update.id}>
            <article className="sm:grid sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-x-6">
              <header className="flex flex-wrap items-baseline gap-x-2 sm:block">
                <p className="text-sm font-semibold tabular-nums text-ink">
                  {formatShortDate(update.createdAt)}
                </p>
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-brand-strong sm:mt-1">
                  <HugeiconsIcon
                    icon={milestone ? MilestoneIcon : Megaphone01Icon}
                    size={13}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                  {milestone
                    ? `Milestone ${milestone.sequence} report`
                    : "Update"}
                </p>
              </header>

              <div className="mt-2 border-t border-border pt-4 sm:mt-0 sm:border-0 sm:pt-0">
                <h3 className="text-balance text-lg font-bold tracking-[-0.025em] text-ink">
                  {update.title}
                </h3>
                <p className="mt-2.5 max-w-3xl whitespace-pre-line text-base leading-7 text-ink">
                  {update.body}
                </p>

                {milestone ? (
                  <p className="mt-3 text-xs text-muted">
                    Reports on Milestone {milestone.sequence}: {milestone.title}
                  </p>
                ) : null}

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
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
