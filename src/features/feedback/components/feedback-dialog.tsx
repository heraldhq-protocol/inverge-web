"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, LockKeyIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CommunityInvite,
  ExploreIdeasLink,
  FeedbackThanks,
  FollowCreatorButton,
} from "@/features/feedback/components/community-invite";
import {
  answeredCount,
  validateFeedbackAnswers,
  type AnswerIssues,
} from "@/features/feedback/lib/feedback";
import type {
  FeedbackAnswers,
  FeedbackForm,
  FeedbackQuestion,
} from "@/features/feedback/types";
import type { IdeaDetail } from "@/features/ideas/types";

function draftKey(ideaId: string, formVersion: number): string {
  return `inverge:feedback-draft:${ideaId}:${formVersion}`;
}

function readDraft(
  ideaId: string,
  formVersion: number,
): FeedbackAnswers | null {
  try {
    const raw = window.sessionStorage.getItem(draftKey(ideaId, formVersion));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { answers?: FeedbackAnswers };
    return parsed.answers ?? null;
  } catch {
    return null;
  }
}

function writeDraft(
  ideaId: string,
  formVersion: number,
  answers: FeedbackAnswers,
): void {
  try {
    window.sessionStorage.setItem(
      draftKey(ideaId, formVersion),
      JSON.stringify({ answers, savedAt: new Date().toISOString() }),
    );
  } catch {
    // Storage can be unavailable in private modes. Losing a draft is better
    // than blocking the form, and the live state still holds the answers.
  }
}

function clearDraft(ideaId: string, formVersion: number): void {
  try {
    window.sessionStorage.removeItem(draftKey(ideaId, formVersion));
  } catch {
    // Nothing to do.
  }
}

function questionInputId(questionId: string): string {
  return `feedback-${questionId}`;
}

