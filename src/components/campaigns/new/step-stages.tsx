'use client';

import { Amount } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, controlClass } from '@/components/ui/field';
import { Meter } from '@/components/ui/meter';
import { Pill } from '@/components/ui/pill';
import {
  addMilestone,
  distributableAtTarget,
  distributeEvenly,
  removeMilestone,
  trancheAmountOf,
  trancheRemaining,
  trancheTotal,
  workingCapitalAmount,
  type CampaignDraft,
  type DraftErrors,
  type MilestoneDraft,
} from '@/lib/campaigns/campaign-draft';
import { PLATFORM } from '@/lib/campaigns/types';
import { parseDecimal } from '@/lib/format';

/**
 * Step three: the stages. The heart of the product, and the only step with a hard arithmetic rule.
 *
 * FR-302 requires the shares to sum to exactly 100, and the escrow programme rejects anything else,
 * so the form has to as well rather than letting a creator find out at submission. The running total
 * is therefore the most prominent thing on the step, it states the remainder rather than just the
 * sum, and it converts each share into money as it is typed — "30%" of a figure chosen two minutes
 * ago is not something anyone can check in their head.
 *
 * The evidence fields are the ones creators under-think, so they carry the heaviest coaching. What a
 * stage releases on is fixed at publication (FR-303) and is the exact thing backers will judge, so a
 * vague "screenshots" here becomes an argument in four months.
 */
export function StepStages({
  draft,
  errors,
  onChange,
}: {
  draft: CampaignDraft;
  errors: DraftErrors;
  onChange: (milestones: MilestoneDraft[]) => void;
}) {
  const { milestones } = draft;
  const distributable = distributableAtTarget(draft);
  const total = trancheTotal(milestones);
  const remaining = trancheRemaining(milestones);
  const complete = Math.abs(total - 100) < 0.001;

  const update = (key: string, patch: Partial<MilestoneDraft>) =>
    onChange(milestones.map((m) => (m.key === key ? { ...m, ...patch } : m)));

  // Adding and removing a stage both preserve the total, so a form that summed to 100 still does.
  // Leaving a creator to find a missing five percent by hand is the likeliest way to reach the review
  // step with an error nobody can see (campaign-draft.ts).
  const add = () => onChange(addMilestone(milestones, `m${Date.now().toString(36)}`));
  const remove = (key: string) => onChange(removeMilestone(milestones, key));
  const splitEvenly = () => onChange(distributeEvenly(milestones));

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-xl font-bold tracking-tight text-ink">
          How does the money get released?
        </h2>
        <p className="mt-1.5 max-w-[68ch] text-sm leading-relaxed text-ink-muted">
          Between {PLATFORM.minMilestones} and {PLATFORM.maxMilestones} stages. Each one names what
          will exist, how it will be proved, and what share of the money it releases. Backers get{' '}
          {PLATFORM.objectionWindowDays} days to review each one before it pays out.
        </p>
        {distributable > 0 && (
          <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-ink-muted">
            The stages divide{' '}
            <span className="font-semibold text-ink">
              <Amount value={distributable} currency="USD" />
            </span>{' '}
            between them: your goal, less the{' '}
            <Amount value={workingCapitalAmount(draft)} currency="USD" /> released when funding closes.
            Raise more than your goal and every stage is worth proportionally more.
          </p>
        )}
      </header>

      {/* The running total leads, because it is the rule the whole step is about. */}
      <Card className={complete ? 'border-accent-500/40 bg-accent-50 p-5' : 'p-5'}>
        <Meter
          ratio={total / 100}
          cap={false}
          tone={total > 100 ? 'danger' : 'accent'}
          srLabel="of the raise assigned to stages"
          label={
            <>
              <span className="text-sm font-semibold text-ink tabular-nums">{total}% allocated</span>
              <span className="text-xs text-ink-muted tabular-nums">
                {complete
                  ? 'Nothing left to assign.'
                  : remaining > 0
                    ? `${remaining}% still to assign.`
                    : `${Math.abs(remaining)}% over.`}
              </span>
            </>
          }
        />
        {errors.tranche && (
          <p className="mt-2.5 text-xs font-medium text-danger-700" role="alert">
            {errors.tranche}
          </p>
        )}
        {errors.count && (
          <p className="mt-2.5 text-xs font-medium text-danger-700" role="alert">
            {errors.count}
          </p>
        )}

        {!complete && (
          <button
            type="button"
            onClick={splitEvenly}
            className="mt-3 inline-flex min-h-8 items-center rounded-full border border-border bg-surface px-3 text-[13px] font-medium text-ink transition-colors hover:border-accent-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          >
            Split evenly across {milestones.length} stages
          </button>
        )}
      </Card>

      <ol className="space-y-4">
        {milestones.map((m, i) => (
          <li key={m.key}>
            <StageFields
              index={i}
              milestone={m}
              amount={trancheAmountOf(draft, m)}
              errors={errors}
              isFinal={i === milestones.length - 1}
              canRemove={milestones.length > PLATFORM.minMilestones}
              onChange={(patch) => update(m.key, patch)}
              onRemove={() => remove(m.key)}
            />
          </li>
        ))}
      </ol>

      {milestones.length < PLATFORM.maxMilestones && (
        <Button variant="outline" size="md" onClick={add}>
          Add a stage
        </Button>
      )}
    </div>
  );
}

