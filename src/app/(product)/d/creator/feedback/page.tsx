import type { Metadata } from "next";
import Link from "next/link";

import { MessageMultiple01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { SubmissionSummary } from "@/features/feedback/components/submission-summary";
import { getFeedbackInboxView } from "@/features/feedback/server/inbox";
import { CreatorStudioTabs } from "@/features/ideas/components/creator-studio-tabs";
import { StatePanel } from "@/components/ui/state-panel";

export const metadata: Metadata = {
  title: "Feedback",
  description:
    "Every structured response your ideas have collected, newest first.",
};

/**
 * The cross-idea feedback inbox (D-017).
 *
 * Read-only: this client has no reply surface, so reply state is not claimed
 * anywhere on the page. Responses stay anonymous — a card carries the form it
 * answered and when it arrived, never a sender — and each group links to the
 * idea's feedback setup rather than implying conversation.
 */
export default async function FeedbackInboxPage() {
  const result = await getFeedbackInboxView();
  const { groups, totalResponses } =
    result.status === "ready"
      ? result.view
      : { groups: [], totalResponses: 0 };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      <div>
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
          Creator Studio
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
          Feedback
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
          Every response your ideas have collected, grouped by idea and newest
          first.
        </p>
      </div>

      <div className="mt-5">
        <CreatorStudioTabs active="feedback" />
      </div>

      {result.status !== "ready" ? (
        <div className="mt-6">
          <StatePanel
            variant="unavailable"
            eyebrow="Creator feedback"
            title={
              result.status === "signed_out"
                ? "Sign in to read your feedback"
                : "Feedback is unavailable"
            }
            description={
              result.status === "signed_out"
                ? "Sign in to read responses to your ideas."
                : result.reason
            }
          />
        </div>
      ) : groups.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border-strong bg-surface px-5 py-10 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-full bg-brand-soft text-brand-strong">
            <HugeiconsIcon
              icon={MessageMultiple01Icon}
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>
          <p className="mt-3 text-base font-bold text-ink">No responses yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted">
            Responses arrive when people answer a feedback form on one of your
            ideas. Configure a form from your ideas list to start collecting
            them.
          </p>
          <div className="mt-4 flex justify-center">
            <Link
              href="/d/creator/ideas"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-strong px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-strong/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
            >
              Go to my ideas
            </Link>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-5 max-w-3xl text-xs leading-5 text-muted">
            {totalResponses} {totalResponses === 1 ? "response" : "responses"}{" "}
            across {groups.length} {groups.length === 1 ? "idea" : "ideas"}.
            Responses are anonymous: none carries the identity or contact
            details of whoever sent it.
          </p>

          <div className="mt-4 space-y-7">
            {groups.map((group) => (
              <section
                key={group.ideaId}
                aria-labelledby={`inbox-${group.ideaId}`}
              >
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2
                      id={`inbox-${group.ideaId}`}
                      className="text-base font-bold tracking-[-0.02em] text-ink"
                    >
                      <Link
                        href={group.workspaceHref}
                        className="hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
                      >
                        {group.ideaTitle}
                      </Link>
                    </h2>
                    <p className="mt-0.5 text-xs text-muted">
                      {group.entries.length}{" "}
                      {group.entries.length === 1 ? "response" : "responses"}
                    </p>
                  </div>
                  {group.setupHref ? (
                    <Link
                      href={group.setupHref}
                      className="text-sm font-semibold text-brand-strong hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
                    >
                      Feedback setup
                    </Link>
                  ) : null}
                </div>

                <ul className="mt-3 grid gap-3">
                  {group.entries.map((entry) => (
                    <li key={entry.submittedAt}>
                      <SubmissionSummary
                        submittedAt={entry.submittedAt}
                        answers={entry.answers}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}

      <p className="mt-6 max-w-3xl text-xs leading-5 text-muted">
        Preview workspace. Responses come from fixtures. Replying is not part of
        this preview: it arrives with the feedback API, together with reply
        state on each response.
      </p>
    </div>
  );
}
