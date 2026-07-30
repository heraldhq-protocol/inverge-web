import { Card } from '@/components/ui/card';
import { Count } from '@/components/ui/amount';
import { EmptyState } from '@/components/ui/empty-state';
import { clamp01 } from '@/lib/format';
import type { SurveyAggregate, SurveyQuestion } from '@/lib/ideas/types';

/**
 * What supporters actually said.
 *
 * The reference has a comment thread and calls it feedback. Ours is a creator-authored typed survey
 * plus a separate thread, and they render differently on purpose: aggregates answer "do people want
 * this", the thread answers "what would you change".
 *
 * Bars rather than a chart library: five numbers do not justify a runtime, and a bar with its count
 * beside it is more legible than a pie (app-mockup-kit §3.6 — remove any graphic that is not carrying
 * information).
 */
export function SurveyResults({
  questions,
  aggregates,
}: {
  questions: SurveyQuestion[];
  aggregates: SurveyAggregate[];
}) {
  if (questions.length === 0) {
    return <EmptyState title="The creator has not added questions yet." />;
  }

  const byId = new Map(aggregates.map((a) => [a.questionId, a]));

  return (
    <div className="space-y-4">
      {questions.map((q) => {
        const agg = byId.get(q.id);
        return (
          <Card key={q.id} className="p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">{q.prompt}</h3>
              <p className="text-xs text-ink-muted tabular-nums">
                {agg ? <Count value={agg.responses} /> : 0} responses
              </p>
            </div>
            <div className="mt-4">{agg ? <Aggregate agg={agg} /> : <NoResponses />}</div>
          </Card>
        );
      })}
    </div>
  );
}

function NoResponses() {
  return <p className="text-sm text-ink-muted">No responses to this question yet.</p>;
}

function Aggregate({ agg }: { agg: SurveyAggregate }) {
  switch (agg.type) {
    case 'RATING': {
      const max = Math.max(...agg.histogram, 1);
      return (
        <div>
          <p className="mb-3 text-sm text-ink">
            <span className="font-display text-2xl font-bold tracking-tight text-accent-700 tabular-nums">
              {agg.average.toFixed(1)}
            </span>
            <span className="ml-1 text-ink-muted">out of 5 on average</span>
          </p>
          <ul className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = agg.histogram[star - 1] ?? 0;
              return (
                <li key={star} className="flex items-center gap-3">
                  <span className="w-10 shrink-0 text-xs text-ink-muted tabular-nums">
                    {star} star
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
                    <span
                      className="block h-full rounded-full bg-accent-500"
                      style={{ width: `${clamp01(count / max) * 100}%` }}
                    />
                  </span>
                  <span className="w-6 shrink-0 text-right text-xs text-ink-muted tabular-nums">
                    {count}
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
        <div className="flex gap-6">
          <Split label="Yes" value={agg.yes} share={agg.yes / total} tone="accent" />
          <Split label="No" value={agg.no} share={agg.no / total} tone="neutral" />
        </div>
      );
    }

    case 'SINGLE_CHOICE':
    case 'MULTI_CHOICE': {
      const max = Math.max(...agg.tally.map((t) => t.count), 1);
      return (
        <ul className="space-y-2">
          {agg.tally.map((t) => (
            <li key={t.option}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-ink">{t.option}</span>
                <span className="shrink-0 text-xs text-ink-muted tabular-nums">{t.count}</span>
              </div>
              <span className="mt-1 block h-2 overflow-hidden rounded-full bg-ink/10">
                <span
                  className="block h-full rounded-full bg-accent-500"
                  style={{ width: `${clamp01(t.count / max) * 100}%` }}
                />
              </span>
            </li>
          ))}
        </ul>
      );
    }

    case 'TEXT':
      return (
        <ul className="space-y-3">
          {agg.samples.map((sample) => (
            <li
              key={sample}
              className="border-l-2 border-accent-500/40 pl-3 text-sm leading-relaxed text-ink-muted"
            >
              {sample}
            </li>
          ))}
        </ul>
      );

    default:
      return <NoResponses />;
  }
}

function Split({
  label,
  value,
  share,
  tone,
}: {
  label: string;
  value: number;
  share: number;
  tone: 'accent' | 'neutral';
}) {
  return (
    <div className="flex-1">
      <p className="font-display text-xl font-bold tracking-tight text-ink tabular-nums">{value}</p>
      <p className="text-xs text-ink-muted">{label}</p>
      <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-ink/10">
        <span
          className={`block h-full rounded-full ${tone === 'accent' ? 'bg-accent-500' : 'bg-ink/40'}`}
          style={{ width: `${clamp01(share) * 100}%` }}
        />
      </span>
    </div>
  );
}
