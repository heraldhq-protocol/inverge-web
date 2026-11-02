"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { StatusBadge } from "@/components/ui/status-badge";
import { BusinessDetailsForm } from "@/features/verification/components/business-details-form";
import type {
  AccountType,
  VerificationCaseView,
  VerificationState,
} from "@/features/verification/types";

const ACTIVE = new Set([
  "SESSION_CREATED",
  "AWAITING_USER",
  "SUBMITTED",
  "IN_REVIEW",
  "ACTION_REQUIRED",
]);
const RETURN_PENDING = new Set([
  "SESSION_CREATED",
  "AWAITING_USER",
  "SUBMITTED",
  "IN_REVIEW",
]);
const POLL_MS = 15_000;
const MAX_POLLS = 20;

type Tone = "danger" | "neutral" | "success" | "warning";

type StatusCopy = {
  body: string;
  title: string;
  tone: Tone;
};

function statusCopy(state: VerificationState): StatusCopy {
  if (state.overall === "APPROVED") {
    return {
      body: "Your checks are complete. You do not need to verify again unless the provider asks for updated information.",
      title: "Identity verified",
      tone: "success",
    };
  }
  if (state.overall === "IN_REVIEW" || state.overall === "SUBMITTED") {
    return {
      body: "Your result is with our compliance team. You do not need to start again; we will update this page when the review is complete.",
      title: "With our review team",
      tone: "warning",
    };
  }
  if (state.overall === "ACTION_REQUIRED") {
    return {
      body: "The provider needs another look at one of your steps. Continue the open session to redo only what was requested. Your previous progress is saved.",
      title: "More information is needed",
      tone: "warning",
    };
  }
  if (
    state.overall === "SESSION_CREATED" ||
    state.overall === "AWAITING_USER"
  ) {
    return {
      body: "You have an open verification session. Continue in the secure provider window and return here when you are done.",
      title: "Verification in progress",
      tone: "warning",
    };
  }
  if (state.overall === "DECLINED") {
    return {
      body: "The checks were not completed successfully. You can try again if your details have changed or something needs correcting.",
      title: "Verification was not completed",
      tone: "danger",
    };
  }
  if (state.overall === "EXPIRED" || state.overall === "CANCELLED") {
    return {
      body: "This verification session is no longer active. Start a new session to continue.",
      title: "This session has ended",
      tone: "neutral",
    };
  }
  if (state.overall === "ERROR") {
    return {
      body: "We could not refresh your verification status. This is usually temporary, and your existing state is unchanged. Check again, or contact support if it persists.",
      title: "We could not check your status",
      tone: "danger",
    };
  }
  return {
    body: "Identity checks and sanctions screening are required before campaign submission and above the contribution threshold. It usually takes a few minutes.",
    title: "Ready to verify",
    tone: "neutral",
  };
}

const ACTION_LABEL: Record<VerificationState["nextAction"], string> = {
  complete_business_profile: "Add business details",
  contact_support: "Contact support",
  none: "Nothing outstanding",
  resolve_review: "Wait for the review team",
  resume: "Continue verification",
  retry: "Start a new attempt",
  start: "Start verification",
  wait: "Wait for the provider",
};

const ACTION_HINT: Partial<Record<VerificationState["nextAction"], string>> = {
  resume:
    "Your open session is saved. Continue where you left off rather than starting over.",
  retry:
    "This creates a new attempt. Your previous case stays in the audit history.",
  start:
    "You will be taken to Didit's secure verification window, then returned here.",
  wait: "No action is needed right now. Check again in a moment.",
};

function actionLabel(action: VerificationState["nextAction"]): string {
  return ACTION_LABEL[action];
}

function statusTone(status: string): Tone {
  if (status === "APPROVED") return "success";
  if (status === "DECLINED" || status === "ERROR") return "danger";
  if (
    status === "IN_REVIEW" ||
    status === "SUBMITTED" ||
    status === "ACTION_REQUIRED"
  ) {
    return "warning";
  }
  return "neutral";
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}

