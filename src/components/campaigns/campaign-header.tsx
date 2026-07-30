import { Amount, Count } from '@/components/ui/amount';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Meter } from '@/components/ui/meter';
import { Pill } from '@/components/ui/pill';
import { daysUntil, formatDate, parseDecimal, pluralise } from '@/lib/format';
import type { CampaignDetail } from '@/lib/campaigns/types';

/**
 * Campaign header and funding panel.
 *
 * Same element order as the idea rail and the reference's funding panel, with the honest substitution the
 * other way round: on a campaign the money **has** moved, so "raised of goal" is accurate and leads. The
 * meter is uncapped here — over-target is real and there are no stretch goals to inflate it.
 *
 * Funding itself is not live: no on-ramp, no checkout, no wallet. The control says so plainly rather than
 * being present and broken.
 */
export function CampaignHeader({ campaign }: { campaign: CampaignDetail }) {
  const raised = parseDecimal(campaign.totalRaised);
  const target = parseDecimal(campaign.targetAmount);
  const daysLeft = daysUntil(campaign.deadline);
  const live = campaign.status === 'ACTIVE';
  const failed = campaign.status === 'FAILED';

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={failed ? 'danger' : live ? 'accent' : 'neutral'}>{statusLabel(campaign.status)}</Pill>
          {campaign.region && <Pill>{campaign.region}</Pill>}
          {campaign.ideaId && <Pill>Validated as an idea first</Pill>}
        </div>

        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          {campaign.title}
        </h1>

        <p className="max-w-[68ch] text-base leading-relaxed text-ink-muted">{campaign.summary}</p>

        <div className="flex items-center gap-3">
          <Avatar name={campaign.creator.displayName} src={campaign.creator.avatarUrl} size={40} />
          <div>
            <p className="text-sm font-semibold text-ink">
              {campaign.creator.displayName}
              {campaign.creator.identityVerified && (
                <span className="ml-2 text-xs font-semibold text-accent-700">Verified creator</span>
              )}
            </p>
            <p className="text-xs text-ink-muted">Launched {formatDate(campaign.launchedAt)}</p>
          </div>
        </div>
      </div>

      <Card className="p-5">
        <Meter
          ratio={target > 0 ? raised / target : 0}
          cap={false}
          tone={failed ? 'danger' : 'accent'}
          srLabel="of the funding goal"
        />

        <dl className="mt-4 space-y-4">
          <div>
            <dd className="font-display text-2xl font-bold tracking-tight text-accent-700">
              <Amount value={raised} currency="USD" />
            </dd>
            <dt className="mt-0.5 text-xs text-ink-muted">
              raised of <Amount value={target} currency="USD" /> goal
            </dt>
          </div>

          <div className="flex gap-8">
            <div>
              <dd className="font-display text-xl font-bold tracking-tight text-ink">
                <Count value={campaign.backerCount} />
              </dd>
              <dt className="text-xs text-ink-muted">{pluralise(campaign.backerCount, 'backer')}</dt>
            </div>
            {live && (
              <div>
                <dd className="font-display text-xl font-bold tracking-tight text-ink">
                  <Count value={daysLeft} />
                </dd>
                <dt className="text-xs text-ink-muted">{pluralise(daysLeft, 'day')} left</dt>
              </div>
            )}
          </div>
        </dl>

        <div className="mt-5 rounded-lg border border-dashed border-border bg-paper p-4">
          <p className="text-sm font-medium text-ink">Funding is not open yet</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            Campaigns are being piloted with a small group of creators first. Follow the idea behind this
            campaign and you will hear when backing opens.
          </p>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink-muted">
          <span className="font-semibold text-ink">All or nothing.</span> This campaign is only funded if it
          reaches its goal by {formatDate(campaign.deadline)}. The money is then released in stages, and
          only after backers have reviewed each one.
        </p>
      </Card>
    </div>
  );
}

function statusLabel(status: CampaignDetail['status']): string {
  const labels: Record<CampaignDetail['status'], string> = {
    DRAFT: 'Draft',
    IN_REVIEW: 'In review',
    ACTIVE: 'Raising now',
    FUNDED: 'Funded',
    FAILED: 'Stage not delivered',
    COMPLETED: 'All stages delivered',
  };
  return labels[status];
}
