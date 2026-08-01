'use client';

import { Amount } from '@/components/ui/amount';
import { Card } from '@/components/ui/card';
import { Field, controlClass } from '@/components/ui/field';
import { Pill } from '@/components/ui/pill';
import {
  flexibleFunding,
  workingCapitalAmount,
  type CampaignDraft,
  type DraftErrors,
} from '@/lib/campaigns/campaign-draft';
import { PLATFORM } from '@/lib/campaigns/types';
import { CATEGORIES, type IdeaCategory } from '@/lib/feed/types';
import { parseDecimal } from '@/lib/format';
import type { EligibleIdea } from '@/lib/campaigns/my-ideas';

/**
 * Step two: the target, the deadline, the working capital share, and the pitch video.
 *
 * Every field carries coaching rather than instruction: what a good answer contains, and what a
 * backer will see as a result (pitch-narrative-playbook §4). The working capital field states its
 * consequence in money as it is typed, because "20%" of a figure a creator picked ninety seconds ago
 * is not something anyone can sanity-check in their head.
 *
 * **Flexible Funding renders disabled for a Starter creator rather than being hidden.** FR-306 is an
 * eligibility ladder, and a ladder nobody can see is not an incentive: naming what one delivered
 * campaign unlocks is the clearest possible statement of what delivering buys you.
 */
