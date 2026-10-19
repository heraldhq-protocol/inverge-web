import { Amount } from "@/components/ui/amount";
import { CampaignStoryBlocks } from "@/features/campaigns/components/campaign-story-blocks";
import { CampaignVideoPlayer } from "@/features/campaigns/components/campaign-video-player";
import { MediaImage } from "@/features/campaigns/components/media-image";
import {
  videoProviderLabel,
  videoWatchUrl,
} from "@/features/campaigns/lib/media";
import type { Campaign, CampaignMedia } from "@/features/campaigns/types";
import { fundedRatio } from "@/features/campaigns/lib/amounts";

/**
 * The story.
 *
 * A campaign is two things at once: a project someone can be excited about, and
 * a claim someone is being asked to fund. So the story leads with whatever the
 * creator wrote, and then states the reviewed summary — the problem, the plan,
 * and who benefits — in the campaign's own words.
 *
 * When the creator has written no narrative the summary *is* the story and it is
 * given the room to be read as one. When they have, the summary steps back to a
 * supporting three-up and stops competing with the creator's own telling.
 */

const summaryEntries = (campaign: Campaign) =>
  [
    { key: "problem", label: "The problem", body: campaign.story.problem },
    { key: "plan", label: "The plan", body: campaign.story.solution },
    {
      key: "beneficiaries",
      label: "Who benefits",
      body: campaign.story.beneficiaries,
    },
  ] as const;

function StorySummary({
  campaign,
  compact,
}: {
  campaign: Campaign;
  compact: boolean;
}) {
  const entries = summaryEntries(campaign);

  return (
    <section
      aria-labelledby={compact ? "story-summary-heading" : undefined}
      className={compact ? "border-t border-border pt-7" : undefined}
    >
      {compact ? (
        <h2
          className="text-lg font-bold tracking-tight text-ink"
          id="story-summary-heading"
        >
          The project, in short
        </h2>
      ) : null}

      <dl
        className={
          compact ? "mt-4 grid gap-x-10 gap-y-6 sm:grid-cols-3" : "grid gap-8"
        }
      >
        {entries.map((entry) => (
          <div key={entry.key}>
            <dt className="text-xs font-bold uppercase tracking-[0.12em] text-brand-strong">
              {entry.label}
            </dt>
            <dd
              className={`mt-2 whitespace-pre-line ${
                compact
                  ? "text-sm leading-6 text-muted"
                  : "text-base leading-7 text-ink sm:text-lg sm:leading-8"
              }`}
            >
              {entry.body}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * One attached item, with the caption the creator wrote and, for a hosted video,
 * a way out to the original page when an embed is blocked.
 */
function StoryMediaFigure({ item }: { item: CampaignMedia }) {
  const watchUrl = item.kind === "video" ? videoWatchUrl(item.source) : null;
  const provider =
    item.kind === "video" ? videoProviderLabel(item.source) : null;

  return (
    <li>
      <figure>
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-surface-muted">
          {item.kind === "image" ? (
            <MediaImage
              src={item.src}
              alt={item.alt}
              sizes="(min-width: 640px) 420px, 100vw"
              className="object-cover"
            />
          ) : (
            <CampaignVideoPlayer
              media={item}
              sizes="(min-width: 640px) 420px, 100vw"
            />
          )}
        </div>

        {item.caption || watchUrl ? (
          <figcaption className="mt-2 text-xs leading-5 text-muted">
            {item.caption}
            {item.caption && watchUrl ? " " : null}
            {watchUrl ? (
              <a
                href={watchUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="font-semibold text-brand-strong underline"
              >
                Watch on {provider}
              </a>
            ) : null}
          </figcaption>
        ) : null}
      </figure>
    </li>
  );
}

/** Media the creator attached inside the story. An empty list renders nothing. */
export function CampaignStoryMedia({ campaign }: { campaign: Campaign }) {
  if (campaign.story.media.length === 0) return null;

  return (
    <section
      aria-labelledby="story-media-heading"
      className="border-t border-border pt-7"
    >
      <h2
        className="text-lg font-bold tracking-tight text-ink"
        id="story-media-heading"
      >
        From the campaign
      </h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {campaign.story.media.map((item) => (
          <StoryMediaFigure key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

export function CampaignStory({ campaign }: { campaign: Campaign }) {
  const hasNarrative = campaign.story.blocks.length > 0;

  return (
    <div className="space-y-8">
      <CampaignStoryBlocks blocks={campaign.story.blocks} />
      <StorySummary campaign={campaign} compact={hasNarrative} />
      <CampaignStoryMedia campaign={campaign} />
    </div>
  );
}

/**
 * How the money would be used.
 *
 * Drawn against the funding target rather than against what has been raised,
 * because the plan was written for the target. Bars are visual only: the label
 * and the exact amount carry the meaning, so a proportional bar with no legend
 * never has to be read precisely.
 */
export function CampaignUseOfFunds({ campaign }: { campaign: Campaign }) {
  const target = campaign.funding.target;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-ink">
          How {campaign.funding.fundingAsset} would be used
        </h3>
        <p className="text-sm text-muted">
          Target <Amount value={target} className="font-semibold text-ink" />
        </p>
      </div>

      <ul className="mt-4 space-y-4">
        {campaign.story.useOfFunds.map((line) => {
          const ratio = fundedRatio(line.amount, target) ?? 0;

          return (
            <li key={line.label}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="min-w-0 text-sm font-medium text-ink">
                  {line.label}
                </p>
                <p className="shrink-0 text-sm tabular-nums text-muted">
                  <Amount value={line.amount} />
                </p>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${Math.min(1, ratio) * 100}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 border-t border-border pt-3 text-xs leading-5 text-muted">
        These lines are the creator&apos;s published allocation of the target.
        They add up to the target, and each milestone tranche is drawn from
        them.
      </p>
    </div>
  );
}
