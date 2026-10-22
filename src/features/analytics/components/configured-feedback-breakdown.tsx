import { HugeiconsIcon } from "@hugeicons/react";
import { Comment01Icon, QuoteDownIcon } from "@hugeicons/core-free-icons";

import { summariseFeedback } from "@/features/analytics/lib/feedback-summary";
import type { FeedbackAnswers, FeedbackForm } from "@/features/feedback/types";

/**
 * Feedback analytics derived from the creator's actual form configuration.
 *
 * A rating average appears only when a rating question exists. Choice and text
 * questions get their own views instead of being collapsed into a score. No
 * respondent identity is exposed.
 */
export function ConfiguredFeedbackBreakdown({
  form,
  submissions,
}: {
  form: FeedbackForm | undefined;
  submissions: readonly { answers: FeedbackAnswers; formVersion: number }[];
}) {
  const summary = summariseFeedback(form, submissions);

  return (
    <section
      aria-labelledby="feedback-insights"
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="feedback-insights" className="text-sm font-bold text-ink">
            Feedback
          </h2>
          <p className="mt-0.5 text-xs leading-5 text-muted">
            Answers to the questions this creator published, grouped without
            exposing who said what.
          </p>
        </div>
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-strong">
          <HugeiconsIcon
            icon={Comment01Icon}
            size={16}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
      </div>

      {!summary.configured ? (
        <p className="mt-3 rounded-lg bg-canvas px-3 py-4 text-xs leading-5 text-muted">
          This idea has no feedback form configured. Feedback analytics stay
          empty rather than showing a rating nobody was asked for.
        </p>
      ) : summary.responseCount === 0 ? (
        <p className="mt-3 rounded-lg bg-canvas px-3 py-4 text-xs leading-5 text-muted">
          The form is live but has no responses yet. Figures appear after the
          first submission.
        </p>
      ) : (
        <div className="mt-3 space-y-5">
          <p className="text-xs text-muted">
            {summary.responseCount.toLocaleString("en-US")} response
            {summary.responseCount === 1 ? "" : "s"} on form version{" "}
            {form?.version}.
          </p>

          {summary.hasRating && summary.ratingAverage !== null ? (
            <div className="rounded-xl bg-canvas p-3">
              <div className="flex items-baseline gap-1.5">
                <p className="text-2xl font-bold tabular-nums text-ink">
                  {summary.ratingAverage.toFixed(1)}
                </p>
                <p className="text-xs text-muted">/ 5 overall rating</p>
              </div>
              <p className="mt-0.5 text-[0.6875rem] text-muted">
                {summary.ratingCount} ratings. Only the configured rating
                question contributes.
              </p>
            </div>
          ) : (
            <p className="rounded-xl bg-canvas px-3 py-2 text-[0.6875rem] leading-4 text-muted">
              No overall rating question is configured. Choice and written
              answers are shown below instead.
            </p>
          )}

          {summary.questions.map((question) => {
            if (question.answered === 0) return null;

            if (question.tallies.length > 0) {
              return (
                <div key={question.question.id}>
                  <h3 className="text-xs font-semibold text-ink">
                    {question.question.label}
                  </h3>
                  <p className="mt-0.5 text-[0.6875rem] text-muted">
                    {question.answered} answered
                  </p>
                  <ul className="mt-2 space-y-2">
                    {question.tallies.map((tally) => (
                      <li key={tally.label}>
                        <div className="flex items-baseline justify-between gap-3 text-[0.6875rem]">
                          <span className="text-ink-soft">{tally.label}</span>
                          <span className="tabular-nums text-muted">
                            {tally.count} · {Math.round(tally.share * 100)}%
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink/[0.06]">
                          <div
                            className="h-full rounded-full bg-brand"
                            style={{
                              width: `${Math.round(tally.share * 100)}%`,
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }

            if (question.textAnswers.length > 0) {
              return (
                <div key={question.question.id}>
                  <h3 className="text-xs font-semibold text-ink">
                    {question.question.label}
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {question.textAnswers.slice(0, 4).map((answer) => (
                      <li
                        key={answer}
                        className="flex gap-2 rounded-lg bg-canvas p-2.5 text-[0.6875rem] leading-5 text-ink-soft"
                      >
                        <HugeiconsIcon
                          icon={QuoteDownIcon}
                          size={13}
                          strokeWidth={1.8}
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-muted"
                        />
                        {answer}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1 text-[0.625rem] text-muted">
                    Written answers are shown as submitted. They are not scored.
                  </p>
                </div>
              );
            }

            if (question.ratingAverage !== null) {
              return (
                <div key={question.question.id}>
                  <h3 className="text-xs font-semibold text-ink">
                    {question.question.label}
                  </h3>
                  <p className="mt-1 text-xs tabular-nums text-muted">
                    {question.ratingAverage.toFixed(1)} average across{" "}
                    {question.answered} answers
                  </p>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
    </section>
  );
}
