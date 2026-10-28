"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowRight01Icon,
  CheckListIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useState } from "react";

import {
  isApplicationFeePaid,
  readApplicationFee,
  type DraftApplicationFee,
} from "@/features/campaigns/lib/application-fee";

/**
 * The review step's paid actions.
 *
 * The API is the gate: this component only explains the state it was given and
 * sends one request at a time. A fee is never inferred from a button click, and
 * the submit call names the charge the creator paid so the API can verify it
 * belongs to this campaign (FR-311).
 */

type BusyAction = "fee" | "submit" | null;

function readErrorMessage(payload: unknown, fallback: string): string {
  const envelope =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as { error?: unknown })
      : null;
  const error =
    envelope?.error && typeof envelope.error === "object"
      ? (envelope.error as {
          message?: unknown;
          details?: { blockers?: unknown };
        })
      : null;

  const message =
    typeof error?.message === "string" && error.message.length > 0
      ? error.message
      : fallback;
  const blockers = Array.isArray(error?.details?.blockers)
    ? error.details.blockers.filter(
        (item): item is string => typeof item === "string",
      )
    : [];

  return blockers.length > 0 ? `${message} ${blockers.join(" ")}` : message;
}

function formatFee(fee: DraftApplicationFee | null): string {
  if (!fee || fee.amount <= 0) return "Set by Inverge";
  try {
    return new Intl.NumberFormat("en-NG", {
      currency: fee.currency,
      maximumFractionDigits: 2,
      style: "currency",
    }).format(fee.amount);
  } catch {
    return `${fee.currency} ${fee.amount.toLocaleString("en-NG")}`;
  }
}

