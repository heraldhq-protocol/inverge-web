import { Amount, Count } from '@/components/ui/amount';
import { Card } from '@/components/ui/card';
import { Meter } from '@/components/ui/meter';
import { Pill } from '@/components/ui/pill';
import { fundingProgress } from '@/lib/campaigns/campaign-stats';
import { daysUntil, formatDate, pluralise } from '@/lib/format';
import type { CampaignDetail } from '@/lib/campaigns/types';

/**
 * The funding panel, in the reference's number order (teardown §4, band 2): meter, the money, the
 * goal, backers, time left, the primary action, then the fine print naming the rule that protects
 * the reader.
 *
 * That order is a decision hierarchy — how much, of what goal, by how many people, in how long, do
 * the thing, and here is the rule. Idea detail already renders its rail this way, so a campaign that
 * put the same information in a different order would read as a different product.
 *
 * Sticky at `lg`, a block above the story below it: on a phone the numbers and the action come
 * before a long pitch, not after it.
 *
 * Funding itself is not live — there is no on-ramp, no checkout and no wallet — so the control says
 * so plainly rather than being present and broken.
 */
export function CampaignFundingPanel({ campaign }: { campaign: CampaignDetail }) {
  const funding = fundingProgress(campaign);
  const daysLeft = daysUntil(campaign.deadline);
  const live = campaign.status === 'ACTIVE';
  const failed = campaign.status === 'FAILED';

  return (
    <Card className="p-5">
      <Meter
        ratio={funding.ratio}
        cap={false}
        tone={failed ? 'danger' : 'accent'}
        srLabel="of the funding goal"
      />

      <dl className="mt-4 space-y-4">
        <div>
          <dd className="font-display text-2xl font-bold tracking-tight text-accent-700">
            <Amount value={funding.raised} currency="USD" />
          </dd>
          <dt className="mt-0.5 text-xs text-ink-muted">
            raised of <Amount value={funding.target} currency="USD" /> goal
            <span className="ml-1 font-semibold text-ink tabular-nums">({funding.pct}%)</span>
          </dt>
        </div>

        {/* Over goal is a good outcome and reads as one. It is stated, not celebrated: there are no
            stretch goals to unlock, so the honest thing to say is what the extra money is. */}
        {funding.over && (
          <div className="rounded-lg bg-accent-50 px-3 py-2.5">
            <p className="text-xs font-semibold text-accent-900">
              <Amount value={funding.surplus} currency="USD" /> past the goal
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-ink-muted">
              The extra is held in escrow with the rest and released against the same stages. There
              are no stretch goals.
            </p>
          </div>
        )}

        <div className="flex gap-8">
          <div>
            <dd className="font-display text-xl font-bold tracking-tight text-ink">
              <Count value={campaign.backerCount} />
            </dd>
            <dt className="text-xs text-ink-muted">{pluralise(campaign.backerCount, 'backer')}</dt>
          </div>
          <div>
            <dd className="font-display text-xl font-bold tracking-tight text-ink">
              {live ? <Count value={daysLeft} /> : '—'}
            </dd>
            <dt className="text-xs text-ink-muted">
              {live ? `${pluralise(daysLeft, 'day')} left` : 'closed'}
            </dt>
          </div>
        </div>
      </dl>

      <div className="mt-5 rounded-lg border border-dashed border-border bg-paper p-4">
        <p className="text-sm font-medium text-ink">Funding is not open yet</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          Campaigns are being piloted with a small group of creators first. Follow the idea behind
          this campaign and you will hear when backing opens.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Pill>{campaign.type === 'ALL_OR_NOTHING' ? 'All or nothing' : 'Flexible funding'}</Pill>
        <Pill>Released in {campaign.milestones.length} stages</Pill>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-ink-muted">
        <span className="font-semibold text-ink">All or nothing.</span> This campaign is only funded
        if it reaches its goal by {formatDate(campaign.deadline)}. The money is then released in
        stages, and only after backers have reviewed each one.
      </p>
    </Card>
  );
}
