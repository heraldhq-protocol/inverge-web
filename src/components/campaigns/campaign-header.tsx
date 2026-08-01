import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { Pill } from '@/components/ui/pill';
import { VerifiedBadge } from '@/components/ui/verified-badge';
import { formatDate } from '@/lib/format';
import type { CampaignDetail } from '@/lib/campaigns/types';

/**
 * The campaign's title band: status, title, summary, creator, and the link back to the idea that
 * earned it.
 *
 * The reference centres its title over a symmetrical page (teardown §4, band 1). Ours stays
 * left-aligned, because the page below is an asymmetric two-column read and a centred title over it
 * reads as a marketing page.
 *
 * "Validated as an idea first" is a link, not a badge. It is the strongest trust signal on the page —
 * strangers were asked whether this was worth building before anyone was asked for money — and a
 * signal a reader cannot follow is decoration.
 */
export function CampaignHeader({ campaign }: { campaign: CampaignDetail }) {
  const live = campaign.status === 'ACTIVE';
  const failed = campaign.status === 'FAILED';

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone={failed ? 'danger' : live ? 'accent' : 'neutral'}>
          {statusLabel(campaign.status)}
        </Pill>
        {campaign.region && <Pill>{campaign.region}</Pill>}
      </div>

      <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
        {campaign.title}
      </h1>

      <p className="max-w-[68ch] text-base leading-relaxed text-ink-muted">{campaign.summary}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex items-center gap-3">
          <Avatar name={campaign.creator.displayName} src={campaign.creator.avatarUrl} size={40} />
          <div>
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
              {campaign.creator.displayName}
              {campaign.creator.identityVerified && (
                <VerifiedBadge tier={campaign.creator.verificationTier} />
              )}
            </p>
            <p className="text-xs text-ink-muted">Launched {formatDate(campaign.launchedAt)}</p>
          </div>
        </div>

        {campaign.ideaSlug && (
          <Link
            href={`/ideas/${campaign.ideaSlug}`}
            className="rounded text-[13px] font-medium text-accent-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          >
            Validated as an idea first
          </Link>
        )}
      </div>
    </div>
  );
}

function statusLabel(status: CampaignDetail['status']): string {
  const labels: Record<CampaignDetail['status'], string> = {
    DRAFT: 'Draft',
    IN_REVIEW: 'With our reviewers',
    ACTIVE: 'Raising now',
    FUNDED: 'Funded, work starting',
    FAILED: 'Stage not delivered',
    COMPLETED: 'All stages delivered',
  };
  return labels[status];
}
