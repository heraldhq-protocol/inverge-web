import type { DescribedAnswer } from "@/features/feedback/lib/submissions";

function responseDate(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * One submitted response, rendered for a creator reading rather than a form.
 *
 * The same card appears in the feedback inbox and on an idea's workspace, so a
 * response cannot look different in two places. Respondents are never named:
 * the card shows when it arrived, not who sent it.
 */
export function SubmissionSummary({
  submittedAt,
  answers,
}: {
  submittedAt: string;
  answers: readonly DescribedAnswer[];
}) {
  const date = responseDate(submittedAt);

  return (
    <div className="rounded-2xl border border-border bg-surface p-3 sm:p-4">
      {date ? (
        <p className="text-xs text-muted">
          Submitted <time dateTime={submittedAt}>{date}</time>
        </p>
      ) : null}
      <dl className="mt-2 space-y-2.5">
        {answers.map(({ question, answer }) => (
          <div key={question}>
            <dt className="text-xs font-semibold text-ink">{question}</dt>
            <dd className="mt-0.5 text-sm leading-6 text-muted">{answer}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
