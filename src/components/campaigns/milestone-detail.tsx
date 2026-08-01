import { Amount } from '@/components/ui/amount';
import { Card } from '@/components/ui/card';
import { Meter } from '@/components/ui/meter';
import { Pill } from '@/components/ui/pill';
import { TxLink } from '@/components/ui/tx-link';
import { trancheAmount } from '@/lib/campaigns/campaign-stats';
import {
  MILESTONE_STATE_LABEL,
  milestoneState,
  objectionDaysLeft,
} from '@/lib/campaigns/milestone-state';
import { formatDate, parseDecimal, pluralise } from '@/lib/format';
import type { CampaignDetail, Milestone, MilestoneState } from '@/lib/campaigns/types';
import { MilestoneProof } from './milestone-proof';

const MARKER: Record<MilestoneState, string> = {
  RELEASED: '✓',
  UNDER_REVIEW: '◔',
  UPCOMING: '○',
  NOT_DELIVERED: '×',
  DISPUTED: '?',
  CANCELLED: '–',
};

const TONE: Record<MilestoneState, 'neutral' | 'accent' | 'danger'> = {
  RELEASED: 'accent',
  UNDER_REVIEW: 'accent',
  UPCOMING: 'neutral',
  NOT_DELIVERED: 'danger',
  DISPUTED: 'neutral',
  CANCELLED: 'neutral',
};

/**
 * Every stage in full: what was agreed, what was submitted, what the objections came to, and where
 * the receipt is.
 *
 * The tracker above it is the scannable summary; this is the record. **Proof shows for released
 * stages too**, not only the one currently open — a backer arriving three months later needs to be
 * able to check what a stage was released on, and a product that only shows its evidence while a
 * vote is running is asking to be taken on trust afterwards.
 *
 * `DISPUTED` is drawn neutrally on purpose. The threshold was met and the creator appealed inside
 * their 72 hours (FR-606); nobody has been found to be in the wrong, and colouring it as a failure
 * would decide the question the panel exists to answer.
 */
export function MilestoneDetail({ campaign }: { campaign: CampaignDetail }) {
  return (
    <section aria-label="Stage by stage" className="space-y-4">
      <h2 className="font-display text-lg font-bold tracking-tight text-ink">Stage by stage</h2>
      <ol className="space-y-4">
        {campaign.milestones.map((milestone) => (
          <li key={milestone.id}>
            <StageCard campaign={campaign} milestone={milestone} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function StageCard({ campaign, milestone }: { campaign: CampaignDetail; milestone: Milestone }) {
  const state = milestoneState(milestone);
  const claim = milestone.claim;
  const amount = trancheAmount(campaign, milestone);
  const daysLeft = objectionDaysLeft(milestone);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted tabular-nums">
            Stage {milestone.index + 1}
          </p>
          <h3 className="mt-1 font-display text-lg font-bold tracking-tight text-ink">
            {milestone.title}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Pill tone={TONE[state]} marker={<span aria-hidden="true">{MARKER[state]}</span>}>
            {MILESTONE_STATE_LABEL[state]}
          </Pill>
          <p className="text-xs text-ink-muted tabular-nums">
            {parseDecimal(milestone.tranchePct)}% ·{' '}
            <span className="font-semibold text-ink">
              <Amount value={amount} currency="USD" />
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-5 px-5 py-4">
        <div>
          <h4 className="text-sm font-semibold text-ink">What was agreed</h4>
          <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-ink-muted">
            {milestone.deliverable}
          </p>
        </div>

        {claim ? (
          <>
            <div className="border-t border-border pt-4">
              <MilestoneProof milestone={milestone} claim={claim} />
            </div>

            <ObjectionAggregate campaign={campaign} milestone={milestone} />

            {claim.ruling && (
              <div className="rounded-lg border border-border bg-paper p-4">
                <p className="text-sm font-semibold text-ink">
                  The review panel{' '}
                  {claim.ruling.outcome === 'RELEASED'
                    ? 'released this stage'
                    : 'upheld the objections'}
                </p>
                <p className="mt-1.5 max-w-[68ch] text-sm leading-relaxed text-ink-muted">
                  {claim.ruling.reason}
                </p>
                <p className="mt-2 text-xs text-ink-muted">
                  Ruled on {formatDate(claim.ruling.ruledAt)}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="border-t border-border pt-4">
            <p className="text-sm text-ink-muted">
              {state === 'CANCELLED'
                ? 'This stage was cancelled when an earlier stage was not delivered. The money for it was returned to backers.'
                : 'Nothing has been submitted for this stage yet.'}
            </p>
            {state === 'UPCOMING' && (
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                When it is claimed, the creator submits {milestone.evidenceDefinition.type.toLowerCase()},
                from {milestone.evidenceDefinition.source.toLowerCase()}, and backers get{' '}
                {daysLeft === null ? 'a week' : 'a week'} to review it.
              </p>
            )}
          </div>
        )}

        {milestone.receipt && state !== 'NOT_DELIVERED' && (
          <div className="border-t border-border pt-4">
            <TxLink signature={milestone.receipt.txSignature} />
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Objections, as an aggregate against the threshold and nothing else.
 *
 * No count of objectors, no identities, no reasons attributable to a person. Individual objections
 * carry a `userId` and a reason and are not backer-facing; FR-608's public voting history is a
 * separate surface with its own privacy pass (campaign-data-contract §2.2).
 */
function ObjectionAggregate({
  campaign,
  milestone,
}: {
  campaign: CampaignDetail;
  milestone: Milestone;
}) {
  const claim = milestone.claim;
  if (!claim) return null;

  const weight = parseDecimal(claim.objectionWeightPct);
  const threshold = parseDecimal(claim.objectionThresholdPct);
  const state = milestoneState(milestone);
  const daysLeft = objectionDaysLeft(milestone);
  const passed = weight >= threshold;

  return (
    <div className="border-t border-border pt-4">
      <Meter
        ratio={threshold > 0 ? weight / threshold : 0}
        tone={passed ? 'danger' : 'neutral'}
        size="sm"
        srLabel="of the objections needed to stop this stage"
        label={
          <>
            <span className="text-xs font-medium text-ink">Objections</span>
            <span className="text-xs text-ink-muted tabular-nums">
              {weight}% of the {threshold}% needed
            </span>
          </>
        }
      />
      <p className="mt-2 text-xs leading-relaxed text-ink-muted">
        {state === 'UNDER_REVIEW' && daysLeft !== null ? (
          <>
            Backers have {daysLeft} {pluralise(daysLeft, 'day')} left to review this, until{' '}
            {formatDate(claim.objectionWindowEndsAt)}.
          </>
        ) : state === 'DISPUTED' ? (
          <>
            The window closed on {formatDate(claim.objectionWindowEndsAt)} with enough objections to
            stop the release. {campaign.creator.displayName} appealed, and a review panel is deciding.
          </>
        ) : (
          <>Window closed {formatDate(claim.objectionWindowEndsAt)}.</>
        )}{' '}
        Objections are weighted by how much a backer put in, and no single backer counts for more than
        15% of the total.
      </p>
    </div>
  );
}
