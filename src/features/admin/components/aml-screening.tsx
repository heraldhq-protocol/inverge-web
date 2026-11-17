"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import {
  adminFieldClass,
  adminLinkClass,
} from "@/features/admin/components/admin-workspace-ui";
import {
  AML_KIND_LABELS,
  AML_KINDS,
  AML_SCREEN_TIMEOUT_MS,
  AML_STATUS_LABELS,
  AML_STATUS_TONES,
  amlReceiptSchema,
  amlScreenSchema,
  matchesAmlScreening,
  type AmlKind,
  type AmlScreenInput,
  type AmlScreeningResult,
} from "@/features/admin/lib/aml";
import { sendJson } from "@/lib/api/client";

type AmlDraft = {
  kind: AmlKind;
  userId: string;
  fullName: string;
  dateOfBirth: string;
  documentNumber: string;
  nationality: string;
};

type ScreeningState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "complete"; receipt: AmlScreenInput; result: AmlScreeningResult }
  | { status: "failed"; message: string; next: "retry" | "new" | "reload" };

type AmlReceiptState = {
  mode: "live";
  kind: AmlKind;
  userId: string;
  result: AmlScreeningResult;
};

function toScreenInput(draft: AmlDraft): unknown {
  return {
    kind: draft.kind,
    userId: draft.userId.trim(),
    fullName: draft.fullName.trim(),
    ...(draft.dateOfBirth ? { dateOfBirth: draft.dateOfBirth } : {}),
    ...(draft.documentNumber.trim()
      ? { documentNumber: draft.documentNumber.trim() }
      : {}),
    ...(draft.nationality.trim()
      ? { nationality: draft.nationality.trim() }
      : {}),
  };
}

/**
 * Run an AML screen for an individual or a business subject. The result is a
 * compliance record the service saves on the account; it is never presented
 * as an account approval or decline.
 */
export function AmlScreening() {
  const router = useRouter();
  const [draft, setDraft] = useState<AmlDraft>({
    kind: "individual",
    userId: "",
    fullName: "",
    dateOfBirth: "",
    documentNumber: "",
    nationality: "",
  });
  const [state, setState] = useState<ScreeningState>({ status: "idle" });
  const busyRef = useRef(false);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const busy = state.status === "pending";
  const locked = busy || (state.status === "failed" && state.next !== "retry");
  const changed =
    state.status === "complete" &&
    (() => {
      const current = amlScreenSchema.safeParse(toScreenInput(draft));
      const submitted = state.receipt;
      return (
        !current.success ||
        current.data.kind !== submitted.kind ||
        current.data.userId !== submitted.userId ||
        current.data.fullName !== submitted.fullName
      );
    })();

  useEffect(() => {
    if (state.status === "complete" || state.status === "failed")
      feedbackRef.current?.focus();
  }, [state]);

  async function handleScreen() {
    if (busyRef.current || locked) return;
    const parsed = amlScreenSchema.safeParse(toScreenInput(draft));
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
      const response = await sendJson<AmlReceiptState>(
        "/api/admin/aml/screen",
        {
          method: "POST",
          body: parsed.data,
          timeoutMs: AML_SCREEN_TIMEOUT_MS + 5_000,
        },
      );
      if (!response.ok) {
        setState({
          status: "failed",
          message: response.message,
          next:
            response.status === 0 || response.status >= 500
              ? "new"
              : [401, 403, 404].includes(response.status)
                ? "reload"
                : "retry",
        });
        return;
      }
      const receipt = amlReceiptSchema.safeParse(response.data);
      if (!receipt.success || !matchesAmlScreening(receipt.data, parsed.data)) {
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
        receipt: parsed.data,
        result: receipt.data.result,
      });
      // The service records the screening on the account, so the
      // server-rendered history for a loaded subject is refreshed.
      router.refresh();
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
        aria-label="Run AML screening"
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
            Subject to screen
          </legend>
          <div>
            <label
              htmlFor={`${id}-kind`}
              className="text-sm font-medium text-ink"
            >
              Subject type
            </label>
            <select
              id={`${id}-kind`}
              value={draft.kind}
              className={`mt-2 ${adminFieldClass}`}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  kind:
                    event.target.value === "business"
                      ? "business"
                      : "individual",
                })
              }
            >
              {AML_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {AML_KIND_LABELS[kind]}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-ink-soft">
              Business screening attaches to the account&apos;s registered
              business profile.
            </p>
          </div>
          <div>
            <label
              htmlFor={`${id}-user`}
              className="text-sm font-medium text-ink"
            >
              Account id
            </label>
            <input
              id={`${id}-user`}
              value={draft.userId}
              required
              maxLength={200}
              autoComplete="off"
              spellCheck={false}
              className={`mt-2 font-mono text-sm ${adminFieldClass}`}
              onChange={(event) =>
                setDraft({ ...draft, userId: event.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor={`${id}-name`}
              className="text-sm font-medium text-ink"
            >
              Full name
            </label>
            <input
              id={`${id}-name`}
              value={draft.fullName}
              required
              maxLength={200}
              className={`mt-2 ${adminFieldClass}`}
              onChange={(event) =>
                setDraft({ ...draft, fullName: event.target.value })
              }
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label
                htmlFor={`${id}-dob`}
                className="text-sm font-medium text-ink"
              >
                Date of birth
              </label>
              <input
                id={`${id}-dob`}
                type="date"
                value={draft.dateOfBirth}
                className={`mt-2 ${adminFieldClass}`}
                onChange={(event) =>
                  setDraft({ ...draft, dateOfBirth: event.target.value })
                }
              />
            </div>
            <div>
              <label
                htmlFor={`${id}-document`}
                className="text-sm font-medium text-ink"
              >
                Document number
              </label>
              <input
                id={`${id}-document`}
                value={draft.documentNumber}
                maxLength={100}
                autoComplete="off"
                className={`mt-2 ${adminFieldClass}`}
                onChange={(event) =>
                  setDraft({ ...draft, documentNumber: event.target.value })
                }
              />
            </div>
            <div>
              <label
                htmlFor={`${id}-nationality`}
                className="text-sm font-medium text-ink"
              >
                Nationality
              </label>
              <input
                id={`${id}-nationality`}
                value={draft.nationality}
                maxLength={3}
                autoComplete="off"
                spellCheck={false}
                placeholder="NG"
                className={`mt-2 uppercase ${adminFieldClass}`}
                onChange={(event) =>
                  setDraft({ ...draft, nationality: event.target.value })
                }
              />
            </div>
          </div>
          <p className="text-sm leading-6 text-ink-soft">
            The extra fields are optional but they sharpen the search. Each run
            is recorded on the account by the service.
          </p>
          <Button
            type="submit"
            className="w-full cursor-pointer bg-brand-strong hover:bg-contrast focus-visible:outline-brand-strong sm:w-auto"
          >
            {busy ? "Screening subject..." : "Run screening"}
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
              Results show sanctions and watchlist matches across the
              service&apos;s datasets. Screening is a compliance record; it does
              not approve or decline the account.
            </p>
          </section>
        ) : state.status === "pending" ? (
          <div
            role="status"
            className="rounded-xl border border-border bg-surface p-5 text-sm leading-6 text-ink-soft sm:p-6"
          >
            Screening is in progress. The result will appear here when the
            service confirms it.
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
                  A screening record may already have been saved. Run it again
                  only if you want a new screening on the account.
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
                  requestAnimationFrame(() => feedbackRef.current?.focus());
                }}
              >
                Run another screening
              </Button>
            ) : state.next === "reload" ? (
              <a href="/admin/aml" className={`mt-4 ${adminLinkClass}`}>
                Reload AML screening
              </a>
            ) : null}
          </section>
        ) : (
          <AmlResult
            receipt={state.receipt}
            result={state.result}
            changed={changed}
          />
        )}
      </div>
    </div>
  );
}