export function StepRaise({
  draft,
  idea,
  errors,
  onChange,
}: {
  draft: CampaignDraft;
  idea: EligibleIdea | null;
  errors: DraftErrors;
  onChange: (patch: Partial<CampaignDraft>) => void;
}) {
  // The tier the builder renders as. It comes from the creator's profile when there is one to read.
  const flexible = flexibleFunding('STARTER');
  const wcAmount = workingCapitalAmount(draft);
  const target = parseDecimal(draft.targetAmount);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-xl font-bold tracking-tight text-ink">
          What are you raising?
        </h2>
        <p className="mt-1.5 max-w-[68ch] text-sm leading-relaxed text-ink-muted">
          {idea ? (
            <>
              &ldquo;{idea.title}&rdquo; asked for <Amount value={idea.askAmount} currency="USD" />{' '}
              during validation. You can raise a different amount, but a target far above what people
              supported is a harder sell.
            </>
          ) : (
            <>
              You are raising without a validated idea behind this, so everything on the campaign page
              starts here.
            </>
          )}
        </p>
      </header>

      {/* Only when there is no idea to inherit from. With one, these come from the idea and a second
          place to edit them is a second version of the truth. */}
      {draft.standalone && (
        <div className="space-y-5">
          <Field
            label="Campaign name"
            help="Short and specific. It is the first thing anyone reads."
            error={errors.title}
          >
            {({ id, invalid, describedBy }) => (
              <input
                id={id}
                type="text"
                value={draft.title}
                onChange={(e) => onChange({ title: e.target.value })}
                aria-describedby={describedBy || undefined}
                aria-invalid={invalid || undefined}
                className={controlClass(invalid)}
              />
            )}
          </Field>

          <Field
            label="The problem, in one sentence"
            help="Who has this problem, and how often? This is the line under your title on every card."
            error={errors.summary}
            counter={{ value: draft.summary.length, target: 120 }}
          >
            {({ id, invalid, describedBy }) => (
              <textarea
                id={id}
                rows={2}
                value={draft.summary}
                onChange={(e) => onChange({ summary: e.target.value })}
                aria-describedby={describedBy || undefined}
                aria-invalid={invalid || undefined}
                className={controlClass(invalid, 'resize-y leading-relaxed')}
              />
            )}
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" help="Where backers browsing by interest will find it.">
              {({ id, invalid, describedBy }) => (
                <select
                  id={id}
                  value={draft.category}
                  onChange={(e) => onChange({ category: e.target.value as IdeaCategory })}
                  aria-describedby={describedBy || undefined}
                  className={controlClass(invalid)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              )}
            </Field>

            <Field
              label="Where"
              help="The town or city this happens in. Backers filter by it."
              error={errors.region}
            >
              {({ id, invalid, describedBy }) => (
                <input
                  id={id}
                  type="text"
                  value={draft.region}
                  onChange={(e) => onChange({ region: e.target.value })}
                  aria-describedby={describedBy || undefined}
                  aria-invalid={invalid || undefined}
                  className={controlClass(invalid)}
                />
              )}
            </Field>
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Funding target"
          help="What do you need to build every stage? Backers see this figure against what has been raised."
          error={errors.targetAmount}
        >
          {({ id, invalid, describedBy }) => (
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted">
                US$
              </span>
              <input
                id={id}
                type="number"
                inputMode="decimal"
                min={0}
                step={100}
                value={draft.targetAmount}
                onChange={(e) => onChange({ targetAmount: e.target.value })}
                aria-describedby={describedBy || undefined}
                aria-invalid={invalid || undefined}
                className={controlClass(invalid, 'pl-12 tabular-nums')}
              />
            </div>
          )}
        </Field>

        <Field
          label="Funding closes"
          help="Campaigns are all or nothing. If the goal is not reached by this date, nothing is charged and every backer keeps their money."
          error={errors.deadline}
        >
          {({ id, invalid, describedBy }) => (
            <input
              id={id}
              type="date"
              value={draft.deadline}
              onChange={(e) => onChange({ deadline: e.target.value })}
              aria-describedby={describedBy || undefined}
              aria-invalid={invalid || undefined}
              className={controlClass(invalid)}
            />
          )}
        </Field>
      </div>

      <Field
        label="Released when funding closes"
        optional
        help={`The share released as soon as funding closes, so you are not funding the first stage yourself. Up to ${PLATFORM.workingCapitalMaxPct}%. Backers see this figure before they back you.`}
        error={errors.workingCapitalPct}
      >
        {({ id, invalid, describedBy }) => (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-32">
              <input
                id={id}
                type="number"
                inputMode="decimal"
                min={0}
                max={PLATFORM.workingCapitalMaxPct}
                step={1}
                value={draft.workingCapitalPct}
                onChange={(e) => onChange({ workingCapitalPct: e.target.value })}
                aria-describedby={describedBy || undefined}
                aria-invalid={invalid || undefined}
                className={controlClass(invalid, 'pr-8 tabular-nums')}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted">
                %
              </span>
            </div>
            {target > 0 && wcAmount > 0 && (
              <p className="text-sm text-ink-muted">
                <span className="font-semibold text-ink">
                  <Amount value={wcAmount} currency="USD" />
                </span>{' '}
                released before any stage is verified
              </p>
            )}
          </div>
        )}
      </Field>

      <Field
        label="Pitch video"
        help="Two minutes of you explaining what this is and why you are the person to build it. Required: backers are funding a plan, and they should hear it from you."
        error={errors.videoUrl}
      >
        {({ id, invalid, describedBy }) => (
          <input
            id={id}
            type="url"
            inputMode="url"
            placeholder="https://"
            value={draft.videoUrl}
            onChange={(e) => onChange({ videoUrl: e.target.value })}
            aria-describedby={describedBy || undefined}
            aria-invalid={invalid || undefined}
            className={controlClass(invalid)}
          />
        )}
      </Field>

      <Field
        label="Cover image"
        optional
        help="The still that fronts your campaign in listings. Without one we use a frame from your video."
        error={errors.coverImageUrl}
      >
        {({ id, invalid, describedBy }) => (
          <input
            id={id}
            type="url"
            inputMode="url"
            placeholder="https://"
            value={draft.coverImageUrl}
            onChange={(e) => onChange({ coverImageUrl: e.target.value })}
            aria-describedby={describedBy || undefined}
            aria-invalid={invalid || undefined}
            className={controlClass(invalid)}
          />
        )}
      </Field>

      <Card tone="quiet" className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-ink">How funding works</h3>
          <Pill tone="accent" size="xs">
            All or nothing
          </Pill>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Your campaign is only funded if it reaches its target by the deadline. If it does not,
          nothing is charged and every backer keeps their money.
        </p>

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-medium text-ink-muted">Flexible funding</h4>
            <Pill size="xs">Not available on your tier</Pill>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
            {flexible.requirement} It lets a campaign that clears a floor below its target go ahead
            rather than fail outright.
          </p>
        </div>
      </Card>
    </div>
  );
}
