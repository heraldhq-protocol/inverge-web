import { Amount, Count } from '@/components/ui/amount';
import { Card } from '@/components/ui/card';
import { Meter } from '@/components/ui/meter';
import { Pill } from '@/components/ui/pill';
import { buildGateProgress, validationDaysLeft } from '@/lib/ideas/gate';
import { formatPercent, pluralise } from '@/lib/format';
import type { IdeaDetail } from '@/lib/ideas/types';
import { GateBreakdown } from './gate-breakdown';
import { IdeaActions } from './idea-actions';

/**
 * The sticky rail. Element order is lifted straight from the reference's funding panel (teardown §4,
 * band 2), because that order is a decision hierarchy: how far along, measured how, by how many
 * people, in how long, then the action, then the rule that protects you.
 *
 * The substitution is the important part. Where the reference leads with money raised, we lead with
 * progress toward the validation threshold and label the money figure "Estimated interest" — nothing
 * has been charged, so presenting it as raised would be a false statement about a financial commitment
 * (brief §7.1).
 *
 * Sticky at `lg`; below that the page renders it inline near the top, so a phone reader still sees the
 * numbers and the primary action before the story.
 */
export function IdeaActionPanel({ idea }: { idea: IdeaDetail }) {
  const gate = buildGateProgress(idea);
  const daysLeft = validationDaysLeft(idea.validatingSince);
  const thresholdMet = idea.status === 'THRESHOLD_MET';

  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <Meter
          ratio={gate.overallPct}
          srLabel="to the validation threshold"
          label={
            <>
              <span className="font-display text-xl font-bold tracking-tight text-ink tabular-nums">
                {thresholdMet ? 'Threshold met' : formatPercent(gate.overallPct)}
              </span>
              {!thresholdMet && (
                <span className="text-xs text-ink-muted">to validation threshold</span>
              )}
            </>
          }
        />

        <dl className="mt-5 space-y-4">
          <div>
            <dd className="font-display text-2xl font-bold tracking-tight text-accent-700">
              <Amount value={idea.weightedPrePledgeTotal} currency="USD" />
            </dd>
            <dt className="mt-0.5 text-xs text-ink-muted">
              Estimated interest, weighted by how verified each supporter is
            </dt>
          </div>

          <div className="flex gap-8">
            <div>
              <dd className="font-display text-xl font-bold tracking-tight text-ink">
                <Count value={idea.supporterCount} />
              </dd>
              <dt className="text-xs text-ink-muted">
                {pluralise(idea.supporterCount, 'supporter')}
              </dt>
            </div>
            {daysLeft !== null && !thresholdMet && (
              <div>
                <dd className="font-display text-xl font-bold tracking-tight text-ink">
                  <Count value={daysLeft} />
                </dd>
                <dt className="text-xs text-ink-muted">
                  {pluralise(daysLeft, 'day')} left to validate
                </dt>
              </div>
            )}
          </div>
        </dl>

        {thresholdMet && (
          <div className="mt-4">
            <Pill tone="accent" marker={<span aria-hidden="true">✓</span>}>
              Ready to raise
            </Pill>
          </div>
        )}

        <div className="mt-5">
          <IdeaActions ideaId={idea.slug} />
        </div>
      </div>

      <div className="border-t border-border bg-paper p-5">
        <GateBreakdown gate={gate} />
      </div>
    </Card>
  );
}
