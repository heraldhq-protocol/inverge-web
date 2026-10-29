"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Copy01Icon,
  FavouriteIcon,
  MessageMultiple01Icon,
  Share01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FeedbackDialog } from "@/features/feedback/components/feedback-dialog";
import {
  atomicToWholeInput,
  formatMoney,
  parseUsdAmount,
  type MoneyAmount,
} from "@/lib/money";
import {
  emptySignals,
  setPrePledge,
  toggleSupport,
  withdrawPrePledge,
  type IdeaSignals,
} from "@/features/ideas/lib/signals";
import {
  useIdeaViewer,
  type IdeaViewer,
} from "@/features/ideas/components/idea-viewer";
import type { IdeaDetail } from "@/features/ideas/types";

function PreviewNote() {
  return (
    <span
      className="text-[0.625rem] font-medium uppercase tracking-[0.1em] text-muted"
      title="Preview only. Nothing is saved to an account yet."
    >
      Preview
    </span>
  );
}

function SignInGate({ action }: { action: string }) {
  return (
    <p className="text-sm leading-6 text-muted">
      <Link
        href="/auth"
        className="font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Sign in
      </Link>{" "}
      or{" "}
      <Link
        href="/auth"
        className="font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        create an account
      </Link>{" "}
      to {action}.
    </p>
  );
}

