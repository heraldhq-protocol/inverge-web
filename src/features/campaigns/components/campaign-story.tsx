import { Amount } from "@/components/ui/amount";
import { CampaignVideoPlayer } from "@/features/campaigns/components/campaign-video-player";
import { MediaImage } from "@/features/campaigns/components/media-image";
import {
  videoProviderLabel,
  videoWatchUrl,
} from "@/features/campaigns/lib/media";
import type { Campaign, CampaignMedia } from "@/features/campaigns/types";
import { fundedRatio } from "@/features/campaigns/lib/amounts";

/**
 * The story, and how the money would be used.
 *
 * Use-of-funds is drawn against the funding target rather than against what has
 * been raised, because the plan was written for the target. Bars are visual
 * only: the label and the exact amount carry the meaning, so a proportional bar
 * with no legend never has to be read precisely.
 */
export function CampaignStory({ campaign }: { campaign: Campaign }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-brand-strong">
          The problem
        </h3>
        <p className="mt-2.5 text-base leading-7 text-ink">
          {campaign.story.problem}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-brand-strong">
          The plan
        </h3>
        <p className="mt-2.5 text-base leading-7 text-ink">
          {campaign.story.solution}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-brand-strong">
          Who benefits
        </h3>
        <p className="mt-2.5 text-base leading-7 text-ink">
          {campaign.story.beneficiaries}
        </p>
      </div>
    </div>
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
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-surface-muted">
          {item.kind === "image" ? (
            <MediaImage
              src={item.src}
              alt={item.alt}
              sizes="(min-width: 640px) 320px, 100vw"
              className="object-cover"
            />
          ) : (
            <CampaignVideoPlayer
              media={item}
              sizes="(min-width: 640px) 320px, 100vw"
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
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-brand-strong">
        From the campaign
      </h3>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {campaign.story.media.map((item) => (
          <StoryMediaFigure key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}

export function CampaignUseOfFunds({ campaign }: { campaign: Campaign }) {
  const target = campaign.funding.target;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
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
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink/[0.08]">
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
