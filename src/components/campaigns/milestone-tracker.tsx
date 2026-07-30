import { cn } from '@/lib/utils';
import { Amount } from '@/components/ui/amount';
import { Pill } from '@/components/ui/pill';
import { TxLink } from '@/components/ui/tx-link';
import { parseDecimal, pluralise } from '@/lib/format';
import { MILESTONE_STATE_LABEL, milestoneState, objectionDaysLeft } from '@/lib/campaigns/milestone-state';
import type { CampaignDetail, Milestone, MilestoneState } from '@/lib/campaigns/types';

/**
 * The milestone tracker: the signature element of the whole product, and the screen the mockup kit says
 * to spend the design effort on.
 *
 * All states are legible **at once**, because the mechanic only makes sense as a sequence: what has been
 * released, what is being reviewed right now, what is still to come, and what failed. An idea of "34% of
 * the way through four stages" tells a backer nothing; four labelled stages with money attached tells
 * them everything.
 *
 * Horizontal at `lg` as an ordered row, vertical below it. Not a stepper widget with hidden steps: every
 * stage stays on screen, because a stage a backer cannot see is a stage they cannot object to.
 *
 * A tranche percentage is rendered as both a percentage and an amount, since "30%" of an unfamiliar total
 * is not a number anyone can act on.
 */
export function MilestoneTracker({ campaign }: { campaign: CampaignDetail }) {
  const raised = parseDecimal(campaign.totalRaised);

  return (
    <section aria-label="Delivery stages">
      <ol className="grid gap-3 lg:grid-cols-4">
        {campaign.milestones.map((m) => (
          <li key={m.id}>
            <MilestoneCard milestone={m} raised={raised} />
          </li>
        ))}
      </ol>

      <p className="mt-4 max-w-[68ch] text-xs leading-relaxed text-ink-muted">
        Each stage releases its share of the money only after backers have had a week to review what was
        delivered. Money for stages that have not been released is still held, and it is what gets
        returned if a stage is not delivered.
      </p>
    </section>
  );
}

function MilestoneCard({ milestone, raised }: { milestone: Milestone; raised: number }) {
  const state = milestoneState(milestone);
  const pct = parseDecimal(milestone.tranchePct);
  const amount = (pct / 100) * raised;
  const daysLeft = objectionDaysLeft(milestone);

  const surface: Record<MilestoneState, string> = {
    RELEASED: 'border-accent-500/30 bg-accent-50',
    UNDER_REVIEW: 'border-accent-500 bg-surface shadow-lift',
    UPCOMING: 'border-border bg-surface',
    NOT_DELIVERED: 'border-danger/40 bg-danger-50',
    DISPUTED: 'border-border bg-paper',
    CANCELLED: 'border-border bg-paper',
  };

  const tone: Record<MilestoneState, 'neutral' | 'accent' | 'danger'> = {
    RELEASED: 'accent',
    UNDER_REVIEW: 'accent',
    UPCOMING: 'neutral',
    NOT_DELIVERED: 'danger',
    DISPUTED: 'neutral',
    CANCELLED: 'neutral',
  };

  // Shape as well as colour, so the state survives greyscale and colour blindness (WCAG 1.4.1).
  const marker: Record<MilestoneState, string> = {
    RELEASED: '✓',
    UNDER_REVIEW: '◔',
    UPCOMING: '○',
    NOT_DELIVERED: '×',
    DISPUTED: '?',
    CANCELLED: '–',
  };

  return (
    <div className={cn('flex h-full flex-col rounded-xl border p-4', surface[state])}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted tabular-nums">
          Stage {milestone.index + 1}
        </span>
        <Pill tone={tone[state]} marker={<span aria-hidden="true">{marker[state]}</span>}>
          {MILESTONE_STATE_LABEL[state]}
        </Pill>
      </div>

      <h3 className="mt-2 text-sm font-semibold leading-snug text-ink">{milestone.title}</h3>

      <p className="mt-1 text-xs text-ink-muted tabular-nums">
        {pct}% of the raise
        {state !== 'CANCELLED' && (
          <>
            {' · '}
            <Amount value={amount} currency="USD" />
          </>
        )}
      </p>

      <p className="mt-2 text-xs leading-relaxed text-ink-muted">{milestone.deliverable}</p>

      <div className="mt-auto pt-3">
        {state === 'UNDER_REVIEW' && daysLeft !== null && (
          <p className="text-xs font-semibold text-ink tabular-nums">
            {daysLeft} {pluralise(daysLeft, 'day')} left to object
          </p>
        )}
        {state === 'RELEASED' && milestone.receipt && (
          <TxLink signature={milestone.receipt.txSignature} />
        )}
        {state === 'NOT_DELIVERED' && (
          <p className="text-xs font-semibold text-danger-700">Money still held was returned</p>
        )}
        {state === 'UPCOMING' && (
          <p className="text-xs text-ink-muted">Not claimed yet</p>
        )}
        {state === 'CANCELLED' && (
          <p className="text-xs text-ink-muted">Cancelled when an earlier stage failed</p>
        )}
      </div>
    </div>
  );
}