function AmlResult({
  receipt,
  result,
  changed,
}: {
  receipt: AmlScreenInput;
  result: AmlScreeningResult;
  changed: boolean;
}) {
  return (
    <section
      aria-label="Screening result"
      className="rounded-xl border border-border bg-surface p-5 sm:p-6"
    >
      <h2 className="text-lg font-semibold text-ink">Screening result</h2>
      <p role="status" className="mt-3">
        <Pill tone={AML_STATUS_TONES[result.status]} size="sm">
          {AML_STATUS_LABELS[result.status]}
        </Pill>
      </p>
      <p className="mt-3 text-sm leading-6 text-ink-soft [overflow-wrap:anywhere]">
        {AML_KIND_LABELS[receipt.kind]}: {receipt.fullName} (account{" "}
        <span className="font-mono text-xs">{receipt.userId}</span>). Screened
        just now.
      </p>
      {changed ? (
        <p className="mt-3 rounded-lg bg-warning/10 p-3 text-sm leading-6 text-warning-strong">
          The subject details have changed since this screening. Run it again
          for an updated result.
        </p>
      ) : null}
      <div className="mt-5 border-t border-border pt-5">
        <dl className="space-y-2 text-sm leading-6">
          <div className="flex flex-wrap justify-between gap-x-4">
            <dt className="font-medium text-ink-soft">Top risk score</dt>
            <dd className="font-mono tabular-nums text-ink">
              {result.topRiskScore === null
                ? "Not returned"
                : result.topRiskScore.toFixed(2)}
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-x-4">
            <dt className="font-medium text-ink-soft">Total matches</dt>
            <dd className="font-mono tabular-nums text-ink">
              {result.totalHits}
            </dd>
          </div>
        </dl>
        <p className="mt-2 text-xs leading-5 text-ink-soft">
          Scores and match counts are review signals, not decisions.
        </p>
      </div>
      <div className="mt-5 border-t border-border pt-5">
        <h3 className="text-sm font-semibold text-ink">Datasets searched</h3>
        {result.datasets.length ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {result.datasets.map((dataset, index) => (
              <li
                key={`${dataset}-${index}`}
                className="rounded-md bg-ink/[0.06] px-2.5 py-1 font-mono text-xs text-ink"
              >
                {dataset}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            No datasets were returned.
          </p>
        )}
      </div>
      <p className="mt-5 border-t border-border pt-5 text-xs leading-5 text-ink-soft">
        The service records this screening on the account. A screening result
        never approves or declines the account; verification decisions remain a
        separate review.
      </p>
    </section>
  );
}
