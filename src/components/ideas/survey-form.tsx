'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Count } from '@/components/ui/amount';
import { EmptyState } from '@/components/ui/empty-state';
import { InfoTooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { clamp01 } from '@/lib/format';
import type { SurveyAggregate, SurveyQuestion } from '@/lib/ideas/types';

/**
 * The creator's survey: answer it, then see what everyone else said.
 *
 * **One form, one submit.** The previous version voted on every click, one question at a time, which
 * made a partly-answered survey indistinguishable from a finished one and gave no way to change an
 * answer before committing. A real form with radio inputs is also the only version that works with a
 * keyboard, a screen reader, and a tap on a phone without any custom handling.
 *
 * Flow: answer → review what you sent alongside the aggregate → change it if you want. One response per
 * person (the API upserts on `(idea, user)`), so "change my answer" is the honest affordance rather than
 * a second vote.
 *
 * Writes are not connected in this fixture build. Live path: `POST /ideas/:id/survey/responses` with
 * `{ answers: [{ questionId, value }] }`, and `DELETE` to withdraw.
 */

import { submitSurveyResponses } from '@/lib/ideas/ideas-api';

type AnswerValue = number | boolean | string;
type Answers = Record<string, AnswerValue>;

export function SurveyForm({
  ideaId,
  questions,
  aggregates: initialAggregates,
}: {
  ideaId?: string;
  questions: SurveyQuestion[];
  aggregates: SurveyAggregate[];
}) {
  const [aggregates, setAggregates] = useState<SurveyAggregate[]>(initialAggregates);
  const [draft, setDraft] = useState<Answers>({});
  const [submitted, setSubmitted] = useState<Answers | null>(null);
  const [attempted, setAttempted] = useState(false);

  const ordered = useMemo(() => [...questions].sort((a, b) => a.index - b.index), [questions]);
  const byId = useMemo(() => new Map(aggregates.map((a) => [a.questionId, a])), [aggregates]);

  if (ordered.length === 0) {
    return (
      <EmptyState
        title="The creator has not added questions yet."
        body="When they do, this is where you tell them what you would change."
      />
    );
  }

  const missing = ordered.filter((q) => q.required && draft[q.id] === undefined);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);
    if (missing.length > 0) {
      document.getElementById(`q-${missing[0].id}`)?.scrollIntoView({ block: 'center' });
      return;
    }
    setAggregates((prev) => prev.map((agg) => applyAnswer(agg, draft[agg.questionId])));
    setSubmitted(draft);

    if (ideaId) {
      try {
        const payload = Object.entries(draft).map(([questionId, val]) => ({
          questionId,
          rating: typeof val === 'number' ? val : undefined,
          text: typeof val === 'string' ? val : undefined,
          selectedOptions: typeof val === 'string' ? [val] : undefined,
        }));
        await submitSurveyResponses(ideaId, payload);
      } catch (err) {
        console.warn('[SurveyForm] Live survey submission failed:', err);
      }
    }
  }

  function reopen() {
    // Roll the aggregate back before re-opening, so a changed answer is not counted twice.
    setAggregates((prev) => prev.map((agg) => removeAnswer(agg, submitted?.[agg.questionId])));
    setSubmitted(null);
    setAttempted(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight text-ink">
            {submitted ? 'What supporters said' : 'The creator has questions for you'}
          </h2>
          <p className="mt-1 max-w-[60ch] text-[13px] leading-relaxed text-ink-muted">
            {submitted
              ? 'Your answers are in. You can change them while this idea is still being validated.'
              : 'Answering takes under a minute and is the most useful thing you can do here. Nothing is charged.'}
          </p>
        </div>
        <InfoTooltip
          label="About survey answers"
          content="Answers count toward the survey thresholds an idea has to clear before it can raise money. They are separate from support and pre-pledges, and none of it can be bought."
        />
      </div>

      <form onSubmit={submit} noValidate className="space-y-4">
        {ordered.map((q) => {
          const agg = byId.get(q.id);
          const value = submitted ? submitted[q.id] : draft[q.id];
          const showMissing = attempted && !submitted && q.required && draft[q.id] === undefined;

          return (
            <Card
              key={q.id}
              id={`q-${q.id}`}
              className={cn('scroll-mt-24 p-4 sm:p-5', showMissing && 'border-danger/50 bg-danger-50')}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="text-sm font-semibold text-ink">
                  {q.prompt}
                  {!q.required && (
                    <span className="ml-1.5 text-[11px] font-normal text-ink-muted">optional</span>
                  )}
                </h3>
                <p className="text-[11px] text-ink-muted tabular-nums">
                  {agg ? <Count value={agg.responses} /> : 0} answered
                </p>
              </div>

              {!submitted && (
                <div className="mt-3">
                  <QuestionInput
                    question={q}
                    value={draft[q.id]}
                    onChange={(v) => setDraft((d) => ({ ...d, [q.id]: v }))}
                  />
                  {showMissing && (
                    <p className="mt-2 text-xs font-medium text-danger-700">
                      This one is needed before you can send.
                    </p>
                  )}
                </div>
              )}

              {submitted && agg && (
                <div className="mt-3">
                  <Result agg={agg} mine={value} />
                </div>
              )}

              {submitted && !agg && (
                <p className="mt-3 text-sm text-ink-muted">Thanks. You are the first to answer this.</p>
              )}
            </Card>
          );
        })}

        {!submitted ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="md" type="submit">
              Send my answers
            </Button>
            <p className="text-[11px] text-ink-muted">
              You can change them later. No money is involved at this stage.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="md" type="button" onClick={reopen}>
              Change my answers
            </Button>
            <p className="text-[11px] text-ink-muted">Sent. Thanks for taking the time.</p>
          </div>
        )}
      </form>
    </div>
  );
}

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: SurveyQuestion;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
}) {
  const name = `q-${question.id}-input`;

  switch (question.type) {
    case 'RATING':
      return (
        <fieldset>
          <legend className="sr-only">{question.prompt}</legend>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <label
                key={n}
                className={cn(
                  'flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-semibold tabular-nums transition-colors',
                  'focus-within:ring-2 focus-within:ring-accent-500 focus-within:ring-offset-2',
                  value === n
                    ? 'border-accent-500 bg-accent-500 text-white'
                    : 'border-border bg-surface text-ink hover:border-accent-500/50 hover:bg-accent-50'
                )}
              >
                <input
                  type="radio"
                  name={name}
                  value={n}
                  checked={value === n}
                  onChange={() => onChange(n)}
                  className="sr-only"
                />
                {n}
              </label>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-ink-muted">1 is no use to me, 5 is I would use it weekly.</p>
        </fieldset>
      );

    case 'BOOLEAN':
      return (
        <fieldset>
          <legend className="sr-only">{question.prompt}</legend>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Yes', v: true },
              { label: 'No', v: false },
            ].map((opt) => (
              <label
                key={opt.label}
                className={cn(
                  'flex min-h-11 cursor-pointer items-center rounded-lg border px-4 text-sm font-medium transition-colors',
                  'focus-within:ring-2 focus-within:ring-accent-500 focus-within:ring-offset-2',
                  value === opt.v
                    ? 'border-accent-500 bg-accent-500 text-white'
                    : 'border-border bg-surface text-ink hover:border-accent-500/50 hover:bg-accent-50'
                )}
              >
                <input
                  type="radio"
                  name={name}
                  checked={value === opt.v}
                  onChange={() => onChange(opt.v)}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>
      );

    case 'SINGLE_CHOICE':
    case 'MULTI_CHOICE':
      return (
        <fieldset>
          <legend className="sr-only">{question.prompt}</legend>
          <div className="space-y-2">
            {(question.options ?? []).map((option) => (
              <label
                key={option}
                className={cn(
                  'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 text-sm transition-colors',
                  'focus-within:ring-2 focus-within:ring-accent-500 focus-within:ring-offset-2',
                  value === option
                    ? 'border-accent-500 bg-accent-50 font-medium text-ink'
                    : 'border-border bg-surface text-ink hover:border-accent-500/50 hover:bg-accent-50'
                )}
              >
                <input
                  type="radio"
                  name={name}
                  checked={value === option}
                  onChange={() => onChange(option)}
                  className="h-4 w-4 accent-[oklch(0.58_0.18_152)]"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      );

    case 'TEXT':
      return (
        <textarea
          rows={3}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="One sentence is plenty"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        />
      );

    default:
      return null;
  }
}

function Result({ agg, mine }: { agg: SurveyAggregate; mine: AnswerValue | undefined }) {
  switch (agg.type) {
    case 'RATING': {
      const max = Math.max(...agg.histogram, 1);
      return (
        <div>
          <p className="mb-2.5 text-sm text-ink">
            <span className="font-display text-xl font-bold tracking-tight text-accent-700 tabular-nums">
              {agg.average.toFixed(1)}
            </span>
            <span className="ml-1 text-[13px] text-ink-muted">out of 5 on average</span>
          </p>
          <ul className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = agg.histogram[star - 1] ?? 0;
              return (
                <li key={star} className="flex items-center gap-2.5">
                  <span className="w-10 shrink-0 text-[11px] text-ink-muted tabular-nums">{star}</span>
                  <Bar share={count / max} mine={mine === star} />
                  <span className="w-12 shrink-0 text-right text-[11px] text-ink-muted tabular-nums">
                    {count}
                    {mine === star && <span className="ml-1 font-semibold text-accent-700">you</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    case 'BOOLEAN': {
      const total = Math.max(agg.yes + agg.no, 1);
      return (
        <ul className="space-y-1.5">
          {[
            { label: 'Yes', count: agg.yes, is: mine === true },
            { label: 'No', count: agg.no, is: mine === false },
          ].map((row) => (
            <li key={row.label} className="flex items-center gap-2.5">
              <span className="w-10 shrink-0 text-[11px] text-ink-muted">{row.label}</span>
              <Bar share={row.count / total} mine={row.is} />
              <span className="w-12 shrink-0 text-right text-[11px] text-ink-muted tabular-nums">
                {row.count}
                {row.is && <span className="ml-1 font-semibold text-accent-700">you</span>}
              </span>
            </li>
          ))}
        </ul>
      );
    }

    case 'SINGLE_CHOICE':
    case 'MULTI_CHOICE': {
      const max = Math.max(...agg.tally.map((t) => t.count), 1);
      return (
        <ul className="space-y-2">
          {agg.tally.map((t) => (
            <li key={t.option}>
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className={cn('text-ink', mine === t.option && 'font-semibold text-accent-900')}>
                  {t.option}
                  {mine === t.option && (
                    <span className="ml-1.5 text-[11px] font-semibold text-accent-700">your answer</span>
                  )}
                </span>
                <span className="shrink-0 text-[11px] text-ink-muted tabular-nums">{t.count}</span>
              </div>
              <div className="mt-1">
                <Bar share={t.count / max} mine={mine === t.option} />
              </div>
            </li>
          ))}
        </ul>
      );
    }

    case 'TEXT':
      return (
        <ul className="space-y-2.5">
          {typeof mine === 'string' && mine.trim() && (
            <li className="rounded-lg border border-accent-500/30 bg-accent-50 p-2.5 text-[13px] leading-relaxed text-ink">
              {mine}
              <span className="ml-1.5 text-[11px] font-semibold text-accent-700">your answer</span>
            </li>
          )}
          {agg.samples.map((sample) => (
            <li
              key={sample}
              className="border-l-2 border-accent-500/40 pl-3 text-[13px] leading-relaxed text-ink-muted"
            >
              {sample}
            </li>
          ))}
        </ul>
      );

    default:
      return null;
  }
}

function Bar({ share, mine }: { share: number; mine?: boolean }) {
  return (
    <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
      <span
        className={cn(
          'block h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none',
          mine ? 'bg-accent-700' : 'bg-accent-500'
        )}
        style={{ width: `${clamp01(share) * 100}%` }}
      />
    </span>
  );
}

/** Folds one answer into an aggregate. Pure, so the optimistic update stays inspectable. */
function applyAnswer(agg: SurveyAggregate, value: AnswerValue | undefined): SurveyAggregate {
  if (value === undefined) return agg;
  switch (agg.type) {
    case 'RATING': {
      const rating = Number(value);
      if (!Number.isFinite(rating) || rating < 1 || rating > 5) return agg;
      const histogram = [...agg.histogram];
      histogram[rating - 1] = (histogram[rating - 1] ?? 0) + 1;
      const responses = agg.responses + 1;
      return {
        ...agg,
        responses,
        average: (agg.average * agg.responses + rating) / responses,
        histogram,
      };
    }
    case 'BOOLEAN':
      return {
        ...agg,
        responses: agg.responses + 1,
        yes: value === true ? agg.yes + 1 : agg.yes,
        no: value === false ? agg.no + 1 : agg.no,
      };
    case 'SINGLE_CHOICE':
    case 'MULTI_CHOICE':
      return {
        ...agg,
        responses: agg.responses + 1,
        tally: agg.tally.map((t) => (t.option === value ? { ...t, count: t.count + 1 } : t)),
      };
    case 'TEXT':
      return { ...agg, responses: agg.responses + 1 };
    default:
      return agg;
  }
}

/** The inverse, so re-opening the form does not leave a phantom response behind. */
function removeAnswer(agg: SurveyAggregate, value: AnswerValue | undefined): SurveyAggregate {
  if (value === undefined) return agg;
  switch (agg.type) {
    case 'RATING': {
      const rating = Number(value);
      if (!Number.isFinite(rating) || agg.responses <= 0) return agg;
      const histogram = [...agg.histogram];
      histogram[rating - 1] = Math.max(0, (histogram[rating - 1] ?? 0) - 1);
      const responses = agg.responses - 1;
      return {
        ...agg,
        responses,
        average: responses > 0 ? (agg.average * agg.responses - rating) / responses : 0,
        histogram,
      };
    }
    case 'BOOLEAN':
      return {
        ...agg,
        responses: Math.max(0, agg.responses - 1),
        yes: value === true ? Math.max(0, agg.yes - 1) : agg.yes,
        no: value === false ? Math.max(0, agg.no - 1) : agg.no,
      };
    case 'SINGLE_CHOICE':
    case 'MULTI_CHOICE':
      return {
        ...agg,
        responses: Math.max(0, agg.responses - 1),
        tally: agg.tally.map((t) =>
          t.option === value ? { ...t, count: Math.max(0, t.count - 1) } : t
        ),
      };
    case 'TEXT':
      return { ...agg, responses: Math.max(0, agg.responses - 1) };
    default:
      return agg;
  }
}