function StageFields({
  index,
  milestone,
  amount,
  errors,
  isFinal,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number;
  milestone: MilestoneDraft;
  amount: number;
  errors: DraftErrors;
  isFinal: boolean;
  canRemove: boolean;
  onChange: (patch: Partial<MilestoneDraft>) => void;
  onRemove: () => void;
}) {
  const err = (field: string) => errors[`${milestone.key}.${field}`];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted tabular-nums">
          Stage {index + 1}
          {isFinal && <Pill size="xs">Delivery</Pill>}
        </h3>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="min-h-8 rounded px-2 text-xs font-medium text-ink-muted transition-colors hover:text-danger-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          >
            Remove
          </button>
        )}
      </div>

      {isFinal && (
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          The last stage is the one that confirms the whole thing landed, so it is the last money you
          are paid and it only moves once backers have reviewed the delivery.
        </p>
      )}

      <div className="mt-4 space-y-5">
        <Field
          label="What this stage delivers"
          help="Short and concrete. “Working prototype”, not “Phase one”."
          error={err('title')}
        >
          {({ id, invalid, describedBy }) => (
            <input
              id={id}
              type="text"
              value={milestone.title}
              onChange={(e) => onChange({ title: e.target.value })}
              aria-describedby={describedBy || undefined}
              aria-invalid={invalid || undefined}
              className={controlClass(invalid)}
            />
          )}
        </Field>

        <Field
          label="What will exist when it is done"
          help="One sentence a backer could check against reality. Numbers help."
          error={err('deliverable')}
        >
          {({ id, invalid, describedBy }) => (
            <textarea
              id={id}
              rows={2}
              value={milestone.deliverable}
              onChange={(e) => onChange({ deliverable: e.target.value })}
              aria-describedby={describedBy || undefined}
              aria-invalid={invalid || undefined}
              className={controlClass(invalid, 'resize-y leading-relaxed')}
            />
          )}
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Proof you will submit"
            help="What you will attach when you claim this stage."
            error={err('evidenceType')}
          >
            {({ id, invalid, describedBy }) => (
              <input
                id={id}
                type="text"
                placeholder="Demo link"
                value={milestone.evidenceType}
                onChange={(e) => onChange({ evidenceType: e.target.value })}
                aria-describedby={describedBy || undefined}
                aria-invalid={invalid || undefined}
                className={controlClass(invalid)}
              />
            )}
          </Field>

          <Field
            label="Where it comes from"
            help="The source, so the proof cannot be argued about later."
            error={err('evidenceSource')}
          >
            {({ id, invalid, describedBy }) => (
              <input
                id={id}
                type="text"
                placeholder="Public staging URL"
                value={milestone.evidenceSource}
                onChange={(e) => onChange({ evidenceSource: e.target.value })}
                aria-describedby={describedBy || undefined}
                aria-invalid={invalid || undefined}
                className={controlClass(invalid)}
              />
            )}
          </Field>
        </div>

        <Field
          label="Share of the raise this releases"
          help="Of what the stages divide. Backers see it as money, not as a percentage."
          error={err('tranchePct')}
        >
          {({ id, invalid, describedBy }) => (
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-28">
                <input
                  id={id}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={100}
                  step={1}
                  value={milestone.tranchePct}
                  onChange={(e) => onChange({ tranchePct: e.target.value })}
                  aria-describedby={describedBy || undefined}
                  aria-invalid={invalid || undefined}
                  className={controlClass(invalid, 'pr-8 tabular-nums')}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted">
                  %
                </span>
              </div>
              {parseDecimal(milestone.tranchePct) > 0 && amount > 0 && (
                <p className="text-sm text-ink-muted">
                  releases at least{' '}
                  <span className="font-semibold text-ink">
                    <Amount value={amount} currency="USD" />
                  </span>
                </p>
              )}
            </div>
          )}
        </Field>
      </div>
    </Card>
  );
}
