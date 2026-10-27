"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { BusinessDetailsForm } from "@/features/verification/components/business-details-form";
import type {
  AccountType,
  VerificationState,
} from "@/features/verification/types";

const ACTIVE = new Set([
  "SESSION_CREATED",
  "AWAITING_USER",
  "SUBMITTED",
  "IN_REVIEW",
  "ACTION_REQUIRED",
]);
const POLL_MS = 15_000;
const MAX_POLLS = 20;

function tone(status: string): string {
  if (status === "APPROVED")
    return "border-emerald-300 bg-emerald-50 text-emerald-900";
  if (status === "DECLINED" || status === "ERROR")
    return "border-rose-300 bg-rose-50 text-rose-900";
  if (status === "IN_REVIEW" || status === "ACTION_REQUIRED")
    return "border-amber-300 bg-amber-50 text-amber-900";
  return "border-border bg-canvas text-ink";
}

const NEXT_LABEL: Record<VerificationState["nextAction"], string> = {
  start: "Start verification",
  resume: "Finish the open session",
  wait: "Wait for the provider",
  retry: "Start a new attempt",
  contact_support: "Contact support",
  resolve_review: "Wait for the review team",
  complete_business_profile: "Add your business details",
  none: "Nothing outstanding",
};

export function VerificationPanel({
  initial,
  mode,
  error,
}: {
  initial: VerificationState | null;
  mode: "live" | "preview";
  error?: string;
}) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(error ?? null);
  const [polls, setPolls] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    if (mode !== "live") return;
    try {
      const response = await fetch("/api/verification/state", {
        cache: "no-store",
      });
      if (!response.ok) return;
      setState((await response.json()) as VerificationState);
      setPolls((value) => value + 1);
    } catch {
      // Advisory poll only; the last server-rendered state stays authoritative.
    }
  }, [mode]);

  const watching =
    mode === "live" &&
    state !== null &&
    (ACTIVE.has(state.overall) || state.nextAction === "resolve_review");

  useEffect(() => {
    if (!watching || polls >= MAX_POLLS) return;
    timer.current = setTimeout(() => void refresh(), POLL_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [polls, refresh, watching]);

  async function post(path: string, body: unknown) {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(path, {
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as {
        verificationUrl?: string;
        error?: { message?: string };
      } | null;
      if (!response.ok) {
        setMessage(
          payload?.error?.message ?? "The request could not be completed.",
        );
        return null;
      }
      return payload;
    } finally {
      setBusy(false);
    }
  }

  async function start(subject: AccountType) {
    const payload = await post("/api/verification/session", { subject });
    if (payload?.verificationUrl)
      window.location.assign(payload.verificationUrl);
  }

  async function choose(accountType: AccountType) {
    const payload = await post("/api/verification/account-type", {
      accountType,
    });
    if (payload) {
      setState(payload as unknown as VerificationState);
      router.refresh();
    }
  }

  if (mode === "preview") {
    return (
      <section
        aria-labelledby="verification-preview"
        className="rounded-2xl border border-border bg-surface p-5"
      >
        <h2 id="verification-preview" className="text-lg font-bold text-ink">
          Verification
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          This is a development preview. No identity data is collected and no
          verification result is shown here.
        </p>
        <p className="mt-3 rounded-xl border border-dashed border-border bg-canvas p-4 text-xs leading-5 text-muted">
          Sign in through the Inverge API to start identity, AML or business
          verification. A preview must never be presented as an approval.
        </p>
      </section>
    );
  }

  if (!state) {
    return (
      <section
        aria-labelledby="verification-unavailable"
        className="rounded-2xl border border-border bg-surface p-5"
      >
        <h2
          id="verification-unavailable"
          className="text-lg font-bold text-ink"
        >
          Verification
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          {message ?? "Sign in to see and complete verification."}
        </p>
        <Link
          href="/sign-in"
          className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white"
        >
          Sign in
        </Link>
      </section>
    );
  }

  const canStart =
    state.nextSubject !== null &&
    state.nextAction !== "resolve_review" &&
    state.nextAction !== "contact_support" &&
    state.nextAction !== "none";

  return (
    <section
      aria-labelledby="verification-title"
      className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="verification-title" className="text-lg font-bold text-ink">
            Verification
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
            Inverge checks identity and screening before money changes hands.
            Status is set only by the provider and our review team.
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tone(state.overall)}`}
        >
          {state.overallLabel}
        </span>
      </div>

      {state.complianceHold ? (
        <p
          role="status"
          className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs leading-5 text-amber-950"
        >
          A compliance review is open. Contributions and campaign submission
          stay paused until a reviewer records an outcome. This is not a finding
          against you.
        </p>
      ) : null}
      {message ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs leading-5 text-rose-950"
        >
          {message}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <fieldset className="rounded-xl border border-border bg-canvas p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Account type
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["INDIVIDUAL", "BUSINESS"] as const).map((value) => (
              <button
                key={value}
                type="button"
                disabled={busy}
                aria-pressed={state.accountType === value}
                onClick={() => void choose(value)}
                className={`min-h-10 rounded-xl border px-4 text-sm font-semibold disabled:opacity-60 ${
                  state.accountType === value
                    ? "border-brand bg-brand text-white"
                    : "border-border bg-surface text-ink hover:border-brand/45"
                }`}
              >
                {value === "INDIVIDUAL" ? "Individual" : "Business"}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs leading-5 text-muted">
            A business still needs its authorised representative verified.
          </p>
        </fieldset>

        <div className="rounded-xl border border-border bg-canvas p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Next step
          </p>
          <p className="mt-2 text-sm font-semibold text-ink">
            {NEXT_LABEL[state.nextAction]}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {state.nextAction === "complete_business_profile" ? (
              <Link
                href="#business-details"
                className="inline-flex min-h-10 items-center rounded-xl border border-border px-4 text-sm font-semibold text-ink"
              >
                Add business details
              </Link>
            ) : canStart ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void start(state.nextSubject as AccountType)}
                className="inline-flex min-h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                {state.nextAction === "retry"
                  ? "Try again"
                  : "Start verification"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void refresh()}
              className="inline-flex min-h-10 items-center rounded-xl border border-border px-4 text-sm font-semibold text-ink"
            >
              Check status
            </button>
          </div>
          {watching && polls < MAX_POLLS ? (
            <p className="mt-2 text-xs leading-5 text-muted">
              Checking again automatically. You can leave this page.
            </p>
          ) : null}
        </div>
      </div>

      <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">
        What is required
      </h3>
      <ul className="mt-2 space-y-2">
        {state.requirements.map((requirement) => (
          <li
            key={requirement.key}
            className="flex gap-3 rounded-xl border border-border bg-canvas p-3"
          >
            <span
              aria-hidden="true"
              className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${requirement.satisfied ? "bg-emerald-600" : "bg-amber-500"}`}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">
                {requirement.label}
                <span className="sr-only">
                  {requirement.satisfied ? " (complete)" : " (outstanding)"}
                </span>
              </p>
              <p className="mt-0.5 text-xs leading-5 text-muted">
                {requirement.detail}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {state.blockers.length > 0 ? (
        <>
          <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">
            Still blocking submission
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-muted">
            {state.blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        </>
      ) : null}

      {state.lastErrorCode ? (
        <p className="mt-4 text-xs leading-5 text-muted">
          Last provider sync issue:{" "}
          <span className="font-mono">{state.lastErrorCode}</span>. We retry
          automatically and escalate to a person if it persists.
        </p>
      ) : null}

      <p className="mt-5 border-t border-border pt-4 text-[11px] leading-5 text-muted">
        Policy {state.policyVersion}. Inverge keeps status and reference codes
        only; documents and selfies stay with the verification provider.
      </p>

      {state.accountType === "BUSINESS" ? (
        <BusinessDetailsForm
          disabled={busy}
          onStarted={(url) => window.location.assign(url)}
        />
      ) : null}
    </section>
  );
}