function friendlyError(code: string | undefined, message: string): string {
  if (code === "VERIFICATION_SESSION_CONFLICT") {
    return "We could not resume this verification session. Check your status and try again; if it persists, contact support.";
  }
  if (code === "VERIFICATION_ATTEMPTS_EXCEEDED") {
    return "You have reached the verification attempt limit for today. Contact support if you are stuck.";
  }
  if (code === "VERIFICATION_UNAVAILABLE") {
    return "The verification provider is temporarily unavailable. Your current status is unchanged. Try again shortly.";
  }
  if (/already in use/i.test(message)) {
    return "Your verification session is already open. Check your status, or continue the existing session instead of starting a new one.";
  }
  return message;
}

function CaseRow({
  accountType,
  label,
  view,
}: {
  accountType: AccountType;
  label: string;
  view: VerificationCaseView | null;
}) {
  const tone = view ? statusTone(view.status) : "neutral";
  const decided = view ? formatDate(view.decidedAt) : null;
  const Icon = accountType === "BUSINESS" ? Building2 : UserRound;

  return (
    <li className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <span
        aria-hidden="true"
        className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-brand/[0.08] text-brand-strong"
      >
        <Icon className="size-4" strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="mt-0.5 text-xs leading-5 text-muted">
          {view
            ? view.statusLabel
            : "Not started. This check has not been created yet."}
        </p>
        {decided ? (
          <p className="mt-1 text-[11px] text-muted">Completed {decided}</p>
        ) : null}
      </div>
      <StatusBadge variant={tone}>
        {view?.status === "ACTION_REQUIRED"
          ? "Action needed"
          : view
            ? view.statusLabel
            : "Not started"}
      </StatusBadge>
    </li>
  );
}

