"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  CloudUploadIcon,
  Link01Icon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";

import { Amount } from "@/components/ui/amount";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PrototypeNotice } from "@/features/campaigns/components/prototype-notice";
import { MilestonePill } from "@/features/campaigns/components/campaign-status-pill";
import { formatBps } from "@/features/campaigns/lib/amounts";
import { nextDraftId } from "@/features/campaigns/lib/wizard";
import type { CampaignMilestone } from "@/features/campaigns/types";
import type { MoneyAmount } from "@/lib/money";

/**
 * A milestone claim.
 *
 * Two product rules shape this form. Evidence is fixed when the campaign is
 * approved (FR-302), so the requirement is shown read-only and the creator
 * attaches against it rather than rewriting it. And a submission is not a
 * release: on submit the claim enters the objection window (FR-602), so the
 * success state here says exactly that and promises no money.
 *
 * Nothing is uploaded or persisted — there is no storage layer in this build —
 * so the form runs to its end and states plainly that no claim was filed.
 */

type DraftEvidenceItem = { id: string; label: string; href: string };

function isValidHref(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value.trim());
}

export function MilestoneClaimForm({
  milestone,
  tranche,
  objectionWindowDays,
}: {
  milestone: CampaignMilestone;
  tranche: MoneyAmount;
  objectionWindowDays: number | null;
}) {
  const [items, setItems] = useState<readonly DraftEvidenceItem[]>([]);
  const [attached, setAttached] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function addItem() {
    setItems((current) => [
      ...current,
      { href: "", id: nextDraftId("evidence"), label: "" },
    ]);
  }

  function updateItem(id: string, patch: Partial<DraftEvidenceItem>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  const labelError = (item: DraftEvidenceItem) =>
    attempted && !item.label.trim() ? "Give this item a label." : null;

  const hrefError = (item: DraftEvidenceItem) =>
    attempted && !isValidHref(item.href)
      ? "Enter a link beginning with http:// or https://"
      : null;

  const canSubmit =
    items.length > 0 &&
    items.every((item) => item.label.trim() && isValidHref(item.href)) &&
    attached;

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-brand/10 text-brand-strong">
            <HugeiconsIcon
              icon={CheckmarkCircle01Icon}
              size={18}
              strokeWidth={2}
              aria-hidden="true"
            />
          </span>
          <h3 className="text-base font-bold tracking-[-0.02em] text-ink">
            Preview complete — no claim was filed
          </h3>
        </div>

        <p className="mt-3 text-sm leading-6 text-muted">
          The form ran to the end so you can see every step, but this build has
          no evidence storage and no escrow connection, so nothing was uploaded
          and no claim exists. In a live build, submitting here would open{" "}
          {objectionWindowDays === null
            ? "the campaign's published objection window"
            : `a ${objectionWindowDays}-day objection window`}{" "}
          before any funds could move.
        </p>

        <dl className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted">Milestone</dt>
            <dd className="font-medium text-ink">
              {milestone.sequence}. {milestone.title}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted">Tranche held</dt>
            <dd className="font-medium tabular-nums text-ink">
              <Amount value={tranche} />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted">Evidence gathered</dt>
            <dd className="text-right font-medium text-ink">
              {items.length === 1 ? "1 item" : `${items.length} items`}
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => {
            setAttempted(false);
            setAttached(false);
            setItems([]);
            setSubmitted(false);
          }}
          className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Start again
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setAttempted(true);
        if (canSubmit) setSubmitted(true);
      }}
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
            Milestone {milestone.sequence} ·{" "}
            {formatBps(milestone.allocationBps)}
          </p>
          <h3 className="mt-1 text-base font-bold tracking-[-0.02em] text-ink">
            {milestone.title}
          </h3>
        </div>
        <MilestonePill state={milestone.state} size="xs" />
      </div>

      <div className="mt-3 rounded-xl border border-border bg-canvas p-3.5">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
          Evidence this claim will be judged against
        </p>
        <p className="mt-1.5 text-sm leading-6 text-ink">
          {milestone.evidence}
        </p>
        <p className="mt-1.5 text-xs leading-5 text-muted">
          Fixed when the campaign was approved (FR-302). You cannot change it
          here.
        </p>
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-ink">
            Evidence links{" "}
            <span className="text-xs font-normal text-muted">at least one</span>
          </p>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <HugeiconsIcon
              icon={Link01Icon}
              size={14}
              strokeWidth={1.9}
              aria-hidden="true"
              className="text-muted"
            />
            Add a link
          </button>
        </div>

        {items.length === 0 ? (
          <p
            className={`mt-2 rounded-xl border border-dashed px-3.5 py-3 text-xs leading-5 ${
              attempted
                ? "border-danger/50 bg-danger/[0.05] text-ink"
                : "border-border-strong bg-canvas text-muted"
            }`}
          >
            {attempted
              ? "Attach at least one artefact before submitting."
              : "Add a link to each artefact that proves this deliverable — a repository, a document, a published post, or a photo set."}
          </p>
        ) : (
          <ul className="mt-2 space-y-3">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="rounded-xl border border-border bg-canvas p-3.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                    Item {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      size={13}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    Remove
                  </button>
                </div>

                <div className="mt-2 space-y-3">
                  <Field label="Link" error={hrefError(item)}>
                    {({ describedBy, id, invalid }) => (
                      <Input
                        id={id}
                        type="url"
                        inputMode="url"
                        autoComplete="off"
                        placeholder="https://"
                        value={item.href}
                        aria-describedby={describedBy || undefined}
                        aria-invalid={invalid || undefined}
                        onChange={(event) =>
                          updateItem(item.id, { href: event.target.value })
                        }
                      />
                    )}
                  </Field>

                  <Field label="What it shows" error={labelError(item)}>
                    {({ describedBy, id, invalid }) => (
                      <Input
                        id={id}
                        autoComplete="off"
                        placeholder="What this artefact proves"
                        value={item.label}
                        aria-describedby={describedBy || undefined}
                        aria-invalid={invalid || undefined}
                        onChange={(event) =>
                          updateItem(item.id, { label: event.target.value })
                        }
                      />
                    )}
                  </Field>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4">
        <label
          className={`flex cursor-pointer gap-3 rounded-xl border p-3.5 text-sm leading-6 ${
            attempted && !attached
              ? "border-danger bg-danger/[0.05]"
              : "border-border bg-surface hover:border-brand/35"
          }`}
        >
          <input
            type="checkbox"
            checked={attached}
            onChange={(event) => setAttached(event.target.checked)}
            className="mt-1 size-5 shrink-0 rounded border-border accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          />
          <span className="text-ink">
            Every artefact the definition above requires is attached and is
            complete.
          </span>
        </label>
        {attempted && !attached ? (
          <p className="mt-1.5 text-xs font-medium text-danger">
            Confirm the evidence is complete before submitting.
          </p>
        ) : null}
      </div>

      <div className="mt-4">
        <PrototypeNotice title="Drafts are not saved">
          This build has no storage, so closing the page loses everything here.
          Submitting runs the claim flow to its end without filing anything.
        </PrototypeNotice>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <HugeiconsIcon
            icon={CloudUploadIcon}
            size={16}
            strokeWidth={1.9}
            aria-hidden="true"
          />
          Submit claim (preview)
        </button>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <HugeiconsIcon
            icon={Alert02Icon}
            size={13}
            strokeWidth={1.9}
            aria-hidden="true"
          />
          Submitting does not release funds.
        </p>
      </div>
    </form>
  );
}
