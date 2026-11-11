"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  adminFieldClass,
  adminLinkClass,
} from "@/features/admin/components/admin-workspace-ui";
import { formatAccessDate } from "@/features/admin/lib/access-requests";
import {
  matchesScreening,
  moderationReceiptSchema,
  POLICY_LABELS,
  screenContentSchema,
  SCREENING_TIMEOUT_MS,
  type ModerationCase,
  type ScreenContent,
} from "@/features/admin/lib/moderation";
import { sendJson } from "@/lib/api/client";

type ScreeningState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "complete"; screening: ModerationCase; input: ScreenContent }
  | { status: "failed"; message: string; next: "retry" | "new" | "reload" };

export function ModerationScreening({ actorId }: { actorId: string }) {
  const [draft, setDraft] = useState<ScreenContent>({
    kind: "idea",
    title: "",
    text: "",
  });
  const [state, setState] = useState<ScreeningState>({ status: "idle" });
  const busyRef = useRef(false);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const id = useId();
  const busy = state.status === "pending";
  const locked = busy || (state.status === "failed" && state.next !== "retry");
  const changed =
    state.status === "complete" &&
    (draft.kind !== state.input.kind ||
      draft.text.trim() !== state.input.text ||
      (draft.title?.trim() ?? "") !== (state.input.title ?? ""));

  useEffect(() => {
    if (state.status === "complete" || state.status === "failed")
      feedbackRef.current?.focus();
  }, [state]);

  async function handleScreen() {
    if (busyRef.current || locked) return;
    const parsed = screenContentSchema.safeParse(draft);
    if (!parsed.success) {
      setState({
        status: "failed",
        message:
          parsed.error.issues[0]?.message ?? "Check the screening fields.",
        next: "retry",
      });
      return;
    }
    busyRef.current = true;
    setState({ status: "pending" });
    try {
      const response = await sendJson<unknown>("/api/admin/moderation/screen", {
        method: "POST",
        body: parsed.data,
        timeoutMs: SCREENING_TIMEOUT_MS + 5_000,
      });
      if (!response.ok) {
        setState({
          status: "failed",
          message: response.message,
          next:
            response.status === 0 || response.status >= 500
              ? "new"
              : [401, 403, 404, 409].includes(response.status)
                ? "reload"
                : "retry",
        });
        return;
      }
      const receipt = moderationReceiptSchema.safeParse(response.data);
      if (
        !receipt.success ||
        !matchesScreening(receipt.data.screening, parsed.data, actorId)
      ) {
        setState({
          status: "failed",
          message:
            "The service did not return a valid confirmation for this screening.",
          next: "new",
        });
        return;
      }
      setState({
        status: "complete",
        screening: receipt.data.screening,
        input: parsed.data,
      });
    } catch {
      setState({
        status: "failed",
        message: "The screening could not be confirmed.",
        next: "new",
      });
    } finally {
      busyRef.current = false;
    }
  }

  return (
    <div className="mt-6 grid items-start gap-6 xl:grid-cols-2">
      <form
        aria-label="Screen content"
        aria-busy={busy}
        aria-describedby={state.status === "failed" ? `${id}-error` : undefined}
        noValidate
        className="min-w-0 rounded-xl border border-border bg-surface p-5 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void handleScreen();
        }}
      >
        <fieldset disabled={locked} className="min-w-0 space-y-5">
          <legend className="mb-5 text-lg font-semibold text-ink">
            Content to review
          </legend>
          <div>
            <label
              htmlFor={`${id}-kind`}
              className="text-sm font-medium text-ink"
            >
              Content type
            </label>
            <select
              id={`${id}-kind`}
              value={draft.kind}
              className={`mt-2 ${adminFieldClass}`}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  kind: event.target.value === "campaign" ? "campaign" : "idea",
                })
              }
            >
              <option value="idea">Idea</option>
              <option value="campaign">Campaign</option>
            </select>
          </div>
          <div>
            <label
              htmlFor={`${id}-title`}
              className="text-sm font-medium text-ink"
            >
              Title (optional)
            </label>
            <input
              id={`${id}-title`}
              value={draft.title ?? ""}
              maxLength={200}
              className={`mt-2 ${adminFieldClass}`}
              onChange={(event) =>
                setDraft({ ...draft, title: event.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor={`${id}-text`}
              className="text-sm font-medium text-ink"
            >
              Text to screen
            </label>
            <textarea
              ref={textRef}
              id={`${id}-text`}
              value={draft.text}
              required
              maxLength={20_000}
              rows={10}
              aria-describedby={`${id}-text-help`}
              className={`mt-2 resize-y py-3 leading-6 ${adminFieldClass}`}
              onChange={(event) =>
                setDraft({ ...draft, text: event.target.value })
              }
            />
            <p
              id={`${id}-text-help`}
              className="mt-2 text-xs leading-5 text-ink-soft"
            >
              Paste the idea or campaign text. Up to 20,000 characters.
            </p>
          </div>
          <p className="text-sm leading-6 text-ink-soft">
            Each run saves an advisory case under your administrator account.
            Account checks apply to you; review the creator&apos;s verification
            separately.
          </p>
          <Button
            type="submit"
            className="w-full cursor-pointer bg-brand-strong hover:bg-contrast focus-visible:outline-brand-strong sm:w-auto"
          >
            {busy ? "Screening content..." : "Run screening"}
          </Button>
        </fieldset>
      </form>

      <div ref={feedbackRef} tabIndex={-1} className="min-w-0 outline-none">
        {state.status === "idle" ? (
          <section
            className="rounded-xl border border-border bg-surface p-5 sm:p-6"
            aria-label="Screening result"
          >
            <h2 className="text-lg font-semibold text-ink">Ready to screen</h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              Results will include policy findings and a review explanation.
              Campaign approval remains a separate review.
            </p>
          </section>
        ) : state.status === "pending" ? (
          <div
            role="status"
            className="rounded-xl border border-border bg-surface p-5 text-sm leading-6 text-ink-soft sm:p-6"
          >
            Screening is in progress. Your results will appear here when the
            service confirms them.
          </div>
        ) : state.status === "failed" ? (
          <section className="rounded-xl border border-danger/25 bg-surface p-5 sm:p-6">
            <div id={`${id}-error`} role="alert">
              <h2 className="text-lg font-semibold text-ink">
                Screening unavailable
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink [overflow-wrap:anywhere]">
                {state.message}
              </p>
              {state.next === "new" ? (
                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  A case may already exist for this attempt. Start another
                  screening only if you want to create a new case.
                </p>
              ) : null}
            </div>
            {state.next === "new" ? (
              <Button
                type="button"
                variant="outline"
                className="mt-4 cursor-pointer focus-visible:outline-brand-strong"
                onClick={() => {
                  setState({ status: "idle" });
                  requestAnimationFrame(() => textRef.current?.focus());
                }}
              >
                Start another screening
              </Button>
            ) : state.next === "reload" ? (
              <a href="/admin/moderation" className={`mt-4 ${adminLinkClass}`}>
                Reload moderation
              </a>
            ) : null}
          </section>
        ) : (
          <ModerationResult
            screening={state.screening}
            input={state.input}
            changed={changed}
          />
        )}
      </div>
    </div>
  );
}

function ModerationResult({
  screening,
  input,
  changed,
}: {
  screening: ModerationCase;
  input: ScreenContent;
  changed: boolean;
}) {
  const held = screening.decision === "HELD_FOR_REVIEW";
  return (
    <section
      aria-label="Screening result"
      className="rounded-xl border border-border bg-surface p-5 sm:p-6"
    >
      <h2 className="text-lg font-semibold text-ink">Screening result</h2>
      <p
        role="status"
        className={`mt-3 inline-flex rounded-md px-3 py-1.5 text-sm font-semibold ${held ? "bg-warning/10 text-warning-strong" : "bg-brand-soft text-brand-strong"}`}
      >
        {held ? "Held for review" : "No flags raised"}
      </p>
      <p className="mt-3 text-sm leading-6 text-ink-soft [overflow-wrap:anywhere]">
        {input.kind === "idea" ? "Idea" : "Campaign"}
        {input.title ? `: ${input.title}` : ""}. Screened{" "}
        {formatAccessDate(screening.createdAt)}.
      </p>
      {changed ? (
        <p className="mt-3 rounded-lg bg-warning/10 p-3 text-sm leading-6 text-warning-strong">
          The content has changed since this screening. Run it again for an
          updated result.
        </p>
      ) : null}
      {screening.provider === "stub" ? (
        <p className="mt-3 rounded-lg bg-warning/10 p-3 text-sm leading-6 text-warning-strong">
          This result used the test classifier. Review the text manually before
          making a decision.
        </p>
      ) : null}
      <div className="mt-5 border-t border-border pt-5">
        <h3 className="text-sm font-semibold text-ink">Internal findings</h3>
        <p className="mt-2 text-xs leading-5 text-ink-soft">
          Highest risk score:{" "}
          <span className="font-mono tabular-nums text-ink">
            {screening.maxRisk.toFixed(4)} / 1
          </span>
          . Scores are review signals, not probabilities.
        </p>
        {screening.categories.length ? (
          <ul className="mt-3 divide-y divide-border">
            {screening.categories.map((finding, index) => (
              <li
                key={`${finding.code}-${index}`}
                className="py-3 text-sm leading-6 [overflow-wrap:anywhere]"
              >
                <p className="font-semibold text-ink">
                  {POLICY_LABELS[finding.code]}{" "}
                  <span className="font-mono text-xs font-normal text-ink-soft">
                    ({finding.riskScore.toFixed(4)})
                  </span>
                </p>
                {finding.excerpt ? (
                  <blockquote className="mt-2 border-s-2 border-border ps-3 text-ink-soft">
                    {finding.excerpt}
                  </blockquote>
                ) : null}
                <p className="mt-2 text-ink-soft">{finding.draftReason}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            No category findings were returned.
          </p>
        )}
        {screening.reasonCodes.length ? (
          <p className="mt-3 text-xs leading-5 text-ink-soft [overflow-wrap:anywhere]">
            Reason codes: {screening.reasonCodes.join(", ")}
          </p>
        ) : null}
        <details className="mt-3 text-sm leading-6 text-ink-soft">
          <summary className="min-h-11 cursor-pointer rounded-md py-2 font-semibold text-ink focus-visible:outline-2 focus-visible:outline-brand-strong">
            Review brief and internal rationale
          </summary>
          <p className="mt-2 whitespace-pre-wrap [overflow-wrap:anywhere]">
            {screening.brief}
          </p>
          <p className="mt-3 whitespace-pre-wrap [overflow-wrap:anywhere]">
            {screening.internalReason}
          </p>
        </details>
      </div>
      <div className="mt-5 border-t border-border pt-5">
        <h3 className="text-sm font-semibold text-ink">
          Creator-facing explanation
        </h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-soft [overflow-wrap:anywhere]">
          {screening.externalReason ||
            "No creator-facing explanation was returned."}
        </p>
        <p className="mt-2 text-xs leading-5 text-ink-soft">
          Returned by the screening service. This tool does not send a message
          to the creator.
        </p>
      </div>
      <dl className="mt-5 space-y-2 border-t border-border pt-5 text-xs leading-5 text-ink-soft [overflow-wrap:anywhere]">
        <div>
          <dt className="inline font-semibold">Case: </dt>
          <dd className="inline">{screening.id}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Classifier: </dt>
          <dd className="inline">{screening.provider}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Policy version: </dt>
          <dd className="inline">{screening.policyVersion}</dd>
        </div>
      </dl>
    </section>
  );
}