function QuestionField({
  error,
  onChange,
  question,
  value,
}: {
  error: string | undefined;
  onChange: (value: FeedbackAnswers[string]) => void;
  question: FeedbackQuestion;
  value: FeedbackAnswers[string] | undefined;
}) {
  const inputId = questionInputId(question.id);
  const errorId = `${inputId}-error`;
  const helpId = question.helpText ? `${inputId}-help` : undefined;
  const describedBy = [helpId, error ? errorId : undefined]
    .filter(Boolean)
    .join(" ");
  const invalid = Boolean(error);

  const legend = (
    <legend className="text-sm font-medium leading-6 text-ink">
      {question.label}
      {question.required ? (
        <span className="ml-1 text-muted" aria-hidden="true">
          *
        </span>
      ) : (
        <span className="ml-1.5 text-xs font-normal text-muted">optional</span>
      )}
    </legend>
  );

  const textLabel = (
    <label
      htmlFor={inputId}
      className="block text-sm font-medium leading-6 text-ink"
    >
      {question.label}
      {question.required ? (
        <span className="ml-1 text-muted" aria-hidden="true">
          *
        </span>
      ) : (
        <span className="ml-1.5 text-xs font-normal text-muted">optional</span>
      )}
    </label>
  );

  function errorText() {
    return error ? (
      <p
        id={errorId}
        className="mt-1.5 text-xs font-medium text-danger"
        role="alert"
      >
        {error}
      </p>
    ) : null;
  }

  function helpText() {
    return question.helpText ? (
      <p id={helpId} className="mt-1 text-xs leading-5 text-muted">
        {question.helpText}
      </p>
    ) : null;
  }

  switch (question.type) {
    case "rating":
    case "scale": {
      const min = question.type === "rating" ? 1 : (question.scale?.min ?? 1);
      const max = question.type === "rating" ? 5 : (question.scale?.max ?? 5);
      const values = Array.from(
        { length: Math.max(1, max - min + 1) },
        (_, index) => min + index,
      );
      return (
        <fieldset aria-describedby={describedBy || undefined}>
          {legend}
          {helpText()}
          <div
            role="radiogroup"
            aria-label={question.label}
            className="mt-2 flex flex-wrap gap-1.5"
          >
            {values.map((item) => {
              const selected = value === item;
              return (
                <button
                  key={item}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`${item} of ${max}`}
                  onClick={() => onChange(item)}
                  className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border text-sm font-semibold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    selected
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-surface text-muted hover:border-brand/40 hover:text-ink"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
          <div className="mt-1.5 flex justify-between text-[0.6875rem] text-muted">
            <span>
              {question.type === "scale"
                ? (question.scale?.minLabel ?? "Low")
                : "Not promising"}
            </span>
            <span>
              {question.type === "scale"
                ? (question.scale?.maxLabel ?? "High")
                : "Very promising"}
            </span>
          </div>
          {errorText()}
        </fieldset>
      );
    }

    case "single-choice":
    case "multi-choice": {
      const multi = question.type === "multi-choice";
      const selected = multi
        ? Array.isArray(value)
          ? value
          : []
        : typeof value === "string"
          ? [value]
          : [];

      return (
        <fieldset aria-describedby={describedBy || undefined}>
          {legend}
          {helpText()}
          <div
            role={multi ? "group" : "radiogroup"}
            aria-label={question.label}
            className="mt-2 grid gap-1.5"
          >
            {(question.options ?? []).map((option) => {
              const checked = selected.includes(option.label);
              return (
                <button
                  key={option.id}
                  type="button"
                  role={multi ? "checkbox" : "radio"}
                  aria-checked={checked}
                  onClick={() => {
                    if (!multi) {
                      onChange(option.label);
                      return;
                    }
                    onChange(
                      checked
                        ? selected.filter((item) => item !== option.label)
                        : [...selected, option.label],
                    );
                  }}
                  className={`flex min-h-11 items-center gap-2.5 rounded-lg border px-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    checked
                      ? "border-brand bg-brand-soft font-medium text-brand-strong"
                      : "border-border bg-surface text-ink hover:border-brand/35"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`grid size-4 shrink-0 place-items-center border ${
                      multi ? "rounded" : "rounded-full"
                    } ${
                      checked
                        ? "border-brand bg-brand text-white"
                        : "border-border-strong bg-surface"
                    }`}
                  >
                    {checked ? (
                      <span className="size-1.5 rounded-full bg-white" />
                    ) : null}
                  </span>
                  {option.label}
                </button>
              );
            })}
          </div>
          {errorText()}
        </fieldset>
      );
    }

    case "boolean":
      return (
        <fieldset aria-describedby={describedBy || undefined}>
          {legend}
          {helpText()}
          <div
            role="radiogroup"
            aria-label={question.label}
            className="mt-2 flex gap-2"
          >
            {[
              { label: "Yes", value: true },
              { label: "No", value: false },
            ].map((option) => {
              const selected = value === option.value;
              return (
                <button
                  key={option.label}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onChange(option.value)}
                  className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    selected
                      ? "border-brand bg-brand-soft text-brand-strong"
                      : "border-border bg-surface text-muted hover:border-brand/35 hover:text-ink"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          {errorText()}
        </fieldset>
      );

    case "long-text":
      return (
        <div>
          {textLabel}
          {helpText()}
          <Textarea
            id={inputId}
            rows={4}
            maxLength={4000}
            value={typeof value === "string" ? value : ""}
            aria-invalid={invalid}
            aria-describedby={describedBy || undefined}
            onChange={(event) => onChange(event.target.value)}
            className="mt-2"
          />
          {errorText()}
        </div>
      );

    case "short-text":
    default:
      return (
        <div>
          {textLabel}
          {helpText()}
          <Input
            id={inputId}
            maxLength={280}
            value={typeof value === "string" ? value : ""}
            aria-invalid={invalid}
            aria-describedby={describedBy || undefined}
            onChange={(event) => onChange(event.target.value)}
            className="mt-2"
          />
          {errorText()}
        </div>
      );
  }
}

/**
 * The respondent feedback experience.
 *
 * A dialog on desktop and a full-height sheet on mobile. Answers persist in
 * sessionStorage per form version, so closing the tab or following a sign-in
 * link does not destroy them. Submitting is labelled preview because there is
 * no authenticated session in this repository yet; the success state does not
 * claim the creator received anything.
 */
export function FeedbackDialog({
  idea,
  form,
  onClose,
  open,
  viewer,
}: {
  idea: IdeaDetail;
  form: FeedbackForm;
  onClose: () => void;
  open: boolean;
  viewer: "signed-in" | "visitor";
}) {
  const titleId = `${useId()}-feedback-title`;
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<() => void>(() => {});
  const [answers, setAnswers] = useState<FeedbackAnswers>({});
  const [errors, setErrors] = useState<AnswerIssues>({});
  const [signInRequired, setSignInRequired] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const answered = answeredCount(form, answers);

  function requestClose() {
    if (!success && answered > 0 && !confirmDiscard) {
      setConfirmDiscard(true);
      return;
    }
    if (success) clearDraft(idea.id, form.version);
    onClose();
  }

  useEffect(() => {
    closeRef.current = requestClose;
  });

  useEffect(() => {
    if (!open) return;

    const restored = readDraft(idea.id, form.version);
    // The draft is browser-only; reading it during render would make the first client
    // render disagree with the server HTML. Restoring after mount is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (restored) setAnswers(restored);
    setErrors({});
    setSignInRequired(false);
    setSuccess(false);
    setConfirmDiscard(false);

    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, form.version, idea.id]);

  useEffect(() => {
    if (!open || success) return;
    writeDraft(idea.id, form.version, answers);
  }, [answers, form.version, idea.id, open, success]);

  function updateAnswer(questionId: string, value: FeedbackAnswers[string]) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setErrors((current) => {
      if (!current[questionId]) return current;
      const next = { ...current };
      delete next[questionId];
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const issues = validateFeedbackAnswers(form, answers);
    if (Object.keys(issues).length > 0) {
      setErrors(issues);
      const firstId = Object.keys(issues)[0];
      if (firstId) {
        document
          .querySelector<HTMLElement>(`[id="${questionInputId(firstId)}"]`)
          ?.focus();
      }
      return;
    }
    if (viewer === "visitor") {
      setSignInRequired(true);
      return;
    }
    clearDraft(idea.id, form.version);
    setSuccess(true);
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close feedback form"
        onClick={requestClose}
        className="absolute inset-0 bg-contrast/45 backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-border bg-surface shadow-2xl sm:max-h-[90dvh] sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id={titleId}
                className="text-lg font-bold tracking-[-0.03em] text-ink"
              >
                {success ? "Feedback complete" : form.title}
              </h2>
              <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-warning-strong">
                Preview
              </span>
            </div>
            {!success ? (
              <p className="mt-1 max-w-lg text-xs leading-5 text-muted">
                {form.description ||
                  "Your feedback helps the creator improve this idea."}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close feedback form"
            className="grid size-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>
        </header>

        {confirmDiscard && !success ? (
          <div className="border-b border-warning/25 bg-warning/10 px-5 py-3 sm:px-6">
            <p className="text-xs leading-5 text-warning-strong">
              You have answers that are not submitted. Close and keep them for
              later, or discard them.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setConfirmDiscard(false)}
              >
                Keep editing
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => {
                  clearDraft(idea.id, form.version);
                  onClose();
                }}
              >
                Discard answers
              </Button>
            </div>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {success ? (
            <div className="space-y-4">
              <FeedbackThanks />
              <p className="rounded-xl bg-canvas px-3 py-2 text-center text-[0.6875rem] leading-4 text-muted">
                This is a preview: nothing has been sent to the creator yet.
                When accounts are connected, your response will be stored
                against form version {form.version}.
              </p>
              {idea.community?.enabled && idea.community.showAfterFeedback ? (
                <CommunityInvite invite={idea.community} />
              ) : null}
              <FollowCreatorButton
                creatorName={idea.creator}
                signedIn={viewer === "signed-in"}
                returnTo={`/ideas/${idea.id}`}
                compact
              />
              <div className="flex justify-center pt-1">
                <ExploreIdeasLink />
              </div>
              <Button
                type="button"
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => {
                  clearDraft(idea.id, form.version);
                  onClose();
                }}
              >
                Return to the idea
              </Button>
            </div>
          ) : (
            <form id="feedback-form" onSubmit={handleSubmit} noValidate>
              <div className="space-y-6">
                {form.questions.map((question) => (
                  <QuestionField
                    key={question.id}
                    question={question}
                    value={answers[question.id]}
                    error={errors[question.id]}
                    onChange={(value) => updateAnswer(question.id, value)}
                  />
                ))}
              </div>

              {signInRequired ? (
                <div
                  className="mt-5 rounded-xl border border-brand/25 bg-brand-tint p-4"
                  role="status"
                >
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <HugeiconsIcon
                      icon={LockKeyIcon}
                      size={16}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className="text-brand-strong"
                    />
                    Sign in to send your feedback
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Your answers are saved in this browser. Sign in and come
                    back to send them without starting again.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/sign-in?next=${encodeURIComponent(`/ideas/${idea.id}`)}`}
                      className="inline-flex min-h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      Sign in
                    </Link>
                    <Link
                      href={`/sign-up?next=${encodeURIComponent(`/ideas/${idea.id}`)}`}
                      className="inline-flex min-h-10 items-center rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      Create an account
                    </Link>
                  </div>
                </div>
              ) : null}
            </form>
          )}
        </div>

        {!success ? (
          <footer className="flex items-center justify-between gap-3 border-t border-border bg-surface px-5 py-3 sm:px-6">
            <p className="text-[0.6875rem] text-muted" aria-live="polite">
              {answered} of {form.questions.length} answered
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={requestClose}
              >
                Cancel
              </Button>
              <Button type="submit" size="md" form="feedback-form">
                {signInRequired ? "Save answers" : "Submit feedback"}
              </Button>
            </div>
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