function SupportAction({
  onToggle,
  signals,
  viewer,
}: {
  onToggle: () => void;
  signals: IdeaSignals;
  viewer: IdeaViewer;
}) {
  const supported = signals.supported;

  return (
    <div className="rounded-xl bg-brand-soft p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-ink">Support this idea</h2>
        {viewer === "signed-in" ? <PreviewNote /> : null}
      </div>
      <p className="mt-1 text-xs leading-5 text-muted">
        Let the creator know you would like to see this move forward. Supporting
        is not a financial contribution.
      </p>

      {viewer === "visitor" ? (
        <div className="mt-3">
          <SignInGate action="support this idea" />
        </div>
      ) : (
        <Button
          type="button"
          variant={supported ? "secondary" : "primary"}
          size="md"
          className={`mt-3 w-full ${
            supported
              ? "border-brand/30 bg-surface text-brand-strong hover:bg-surface"
              : ""
          }`}
          aria-pressed={supported}
          onClick={onToggle}
        >
          {supported ? (
            <>
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                size={16}
                strokeWidth={2.2}
                aria-hidden="true"
              />
              <span className="ml-2">Supported</span>
            </>
          ) : (
            <>
              <HugeiconsIcon
                icon={FavouriteIcon}
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <span className="ml-2">Support idea</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}

/**
 * The feedback entry point. It is rendered only when the creator enabled a form
 * with at least one question, so an idea that does not ask for feedback has no
 * empty card here.
 */
function FeedbackEntry({
  enabled,
  onOpen,
  questionCount,
  viewer,
}: {
  enabled: boolean;
  onOpen: () => void;
  questionCount: number;
  viewer: IdeaViewer;
}) {
  if (!enabled) return null;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-ink">Give feedback</h2>
        {viewer === "signed-in" ? <PreviewNote /> : null}
      </div>
      <p className="mt-1 text-xs leading-5 text-muted">
        The creator asks {questionCount}{" "}
        {questionCount === 1 ? "question" : "questions"}. Your answers are
        private and are not posted as a public comment.
      </p>
      <Button
        type="button"
        variant="outline"
        size="md"
        className="mt-3 w-full"
        onClick={onOpen}
      >
        <HugeiconsIcon
          icon={MessageMultiple01Icon}
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
        />
        Give feedback
      </Button>
    </div>
  );
}

function PrePledgeAction({
  onSave,
  onWithdraw,
  signals,
  viewer,
}: {
  onSave: (amount: MoneyAmount) => string | null;
  onWithdraw: () => void;
  signals: IdeaSignals;
  viewer: IdeaViewer;
}) {
  const existing = signals.prePledge;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(
    existing ? atomicToWholeInput(existing.amount) : "",
  );
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<"confirmed" | "withdrawn" | null>(null);

  function beginEdit() {
    setDraft(existing ? atomicToWholeInput(existing.amount) : "");
    setAcknowledged(false);
    setError(null);
    setNotice(null);
    setEditing(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const atomic = parseUsdAmount(draft);
    if (!atomic) {
      setError("Enter a positive amount, e.g. 500.");
      return;
    }
    if (!acknowledged) {
      setError("Confirm that you understand this is non-binding.");
      return;
    }
    const failure = onSave({ atomic, currency: "USD", decimals: 2 });
    if (failure) {
      setError(failure);
      return;
    }
    setEditing(false);
    setNotice("confirmed");
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-ink">
          Express funding interest
        </h2>
        {viewer === "signed-in" ? <PreviewNote /> : null}
      </div>
      <p className="mt-1 text-xs leading-5 text-muted">
        Tell the creator how much you might consider contributing if this idea
        becomes a campaign. A pre-pledge is non-binding. No funds move.
      </p>

      {viewer === "visitor" ? (
        <div className="mt-3">
          <SignInGate action="record a pre-pledge" />
        </div>
      ) : existing && !editing ? (
        <div className="mt-3">
          <p className="text-sm text-ink" aria-live="polite">
            Your intent:{" "}
            <span className="font-semibold tabular-nums">
              {formatMoney(existing.amount)}
            </span>
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            No funds have moved and you are not committed. You can edit or
            withdraw your intent at any time.
          </p>
          {notice === "withdrawn" ? (
            <p
              className="mt-1 text-xs font-medium text-brand-strong"
              role="status"
            >
              Intent withdrawn.
            </p>
          ) : null}
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={beginEdit}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                onWithdraw();
                setDraft("");
                setAcknowledged(false);
                setEditing(false);
                setNotice("withdrawn");
              }}
            >
              Withdraw
            </Button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-3 space-y-3"
          aria-label="Pre-pledge form"
        >
          <Field
            label="Indicative amount (USD)"
            help="How much you might consider contributing if this idea becomes a campaign."
          >
            {({ id, invalid, describedBy }) => (
              <div className="relative">
                <span
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted"
                  aria-hidden="true"
                >
                  $
                </span>
                <input
                  id={id}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={draft}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  placeholder="500"
                  onChange={(event) => {
                    setDraft(event.target.value);
                    setNotice(null);
                  }}
                  className="min-h-11 w-full rounded-lg border border-border bg-surface pl-7 pr-3 text-[0.9375rem] tabular-nums text-ink outline-none transition placeholder:text-muted/55 hover:border-muted/45 focus:border-brand focus:ring-3 focus:ring-brand/12"
                />
              </div>
            )}
          </Field>

          <label className="flex items-start gap-2.5 text-xs leading-5 text-muted">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border-border accent-brand"
            />
            <span>
              I understand this is a non-binding expression of interest, not a
              contribution. No funds move.
            </span>
          </label>

          {error ? (
            <p className="text-xs font-medium text-danger" role="alert">
              {error}
            </p>
          ) : null}

          {notice === "confirmed" ? (
            <p className="text-xs font-medium text-brand-strong" role="status">
              Intent recorded. No funds moved.
            </p>
          ) : null}

          <Button type="submit" size="md" className="w-full">
            {existing ? "Update intent" : "Record intent"}
          </Button>
        </form>
      )}
    </div>
  );
}

function ShareAction({ ideaTitle }: { ideaTitle?: string | undefined }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  function shareToX() {
    const intent = new URL("https://twitter.com/intent/tweet");
    intent.searchParams.set("url", window.location.href);
    if (ideaTitle) intent.searchParams.set("text", ideaTitle);
    window.open(intent.toString(), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Button type="button" variant="ghost" size="sm" onClick={copyLink}>
        {status === "copied" ? (
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            size={16}
            strokeWidth={2}
            aria-hidden="true"
            className="text-brand-strong"
          />
        ) : (
          <HugeiconsIcon
            icon={Copy01Icon}
            size={16}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        )}
        {status === "copied" ? "Copied" : "Copy link"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={shareToX}>
        <HugeiconsIcon
          icon={Share01Icon}
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
        />
        Share
      </Button>
      <span className="sr-only" aria-live="polite">
        {status === "error" ? "Could not copy the link." : ""}
      </span>
    </div>
  );
}

/**
 * Participation actions for one idea.
 *
 * The set is driven by the creator's configuration: feedback appears only when a
 * form is enabled, and funding interest only when the creator asked for it.
 * Support stays available because it is the cheapest validation signal (FR-202)
 * and is not the same thing as a contribution.
 */
export function IdeaActions({
  idea,
  viewer: viewerProp,
}: {
  idea: IdeaDetail;
  viewer?: IdeaViewer;
}) {
  const { viewer: contextViewer } = useIdeaViewer();
  const viewer = viewerProp ?? contextViewer;
  const [signals, setSignals] = useState<IdeaSignals>(emptySignals);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const form = idea.feedbackForm;
  const feedbackEnabled = Boolean(form?.enabled && form.questions.length > 0);
  const fundingEnabled = Boolean(idea.goals?.funding);

  return (
    <>
      <div className="rounded-2xl border border-border bg-surface p-4">
        <SupportAction
          signals={signals}
          viewer={viewer}
          onToggle={() => setSignals((current) => toggleSupport(current))}
        />

        {feedbackEnabled || fundingEnabled ? (
          <div className="mt-4 space-y-4 border-t border-border pt-4">
            <FeedbackEntry
              enabled={feedbackEnabled}
              questionCount={form?.questions.length ?? 0}
              viewer={viewer}
              onOpen={() => setFeedbackOpen(true)}
            />
            {feedbackEnabled && fundingEnabled ? (
              <div className="border-t border-border" aria-hidden="true" />
            ) : null}
            {fundingEnabled ? (
              <PrePledgeAction
                signals={signals}
                viewer={viewer}
                onSave={(amount) => {
                  const result = setPrePledge(signals, { amount });
                  if (!result.ok) return "That amount is not valid.";
                  setSignals(result.signals);
                  return null;
                }}
                onWithdraw={() =>
                  setSignals((current) => withdrawPrePledge(current))
                }
              />
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 border-t border-border pt-3">
          <ShareAction ideaTitle={idea.title} />
        </div>
      </div>

      {feedbackEnabled && form ? (
        <FeedbackDialog
          idea={idea}
          form={form}
          open={feedbackOpen}
          viewer={viewer}
          onClose={() => setFeedbackOpen(false)}
        />
      ) : null}
    </>
  );
}
