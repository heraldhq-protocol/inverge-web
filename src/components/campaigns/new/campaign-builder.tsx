'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pill } from '@/components/ui/pill';
import {
  emptyDraft,
  hasErrors,
  sampleDraft,
  validateOrigin,
  validateRaise,
  validateStages,
  type CampaignDraft,
  type DraftErrors,
} from '@/lib/campaigns/campaign-draft';
import type { EligibleIdea } from '@/lib/campaigns/my-ideas';
import { BuilderPreview } from './builder-preview';
import { StepIdea } from './step-idea';
import { StepRaise } from './step-raise';
import { StepReview } from './step-review';
import { StepStages } from './step-stages';

const STEPS = ['idea', 'raise', 'stages', 'review'] as const;
type Step = (typeof STEPS)[number];

const STEP_LABEL: Record<Step, string> = {
  idea: 'Which idea',
  raise: 'The raise',
  stages: 'The stages',
  review: 'Review',
};

/**
 * The campaign builder: four steps, with a live preview of what backers will end up looking at.
 *
 * The preview is the design decision that matters here. A creator filling in a tranche percentage is
 * being asked to reason about something they have never seen; showing the milestone tracker updating
 * beside the form turns an abstract rule into an object they can look at. It is the same device
 * `/ideas/new` uses, for the same reason (pitch-narrative-playbook §5.2).
 *
 * **Nothing is saved.** These screens are UI only — no request is made at any point, and the last
 * step says so rather than pretending a draft exists somewhere. When the contract lands, one call
 * goes in one place: `POST /ideas/:id/convert` at the end of step three, which is the only campaign
 * write path the API has (campaign-data-contract.md §1).
 *
 * Steps are client state rather than routes, deliberately, and this is the one place on these
 * surfaces where that is the right call: a half-filled form is not a shareable URL, and a creator
 * landing on step three from a link would arrive at an empty stages list with no target above it.
 */
export function CampaignBuilder({ ideas }: { ideas: EligibleIdea[] }) {
  const [step, setStep] = useState<Step>('idea');
  const [draft, setDraft] = useState<CampaignDraft>(emptyDraft);
  const [showErrors, setShowErrors] = useState(false);
  const [done, setDone] = useState(false);

  const idea = useMemo(() => ideas.find((i) => i.id === draft.ideaId) ?? null, [ideas, draft.ideaId]);

  const originErrors = useMemo(() => validateOrigin(draft), [draft]);
  const raiseErrors = useMemo(() => validateRaise(draft), [draft]);
  const stageErrors = useMemo(() => validateStages(draft), [draft]);

  const stepErrors: Record<Step, DraftErrors> = {
    idea: originErrors,
    raise: raiseErrors,
    stages: stageErrors,
    review: {},
  };

  const currentErrors = stepErrors[step];
  const index = STEPS.indexOf(step);

  const goNext = () => {
    if (hasErrors(currentErrors)) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep(STEPS[Math.min(index + 1, STEPS.length - 1)]);
  };

  const goBack = () => {
    setShowErrors(false);
    setStep(STEPS[Math.max(index - 1, 0)]);
  };

  if (done) {
    return <Finished draft={draft} idea={idea} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StepBar current={step} errors={stepErrors} />
        <DevFill
          onFill={() => {
            setDraft(sampleDraft(ideas.find((i) => i.ready)?.id ?? null));
            setShowErrors(false);
          }}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="min-w-0 space-y-6">
          {step === 'idea' && (
            <StepIdea
              ideas={ideas}
              selectedId={draft.ideaId}
              standalone={draft.standalone}
              error={showErrors ? originErrors.origin : undefined}
              onSelect={(ideaId) => setDraft((d) => ({ ...d, ideaId, standalone: false }))}
              onStandalone={() => setDraft((d) => ({ ...d, ideaId: null, standalone: true }))}
            />
          )}

          {step === 'raise' && (
            <StepRaise
              draft={draft}
              idea={idea}
              errors={showErrors ? raiseErrors : {}}
              onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
            />
          )}

          {step === 'stages' && (
            <StepStages
              draft={draft}
              errors={showErrors ? stageErrors : {}}
              onChange={(milestones) => setDraft((d) => ({ ...d, milestones }))}
            />
          )}

          {step === 'review' && <StepReview draft={draft} idea={idea} />}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <Button variant="ghost" size="md" onClick={goBack} disabled={index === 0}>
              Back
            </Button>

            {step === 'review' ? (
              <div className="flex flex-col items-end gap-2">
                <Button variant="primary" size="md" onClick={() => setDone(true)}>
                  Save this as a draft
                </Button>
                <p className="max-w-[36ch] text-right text-xs leading-relaxed text-ink-muted">
                  Review is not open yet. Nothing is charged and nothing is submitted.
                </p>
              </div>
            ) : (
              <Button variant="primary" size="md" onClick={goNext}>
                Continue
              </Button>
            )}
          </div>

          {showErrors && hasErrors(currentErrors) && (
            <p className="text-sm font-medium text-danger-700" role="alert">
              There is something to fix above before you can continue.
            </p>
          )}
        </div>

        <div className="lg:sticky lg:top-24">
          <BuilderPreview draft={draft} idea={idea} />
        </div>
      </div>
    </div>
  );
}

