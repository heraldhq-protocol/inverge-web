import Link from 'next/link';
import { Amount, Count } from '@/components/ui/amount';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Pill } from '@/components/ui/pill';
import { VerifiedBadge } from '@/components/ui/verified-badge';
import { outcomeLabel } from '@/lib/campaigns/campaign-stats';
import { creatorTrackRecord } from '@/lib/campaigns/campaign-stats';
import { formatDate, parseDecimal } from '@/lib/format';
import type { CampaignCreator as Creator, CreatorCampaignSummary } from '@/lib/campaigns/types';

const TIER_MEANING: Record<Creator['tier'], string> = {
  STARTER:
    'A creator running their first campaign. Every campaign is all or nothing, and one at a time.',
  TRUSTED: 'One campaign delivered in full, with no upheld objections against it.',
  ESTABLISHED:
    'Two or more campaigns delivered in full, a year on the platform, and a record of backing other people.',
};

/**
 * The creator trust surface.
 *
 * The reference calls this its highest-value tab and it is right: on a page asking a stranger for
 * money, the durable question is not "is this a good idea" but "has this person finished anything
 * before" (teardown §5.3). It is also the tab we are least able to fill, since display identity is
 * still an API ask.
 *
 * Three deliberate inversions of the reference:
 *
 * - **Outcome labels are counted, not claimed.** Kickstarter shows a creator-set "Marked as
 *   fulfilled" overlay. Ours says "All 4 stages delivered" because four stages were released, and
 *   there is no field anyone can set to say otherwise.
 * - **No engagement badges.** "Backer Favorite" and "Repeat Creator" are flattery. Our tier ladder is
 *   a permissions ladder with strikes attached, so it renders as fact with its meaning spelled out.
 * - **No last-login, and never `activeStrikes`.** Last login is a liveness signal on a site with
 *   600,000 projects and a privacy leak on a product where the creator may be one identifiable person
 *   in a small market. Strikes affect ranking and must never become a public scarlet letter
 *   (campaign-brief.md §9 rule 6).
 */
export function CampaignCreatorPanel({
  creator,
  history,
  record,
}: {
  creator: Creator;
  history: CreatorCampaignSummary[];
  record: ReturnType<typeof creatorTrackRecord>;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <div className="min-w-0 space-y-6">
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar name={creator.displayName} src={creator.avatarUrl} size={44} />
            <div className="min-w-0">
              <p className="font-display text-lg font-bold tracking-tight text-ink">
                {creator.displayName}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {creator.identityVerified ? (
                  <VerifiedBadge tier={creator.verificationTier} />
                ) : (
                  <Pill>Not yet verified</Pill>
                )}
                <Pill>{tierLabel(creator.tier)}</Pill>
              </div>
            </div>
          </div>

          {creator.bio && (
            <p className="mt-4 max-w-[68ch] text-sm leading-relaxed text-ink-muted">{creator.bio}</p>
          )}

          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
            <Figure label="Campaigns run" value={<Count value={record.campaigns} />} />
            <Figure
              label="Stages released"
              value={
                <span className="tabular-nums">
                  {record.stagesReleased} of {record.stagesTotal}
                </span>
              }
            />
            <Figure
              label="Raised across all"
              value={<Amount value={record.raisedTotal} currency="USD" />}
            />
            <Figure
              label="On Inverge since"
              value={
                <span className="text-base">
                  {formatDate(creator.memberSince).replace(/^\d+\s/, '')}
                </span>
              }
            />
          </dl>

          <p className="mt-4 text-xs leading-relaxed text-ink-muted">
            <span className="font-medium text-ink">{tierLabel(creator.tier)}.</span>{' '}
            {TIER_MEANING[creator.tier]}
          </p>
        </Card>

        <section>
          <h2 className="font-display text-lg font-bold tracking-tight text-ink">
            Other campaigns by this creator
          </h2>
          {history.length === 0 ? (
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              This is their first campaign. Everything they deliver on it becomes the record the next
              one is judged on.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {history.map((c) => (
                <li key={c.id}>
                  <HistoryRow campaign={c} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Card tone="quiet" className="p-5">
        <h2 className="text-sm font-semibold text-ink">Why track record matters here</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Backers decide whether each stage of this campaign was delivered. What a creator has
          finished before is the most useful thing you can weigh when that decision comes round, so
          it is counted from released stages rather than claimed.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          A creator moves up a tier by delivering, and down one if backers uphold an objection against
          them. Tier changes what a creator may do next. It never changes whether you can see them.
        </p>
      </Card>
    </div>
  );
}

function HistoryRow({ campaign }: { campaign: CreatorCampaignSummary }) {
  const delivered = campaign.status === 'COMPLETED';
  const failed = campaign.status === 'FAILED';

  return (
    <Card className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-4">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-ink">
          <Link
            href={`/campaigns/${campaign.slug}`}
            className="rounded hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          >
            {campaign.title}
          </Link>
        </h3>
        <p className="mt-0.5 text-xs text-ink-muted">
          Closed {formatDate(campaign.deadline)} ·{' '}
          <span className="tabular-nums">
            <Amount value={parseDecimal(campaign.totalRaised)} currency="USD" /> raised
          </span>
        </p>
      </div>
      <Pill
        tone={failed ? 'danger' : delivered ? 'accent' : 'neutral'}
        marker={<span aria-hidden="true">{failed ? '×' : delivered ? '✓' : '○'}</span>}
      >
        {outcomeLabel(
          {
            total: campaign.milestoneTotal,
            released: campaign.milestonesReleased,
            underReview: 0,
            failed: failed ? 1 : 0,
          },
          campaign.status
        )}
      </Pill>
    </Card>
  );
}

function Figure({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dd className="font-display text-lg font-bold tracking-tight text-ink">{value}</dd>
      <dt className="text-xs text-ink-muted">{label}</dt>
    </div>
  );
}

function tierLabel(tier: Creator['tier']): string {
  const labels: Record<Creator['tier'], string> = {
    STARTER: 'Starter',
    TRUSTED: 'Trusted',
    ESTABLISHED: 'Established',
  };
  return labels[tier];
}