export function VerificationPanel({
  initial,
  mode,
  error,
  returnedFromProvider = false,
}: {
  initial: VerificationState | null;
  mode: "live" | "preview";
  error?: string;
  returnedFromProvider?: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState(error ?? null);
  const [polls, setPolls] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handledReturn = useRef(false);

  const refresh = useCallback(
    async (manual = false) => {
      if (mode !== "live") return;
      if (manual) setChecking(true);
      try {
        const response = await fetch("/api/verification/state", {
          cache: "no-store",
        });
        if (!response.ok) {
          if (manual) {
            setMessage(
              "We could not check your verification status. Your current state is unchanged. Try again in a moment.",
            );
          }
          return;
        }
        setState((await response.json()) as VerificationState);
        setPolls((value) => value + 1);
        if (manual) setMessage(null);
      } catch {
        if (manual) {
          setMessage(
            "We could not reach the verification service. Check your connection and try again.",
          );
        }
      } finally {
        if (manual) setChecking(false);
      }
    },
    [mode],
  );

  const watching =
    mode === "live" &&
    state !== null &&
    state.overall !== "ACTION_REQUIRED" &&
    (ACTIVE.has(state.overall) || state.nextAction === "resolve_review");

  useEffect(() => {
    if (!watching || polls >= MAX_POLLS) return;
    timer.current = setTimeout(() => void refresh(false), POLL_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [polls, refresh, watching]);

  useEffect(() => {
    if (mode !== "live" || !returnedFromProvider || handledReturn.current) {
      return;
    }
    handledReturn.current = true;
    void refresh(false);
    window.history.replaceState({}, "", window.location.pathname);
  }, [mode, refresh, returnedFromProvider]);

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
        error?: { code?: string; message?: string };
      } | null;
      if (!response.ok) {
        setMessage(
          friendlyError(
            payload?.error?.code,
            payload?.error?.message ?? "The request could not be completed.",
          ),
        );
        return null;
      }
      return payload;
    } catch {
      setMessage(
        "We could not reach the verification service. Check your connection and try again.",
      );
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function start(subject: AccountType) {
    const payload = await post("/api/verification/session", { subject });
    if (payload?.verificationUrl) {
      window.location.assign(payload.verificationUrl);
      return;
    }
    if (payload) {
      setMessage(
        "The provider did not return a secure verification link. Check your status and try again.",
      );
    }
  }

  async function choose(accountType: AccountType) {
    const payload = await post("/api/verification/account-type", {
      accountType,
    });
    if (payload) {
      setState(payload as unknown as VerificationState);
      setPolls(0);
      router.refresh();
    }
  }

  if (mode === "preview") {
    return (
      <section
        aria-labelledby="verification-preview"
        className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
      >
        <h2 id="verification-preview" className="text-lg font-bold text-ink">
          Identity verification
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
        className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
      >
        <h2
          id="verification-unavailable"
          className="text-lg font-bold text-ink"
        >
          Identity verification
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          {message ?? "Sign in to see and complete verification."}
        </p>
        <Link
          href="/sign-in"
          className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white"
        >
          Sign in
        </Link>
      </section>
    );
  }

  const copy = statusCopy(state);
  const activeCase = state.individual;
  const hasActiveCase =
    (state.individual !== null && ACTIVE.has(state.individual.status)) ||
    (state.business !== null && ACTIVE.has(state.business.status));
  const canSwitchAccountType = !hasActiveCase;
  const canStart =
    (state.nextAction === "start" ||
      state.nextAction === "resume" ||
      state.nextAction === "retry") &&
    state.nextSubject !== null;
  const showBusinessForm =
    state.accountType === "BUSINESS" &&
    state.nextAction === "complete_business_profile";
  const providerReturned =
    returnedFromProvider && RETURN_PENDING.has(state.overall);
  const StatusIcon =
    copy.tone === "success"
      ? CheckCircle2
      : copy.tone === "danger"
        ? AlertTriangle
        : copy.tone === "warning"
          ? Clock3
          : ShieldCheck;

  return (
    <section
      aria-labelledby="verification-title"
      className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_12px_34px_rgba(13,29,21,0.04)]"
    >
      <header className="border-b border-border/70 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
              Trust and safety
            </p>
            <h2
              id="verification-title"
              className="mt-1 text-xl font-bold tracking-[-0.03em] text-ink sm:text-2xl"
            >
              Identity verification
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
              Inverge checks identity and sanctions before money changes hands.
              Only the provider and our review team can change this status.
            </p>
          </div>
          <StatusBadge variant={copy.tone}>{state.overallLabel}</StatusBadge>
        </div>
      </header>

      <div className="space-y-5 p-5 sm:p-6">
        {providerReturned ? (
          <p
            role="status"
            className="flex items-start gap-2.5 rounded-xl border border-brand/25 bg-brand/[0.06] p-3.5 text-xs leading-5 text-brand-strong"
          >
            <Loader2
              className="mt-0.5 size-4 shrink-0 motion-safe:animate-spin"
              aria-hidden="true"
            />
            Welcome back. We are checking your result with the provider. You can
            leave this page; the status updates here when it is ready.
          </p>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <div className="rounded-xl border border-border bg-canvas p-5">
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                  copy.tone === "success"
                    ? "bg-brand/10 text-brand-strong"
                    : copy.tone === "danger"
                      ? "bg-danger/[0.08] text-danger"
                      : "bg-warning/10 text-warning-strong"
                }`}
              >
                <StatusIcon className="size-5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-ink">{copy.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{copy.body}</p>
              </div>
            </div>

            {message ? (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs leading-5 text-rose-950"
              >
                {message}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {canStart ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void start(state.nextSubject as AccountType)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {busy ? (
                    <Loader2
                      className="size-4 motion-safe:animate-spin"
                      aria-hidden="true"
                    />
                  ) : null}
                  {busy
                    ? "Opening secure window…"
                    : actionLabel(state.nextAction)}
                </button>
              ) : state.nextAction === "complete_business_profile" ? (
                <a
                  href="#business-details"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Add business details
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              ) : state.nextAction === "contact_support" ? (
                <Link
                  href="/contact"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Contact support
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              ) : null}

              <button
                type="button"
                disabled={checking || busy}
                onClick={() => void refresh(true)}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-brand-soft disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {checking ? (
                  <Loader2
                    className="size-4 motion-safe:animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <RefreshCw className="size-4" aria-hidden="true" />
                )}
                {checking ? "Checking…" : "Check status"}
              </button>
            </div>

            {ACTION_HINT[state.nextAction] ? (
              <p className="mt-3 text-xs leading-5 text-muted">
                {ACTION_HINT[state.nextAction]}
              </p>
            ) : null}

            {watching && polls < MAX_POLLS ? (
              <p className="mt-2 text-xs leading-5 text-muted">
                Checking again automatically. You can leave this page.
              </p>
            ) : null}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-canvas p-4">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
                Verification path
              </p>
              <div className="mt-2 flex items-center gap-2.5">
                {state.accountType === "BUSINESS" ? (
                  <Building2
                    className="size-4 text-brand-strong"
                    aria-hidden="true"
                  />
                ) : (
                  <UserRound
                    className="size-4 text-brand-strong"
                    aria-hidden="true"
                  />
                )}
                <p className="text-sm font-semibold text-ink">
                  {state.accountType === "BUSINESS"
                    ? "Business account"
                    : "Individual account"}
                </p>
              </div>
              {canSwitchAccountType ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {(["INDIVIDUAL", "BUSINESS"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      disabled={busy}
                      aria-pressed={state.accountType === value}
                      onClick={() => void choose(value)}
                      className={`min-h-10 rounded-xl border px-3 text-xs font-semibold transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                        state.accountType === value
                          ? "border-brand bg-brand text-white"
                          : "border-border bg-surface text-ink hover:border-brand/45"
                      }`}
                    >
                      {value === "INDIVIDUAL" ? "Individual" : "Business"}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs leading-5 text-muted">
                  The path stays fixed while a verification case is open. Finish
                  or resolve the current case before changing it.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-canvas p-4">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
                Checks
              </p>
              <ul className="mt-1 divide-y divide-border/70">
                {state.accountType === "BUSINESS" ? (
                  <>
                    <CaseRow
                      accountType="BUSINESS"
                      label="Business verification"
                      view={state.business}
                    />
                    <CaseRow
                      accountType="INDIVIDUAL"
                      label="Authorised representative"
                      view={state.individual}
                    />
                  </>
                ) : (
                  <CaseRow
                    accountType="INDIVIDUAL"
                    label="Identity check"
                    view={activeCase}
                  />
                )}
              </ul>
            </div>
          </aside>
        </div>

        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
          What is required
        </h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {state.requirements.map((requirement) => (
            <li
              key={requirement.key}
              className="flex gap-3 rounded-xl border border-border bg-canvas p-3.5"
            >
              {requirement.satisfied ? (
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-brand-strong"
                  aria-hidden="true"
                />
              ) : (
                <CircleDashed
                  className="mt-0.5 size-4 shrink-0 text-warning-strong"
                  aria-hidden="true"
                />
              )}
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
          <details className="rounded-xl border border-border bg-canvas p-4">
            <summary className="cursor-pointer text-xs font-semibold text-ink">
              Still blocking submission ({state.blockers.length})
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-muted">
              {state.blockers.map((blocker) => (
                <li key={blocker}>{blocker}</li>
              ))}
            </ul>
          </details>
        ) : null}

        {state.lastErrorCode ? (
          <p className="text-xs leading-5 text-muted">
            Last provider sync issue:{" "}
            <span className="font-mono">{state.lastErrorCode}</span>. We retry
            automatically and escalate to a person if it persists.
          </p>
        ) : null}

        {showBusinessForm ? (
          <BusinessDetailsForm
            disabled={busy}
            onStarted={(url) => window.location.assign(url)}
          />
        ) : null}

        <div className="rounded-xl border border-border bg-canvas p-4">
          <div className="flex gap-3">
            <LockKeyhole
              className="mt-0.5 size-4 shrink-0 text-brand-strong"
              aria-hidden="true"
            />
            <div className="min-w-0 text-xs leading-5 text-muted">
              <p className="font-semibold text-ink">
                Your documents stay with the provider
              </p>
              <p className="mt-1">
                You will complete the checks with Didit, our identity
                verification partner. Inverge receives the outcome and a
                reference, not your raw identity documents. Read our{" "}
                <Link
                  href="/privacy"
                  className="font-semibold text-brand-strong underline-offset-2 hover:underline"
                >
                  Privacy Notice
                </Link>
                , Didit&apos;s{" "}
                <a
                  href="https://didit.me/terms/verification-privacy-notice"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-brand-strong underline-offset-2 hover:underline"
                >
                  verification privacy notice
                </a>{" "}
                and{" "}
                <a
                  href="https://didit.me/terms/identity-verification"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-brand-strong underline-offset-2 hover:underline"
                >
                  end-user terms
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        <p className="border-t border-border pt-4 text-[11px] leading-5 text-muted">
          Policy {state.policyVersion}. A provider redirect is never treated as
          proof of verification; the backend records the verified outcome.
        </p>
      </div>
    </section>
  );
}
