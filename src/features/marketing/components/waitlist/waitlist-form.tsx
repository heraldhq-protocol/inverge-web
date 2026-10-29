"use client";

import { Check, Loader2 } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useWaitlistLane } from "@/features/marketing/components/waitlist/waitlist-lane-context";
import type { WaitlistLaneId } from "@/features/marketing/content/waitlist";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAIL_LENGTH = 254;
const SUBMIT_DELAY_MS = 500;

const laneOptions = [
  { id: "backer", label: "Back a build", shortLabel: "backer" },
  { id: "builder", label: "Start a build", shortLabel: "builder" },
] as const satisfies readonly {
  id: WaitlistLaneId;
  label: string;
  shortLabel: string;
}[];

const laneCopy: Record<
  WaitlistLaneId,
  { button: string; successBody: string; successTitle: string }
> = {
  backer: {
    button: "Join the backer list",
    successBody: "We'll email you when the first vetted campaigns open.",
    successTitle: "You're on the backer list.",
  },
  builder: {
    button: "Join the builder list",
    successBody: "We'll email you when idea publishing opens.",
    successTitle: "You're on the builder list.",
  },
};

type SubmitStatus = "error" | "idle" | "submitting" | "success";

function validateEmail(value: string): string | null {
  const email = value.trim();

  if (!email) {
    return "Enter your email address.";
  }
  if (email.length > MAX_EMAIL_LENGTH) {
    return "That email address is too long.";
  }
  if (!EMAIL_PATTERN.test(email)) {
    return "Enter a valid email address, like name@example.com.";
  }

  return null;
}

/**
 * Launch-list form.
 *
 * The waitlist endpoint does not exist yet, so a valid submit completes against
 * a local preview after the delay a real request would take. The success panel
 * says so; it never claims the address was stored. Wire `submit` to the backend
 * before removing that note.
 */
export function WaitlistForm() {
  const { lane, setLane } = useWaitlistLane();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isSubmitting = status === "submitting";
  const activeCopy = laneCopy[lane];
  const otherLane: WaitlistLaneId = lane === "backer" ? "builder" : "backer";

  async function submit() {
    const nextError = validateEmail(email);

    if (nextError) {
      setError(nextError);
      inputRef.current?.focus();
      return;
    }

    setError(null);

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setStatus("error");
      return;
    }

    setStatus("submitting");
    await new Promise((resolve) => setTimeout(resolve, SUBMIT_DELAY_MS));
    setSubmittedEmail(email.trim());
    setStatus("success");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit();
  }

  function startOver(nextLane: WaitlistLaneId, clearEmail: boolean) {
    setLane(nextLane);
    setError(null);
    setStatus("idle");
    setSubmittedEmail("");

    if (clearEmail) {
      setEmail("");
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
      >
        <span className="grid size-11 place-items-center rounded-full bg-brand-soft text-brand-strong">
          <Check aria-hidden="true" className="size-5" />
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink">
          {activeCopy.successTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          {activeCopy.successBody} We&apos;ll use{" "}
          <span className="font-semibold text-ink">{submittedEmail}</span>.
        </p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          <button
            type="button"
            onClick={() => startOver(otherLane, false)}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-strong underline decoration-brand/40 underline-offset-4 transition-colors hover:decoration-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Join the{" "}
            {laneOptions.find((option) => option.id === otherLane)?.shortLabel}{" "}
            list instead
          </button>
          <button
            type="button"
            onClick={() => startOver(lane, true)}
            className="inline-flex min-h-11 items-center text-sm font-medium text-ink-soft underline decoration-border underline-offset-4 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Use a different email
          </button>
        </div>
        <p className="mt-5 border-t border-border pt-3 text-xs leading-5 text-muted">
          <span className="font-semibold text-ink">Preview build.</span> This
          address is not stored yet. The waitlist endpoint is the next
          integration step.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="text-lg font-bold tracking-tight text-ink">
        Join the launch list
      </h2>

      <form noValidate aria-busy={isSubmitting} onSubmit={handleSubmit}>
        <fieldset className="mt-4" disabled={isSubmitting}>
          <legend className="sr-only">Which list do you want to join?</legend>
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-surface-muted p-1">
            {laneOptions.map((option) => {
              const isSelected = lane === option.id;

              return (
                <label key={option.id} className="relative block">
                  <input
                    type="radio"
                    name="waitlist-lane"
                    value={option.id}
                    checked={isSelected}
                    onChange={() => setLane(option.id)}
                    className="peer sr-only"
                  />
                  <span
                    className={`flex min-h-11 cursor-pointer items-center justify-center rounded-lg px-2 text-center text-sm font-semibold transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink ${
                      isSelected
                        ? "bg-contrast text-white"
                        : "text-ink-soft hover:text-ink"
                    } ${isSubmitting ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-4">
          <Field label="Email address" error={error}>
            {({ id, invalid, describedBy }) => (
              <Input
                ref={inputRef}
                id={id}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={MAX_EMAIL_LENGTH}
                placeholder="you@example.com"
                value={email}
                disabled={isSubmitting}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) {
                    setError(null);
                  }
                }}
                onBlur={() => {
                  if (email.trim()) {
                    setError(validateEmail(email));
                  }
                }}
                className={
                  invalid
                    ? "border-danger focus:border-danger focus:ring-danger/12"
                    : ""
                }
              />
            )}
          </Field>
        </div>

        {status === "error" ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-danger/30 bg-danger/[0.06] px-4 py-3"
          >
            <p className="text-sm font-semibold text-ink">
              We couldn&apos;t add you to the list.
            </p>
            <p className="mt-1 text-sm leading-5 text-muted">
              Check your connection and try again.
            </p>
          </div>
        ) : null}

        <Button type="submit" className="mt-4 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2
                aria-hidden="true"
                className="mr-2 size-4 animate-spin"
              />
              Joining…
            </>
          ) : status === "error" ? (
            "Try again"
          ) : (
            activeCopy.button
          )}
        </Button>

        <p className="mt-3 text-xs leading-5 text-muted">
          One email when your lane opens. No newsletter, no wallet needed.
        </p>
      </form>
    </div>
  );
}
