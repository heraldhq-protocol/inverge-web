import { HugeiconsIcon } from "@hugeicons/react";
import { Comment01Icon, QuoteDownIcon } from "@hugeicons/core-free-icons";

import type { AnalyticsFeedbackView } from "@/features/analytics/lib/types";

/**
 * Feedback analytics in the shape both the live and preview surfaces share.
 *
 * The live API returns aggregate counts, so this component never renders an
 * empty quote list as if nobody wrote anything. When written answers are not in
 * the payload it says so. No respondent identity is exposed in either mode.
 */
export function FeedbackBreakdown({
  feedback,
  formVersion,
}: {
  feedback: AnalyticsFeedbackView;
  formVersion?: number | undefined;
}) {
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

      {!feedback.configured ? (
        <p className="mt-3 rounded-lg bg-canvas px-3 py-4 text-xs leading-5 text-muted">
          This idea has no feedback form configured. Feedback analytics stay
          empty rather than showing a rating nobody was asked for.
        </p>
      ) : feedback.responseCount === 0 ? (
        <p className="mt-3 rounded-lg bg-canvas px-3 py-4 text-xs leading-5 text-muted">
          The form is live but has no responses yet. Figures appear after the
          first submission.
        </p>
      ) : (
        <div className="mt-3 space-y-5">
          <p className="text-xs text-muted">
            {feedback.responseCount.toLocaleString("en-US")} response
            {feedback.responseCount === 1 ? "" : "s"}
            {formVersion !== undefined ? ` on form version ${formVersion}` : ""}
            .
          </p>

          {feedback.ratingAverage !== null ? (
            <div className="rounded-xl bg-canvas p-3">
              <div className="flex items-baseline gap-1.5">
                <p className="text-2xl font-bold tabular-nums text-ink">
                  {feedback.ratingAverage.toFixed(1)}
                </p>
                <p className="text-xs text-muted">/ 5 overall rating</p>
              </div>
              <p className="mt-0.5 text-[0.6875rem] text-muted">
                {feedback.ratingCount} rating
                {feedback.ratingCount === 1 ? "" : "s"}. Only configured rating
                questions contribute.
              </p>
            </div>
          ) : (
            <p className="rounded-xl bg-canvas px-3 py-2 text-[0.6875rem] leading-4 text-muted">
              No overall rating question is configured. Choice answers are shown
              below; written text is only shown where the report includes it.
            </p>
          )}

          {feedback.questions.map((question) => {
            if (question.answered === 0) return null;

            if (question.tallies.length > 0) {
              return (
                <div key={question.id}>
                  <h3 className="text-xs font-semibold text-ink">
                    {question.prompt}
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
                            {tally.count} - {Math.round(tally.share * 100)}%
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
                <div key={question.id}>
                  <h3 className="text-xs font-semibold text-ink">
                    {question.prompt}
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

            if (question.average !== null) {
              return (
                <div key={question.id}>
                  <h3 className="text-xs font-semibold text-ink">
                    {question.prompt}
                  </h3>
                  <p className="mt-1 text-xs tabular-nums text-muted">
                    {question.average.toFixed(1)} average across{" "}
                    {question.answered} answers
                  </p>
                  {question.distribution.length > 0 ? (
                    <ul className="mt-2 space-y-1.5">
                      {question.distribution.map((entry) => {
                        const share =
                          question.answered > 0
                            ? entry.count / question.answered
                            : 0;
                        return (
                          <li
                            key={entry.rating}
                            className="flex items-center gap-2 text-[0.6875rem] text-muted"
                          >
                            <span className="w-3 tabular-nums text-ink-soft">
                              {entry.rating}
                            </span>
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/[0.06]">
                              <div
                                className="h-full rounded-full bg-brand"
                                style={{ width: `${Math.round(share * 100)}%` }}
                              />
                            </div>
                            <span className="w-8 text-right tabular-nums">
                              {entry.count}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              );
            }

            return (
              <div key={question.id}>
                <h3 className="text-xs font-semibold text-ink">
                  {question.prompt}
                </h3>
                <p className="mt-1 text-xs text-muted">
                  {question.answered} answered. This question has no aggregate
                  value to chart.
                </p>
              </div>
            );
          })}

          {!feedback.textAnswersAvailable ? (
            <p className="text-[0.625rem] leading-4 text-muted">
              This report includes aggregate counts. Written answers are not
              included in the creator analytics response.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