export function CampaignReviewSubmission({
  applicationFee,
  campaignId,
  campaignStatus,
  onFeeChange,
  payBlockedReason,
  readyToSubmit,
  reviewStatus,
  submitBlockedReason,
}: {
  applicationFee: DraftApplicationFee | null;
  campaignId: string | null;
  campaignStatus: string;
  onFeeChange: (fee: DraftApplicationFee) => void;
  /** Why payment cannot start yet, or null when it can. */
  payBlockedReason: string | null;
  /** Every non-fee submission check has passed. */
  readyToSubmit: boolean;
  reviewStatus: string | null;
  /** Why submission cannot start yet, or null when it can. */
  submitBlockedReason: string | null;
}) {
  const [busy, setBusy] = useState<BusyAction>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const feePaid = isApplicationFeePaid(applicationFee);
  const changesRequested =
    campaignStatus === "IN_REVIEW" && reviewStatus === "CHANGES_REQUESTED";
  const reviewClosed = campaignStatus !== "DRAFT" && !changesRequested;
  const canPay = campaignId !== null && payBlockedReason === null;
  const canSubmit =
    campaignId !== null &&
    feePaid &&
    readyToSubmit &&
    !reviewClosed &&
    !submitted;

  async function payFee() {
    if (!campaignId) {
      setError(payBlockedReason ?? "Save the draft before paying the fee.");
      return;
    }

    // A pending checkout already exists. Resume it rather than asking the API
    // to start another non-refundable charge.
    if (applicationFee?.status === "PENDING" && applicationFee.redirectUrl) {
      window.location.assign(applicationFee.redirectUrl);
      return;
    }

    setBusy("fee");
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(
        `/api/campaigns/${encodeURIComponent(campaignId)}/application-fee`,
        {
          cache: "no-store",
          credentials: "same-origin",
          method: "POST",
          signal: AbortSignal.timeout(15_000),
        },
      );
      const payload = (await response.json().catch(() => null)) as unknown;

      if (!response.ok) {
        setError(
          readErrorMessage(
            payload,
            "The application fee could not be started. No charge was made from this screen.",
          ),
        );
        return;
      }

      const next = readApplicationFee(payload);
      if (!next) {
        setError(
          "Inverge returned an application-fee response this build cannot read. Check the campaign before trying again.",
        );
        return;
      }

      onFeeChange(next);

      if (next.status === "PENDING") {
        if (next.redirectUrl) {
          window.location.assign(next.redirectUrl);
          return;
        }
        setError(
          "The payment is pending but has no resumable checkout link. Contact support before trying another payment.",
        );
        return;
      }

      if (next.status === "SUCCEEDED") {
        setNotice("Payment confirmed. You can submit the campaign now.");
        return;
      }

      setError("The payment did not start. Try again.");
    } catch {
      setError(
        "The payment could not reach Inverge. No charge was made from this screen.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function submit() {
    if (!campaignId) {
      setError("Save the draft before submitting it for review.");
      return;
    }

    setBusy("submit");
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(
        `/api/campaigns/${encodeURIComponent(campaignId)}/submit`,
        {
          body: JSON.stringify(
            applicationFee?.chargeId
              ? { applicationFeeChargeId: applicationFee.chargeId }
              : {},
          ),
          cache: "no-store",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          method: "POST",
          signal: AbortSignal.timeout(15_000),
        },
      );
      const payload = (await response.json().catch(() => null)) as unknown;

      if (!response.ok) {
        setError(
          readErrorMessage(
            payload,
            "The campaign could not be submitted for review.",
          ),
        );
        return;
      }

      setSubmitted(true);
    } catch {
      setError(
        "The submission could not reach Inverge. The draft is unchanged; try again.",
      );
    } finally {
      setBusy(null);
    }
  }

  if (submitted || reviewClosed) {
    return (
      <div className="rounded-2xl border border-brand/30 bg-brand/[0.06] p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <HugeiconsIcon
            icon={CheckListIcon}
            size={16}
            strokeWidth={1.9}
            aria-hidden="true"
            className="text-brand-strong"
          />
          {submitted
            ? "Campaign submitted for review"
            : "This campaign is no longer a draft"}
        </p>
        <p className="mt-1.5 text-sm leading-6 text-muted">
          {submitted
            ? "It is now in the curation queue. You will see a change request or a decision in Creator Studio."
            : "Check its current review state in Creator Studio. A campaign can only be submitted while it is a draft or after changes were requested."}
        </p>
        <Link
          href="/d/creator/campaigns"
          className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Back to campaigns
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={15}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {changesRequested ? (
        <p className="rounded-2xl border border-warning/30 bg-warning/[0.07] p-4 text-sm leading-6 text-ink">
          Changes were requested. Edit the draft, save it, and submit it again.
          The application fee is already paid and is not charged twice.
        </p>
      ) : null}

      <div className="rounded-2xl border border-border bg-canvas p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-sm font-semibold text-ink">Application fee</p>
          <p className="text-sm font-semibold tabular-nums text-ink">
            {formatFee(applicationFee)}
          </p>
        </div>

        {feePaid ? (
          <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-muted">
            <HugeiconsIcon
              icon={CheckListIcon}
              size={15}
              strokeWidth={1.9}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-brand-strong"
            />
            Paid and linked to this campaign. The fee is non-refundable and does
            not count toward the campaign total.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm leading-6 text-muted">
              A flat, non-refundable fee paid before the campaign joins the
              review queue. It is not campaign funding, is not credited to the
              campaign, and is not returned if the campaign is not approved
              (FR-311).
            </p>
            {applicationFee?.status === "PENDING" ? (
              <p className="mt-2 rounded-xl border border-warning/30 bg-warning/[0.07] px-3 py-2 text-xs leading-5 text-ink">
                Checkout is already open from a previous attempt. Resume it
                instead of starting a second payment.
              </p>
            ) : null}
            {applicationFee?.status === "FAILED" ? (
              <p className="mt-2 rounded-xl border border-warning/30 bg-warning/[0.07] px-3 py-2 text-xs leading-5 text-ink">
                The previous payment did not complete. You can try again.
              </p>
            ) : null}

            <button
              type="button"
              onClick={payFee}
              disabled={!canPay || busy !== null}
              aria-describedby={canPay ? undefined : "application-fee-blocked"}
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === "fee"
                ? "Starting payment…"
                : applicationFee?.status === "PENDING"
                  ? "Resume payment"
                  : applicationFee?.status === "FAILED"
                    ? "Try payment again"
                    : "Pay application fee"}
            </button>
            {!canPay ? (
              <p
                id="application-fee-blocked"
                className="mt-2 text-xs leading-5 text-muted"
              >
                {payBlockedReason ??
                  "The draft must be saved before the fee can be paid."}
              </p>
            ) : null}
          </>
        )}
      </div>

      {notice ? (
        <p
          className="rounded-2xl border border-brand/30 bg-brand/[0.06] p-3 text-sm leading-6 text-ink"
          role="status"
        >
          {notice}
        </p>
      ) : null}

      {error ? (
        <div
          className="rounded-2xl border border-danger/40 bg-danger/[0.06] p-3"
          role="alert"
        >
          <p className="flex items-start gap-2 text-sm leading-6 text-ink">
            <HugeiconsIcon
              icon={Alert02Icon}
              size={15}
              strokeWidth={1.9}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-danger"
            />
            {error}
          </p>
        </div>
      ) : null}

      <div className="border-t border-border pt-4">
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit || busy !== null}
          aria-describedby={canSubmit ? undefined : "submit-blocked"}
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy === "submit" ? "Submitting…" : "Submit for review"}
        </button>
        <p id="submit-blocked" className="mt-2 text-xs leading-5 text-muted">
          {canSubmit
            ? "Submission sends the saved draft to curation review."
            : (submitBlockedReason ??
              "The remaining checks must pass before submission.")}
        </p>
      </div>
    </div>
  );
}