/**
 * Fills the whole form with a valid sample, so a four-step flow can be reviewed without retyping it
 * on every change. **Development only** — `NODE_ENV` is inlined at build time, so this and the sample
 * data it pulls in are dead code the bundler drops from a production build.
 */
function DevFill({ onFill }: { onFill: () => void }) {
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <button
      type="button"
      onClick={onFill}
      className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-dashed border-border px-3 text-[13px] font-medium text-ink-muted transition-colors hover:border-accent-500/40 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
      title="Development only. Fills every step with a valid sample campaign."
    >
      <span aria-hidden="true">⚡</span>
      Fill with sample data
    </button>
  );
}

/**
 * Progress through the four steps.
 *
 * Not clickable forward, on purpose: step three cannot be filled in sensibly without the target from
 * step two, so a creator who jumps ahead lands somewhere that cannot be completed. Backwards is the
 * Back button, which does not lose anything.
 */
function StepBar({ current, errors }: { current: Step; errors: Record<Step, DraftErrors> }) {
  const index = STEPS.indexOf(current);

  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
      {STEPS.map((s, i) => {
        const state = i < index ? 'done' : i === index ? 'current' : 'upcoming';
        const complete = state === 'done' && !hasErrors(errors[s]);

        return (
          <li key={s} className="flex items-center gap-2">
            <span
              className={[
                'inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-[13px]',
                state === 'current'
                  ? 'bg-ink font-semibold text-paper'
                  : state === 'done'
                    ? 'bg-accent-100 font-medium text-accent-900'
                    : 'bg-ink/6 font-medium text-ink-muted',
              ].join(' ')}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span aria-hidden="true" className="tabular-nums">
                {complete ? '✓' : i + 1}
              </span>
              {STEP_LABEL[s]}
            </span>
            {i < STEPS.length - 1 && (
              <span aria-hidden="true" className="text-ink-muted/50">
                ›
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The end of the flow.
 *
 * It stops at a draft because that is genuinely where the product stops: curation (FR-304) and the
 * application fee (FR-311) do not exist yet. Saying so is better than a success screen that implies
 * a queue nobody is watching.
 */
function Finished({ draft, idea }: { draft: CampaignDraft; idea: EligibleIdea | null }) {
  return (
    <Card className="max-w-2xl p-6">
      <Pill tone="neutral">Draft</Pill>
      <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink">
        Your campaign is saved as a draft
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        &ldquo;{idea?.title ?? draft.title ?? 'Your campaign'}&rdquo; now has{' '}
        {draft.milestones.length} stages and a target, and only you can see it. Nothing has been
        charged and no backer can find it yet.
      </p>

      <h3 className="mt-6 text-sm font-semibold text-ink">What happens next</h3>
      <ol className="mt-2 space-y-2.5 text-sm leading-relaxed text-ink-muted">
        <li>
          <span className="font-medium text-ink">Verification.</span> Creators receive money, so we
          verify who you are before a campaign can launch. It is never required to publish an idea.
        </li>
        <li>
          <span className="font-medium text-ink">Review.</span> Every campaign is read by a person
          before it goes public, and they may come back with changes.
        </li>
        <li>
          <span className="font-medium text-ink">Launch.</span> Once it is approved, backers can fund
          it, and the stages you wrote become the thing they hold you to.
        </li>
      </ol>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="primary" size="md" href="/verify">
          Start verification
        </Button>
        <Button variant="outline" size="md" href="/campaigns">
          See live campaigns
        </Button>
      </div>
    </Card>
  );
}
