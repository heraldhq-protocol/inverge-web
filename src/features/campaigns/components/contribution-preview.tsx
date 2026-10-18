"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowLeft02Icon,
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
  LockKeyIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { Amount } from "@/components/ui/amount";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/ui/pill";
import { StepRail } from "@/features/campaigns/components/step-rail";
import {
  emptyContributionDraft,
  contributionAmount,
  contributionSteps,
  contributionSummaryLine,
  planShareFor,
  quoteLines,
  routeAvailability,
  selectedTier,
  validateContributionStep,
  type ContributionDraft,
  type ContributionIssue,
} from "@/features/campaigns/lib/contribution";
import { workingCapitalSentence } from "@/features/campaigns/lib/escrow";
import { PrototypeNotice } from "@/features/campaigns/components/prototype-notice";
import type { Campaign } from "@/features/campaigns/types";
import { formatMoney } from "@/lib/money";

/**
 * The contribution flow.
 *
 * A real flow with a real stopping point: it walks a backer through the amount,
 * the payment route, and the terms exactly as the product will, and then stops
 * short of moving money because this build has no wallet and no provider. The
 * final step states that plainly rather than showing a success screen, because a
 * demo that fakes a confirmed payment on a crowdfunding page teaches the wrong
 * thing about what a confirmation means.
 *
 * The naira route is listed and blocked with its reason. Hiding it would suggest
 * the product does not support naira; showing it as available would invent a
 * rate. Blocked-and-explained is the only honest third option (§9, FR-402).
 */

function Acknowledgement({
  checked,
  error,
  onChange,
  children,
}: {
  checked: boolean;
  error?: string | null;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        className={`flex cursor-pointer gap-3 rounded-xl border p-3.5 text-sm leading-6 ${
          error
            ? "border-danger bg-danger/[0.05]"
            : "border-border bg-surface hover:border-brand/35"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 size-5 shrink-0 rounded border-border accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
        <span className="text-ink">{children}</span>
      </label>
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>
      ) : null}
    </div>
  );
}

export function ContributionPreview({ campaign }: { campaign: Campaign }) {
  const routes = routeAvailability(campaign);
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<ContributionDraft>({
    ...emptyContributionDraft,
    route: "usdc-wallet",
  });
  const [issues, setIssues] = useState<readonly ContributionIssue[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const step = contributionSteps[stepIndex];
  if (!step) throw new Error("Contribution step index out of range");
  // Captured for the handlers below: TypeScript does not carry the narrowing
  // above into a closure body.
  const stepId = step.id;

  const amount = contributionAmount(draft);
  const tier = selectedTier(draft, campaign);
  const route = routes.find((option) => option.route === draft.route) ?? null;

  function update(patch: Partial<ContributionDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
    setIssues([]);
  }

  function errorFor(field: string): string | null {
    return issues.find((issue) => issue.field === field)?.message ?? null;
  }

  function next() {
    const found = validateContributionStep(draft, campaign, stepId);

    if (found.length > 0) {
      setIssues(found);
      return;
    }

    setIssues([]);
    if (stepIndex < contributionSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setSubmitted(true);
    }
  }

  function back() {
    setIssues([]);
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  const quote = quoteLines(draft, campaign);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
      <div className="min-w-0">
        <StepRail
          currentIndex={stepIndex}
          onGoTo={(index) => setStepIndex(index)}
          steps={contributionSteps}
        />

        <div className="mt-6">
          {submitted ? (
            <div className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
              <span className="grid size-11 place-items-center rounded-2xl bg-brand/10 text-brand-strong">
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  size={22}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </span>
              <h2 className="mt-3 text-xl font-bold tracking-[-0.03em] text-ink">
                Preview complete — nothing was submitted
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                The flow ran to the end so you can see every step, but this
                build has no wallet connection and no payment provider, so no
                contribution exists, no money moved, and no transaction was
                created.
              </p>

              <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                {quote.map((line) => (
                  <div
                    key={line.label}
                    className="flex items-baseline justify-between gap-4"
                  >
                    <dt className="text-muted">{line.label}</dt>
                    <dd
                      className={`text-right font-medium ${
                        line.unknown ? "text-muted" : "text-ink"
                      }`}
                    >
                      {line.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/campaigns/${campaign.slug}`}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Back to the campaign
                </Link>
                <Link
                  href="/d/backing"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  See a backing history
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-strong">
                Step {stepIndex + 1} of {contributionSteps.length}
              </p>
              <h2 className="mt-2 text-xl font-bold tracking-[-0.03em] text-ink sm:text-2xl">
                {step.title}
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-muted">
                {step.description}
              </p>

              {step.id === "amount" ? (
                <div className="mt-6 space-y-5">
                  <Field
                    label={`Amount in ${campaign.funding.fundingAsset}`}
                    help="USDC is 1:1 with the dollar figure shown against this campaign, so the amount you enter is the amount that would settle."
                    error={errorFor("amount")}
                  >
                    {({ id, describedBy, invalid }) => (
                      <Input
                        id={id}
                        aria-describedby={describedBy || undefined}
                        aria-invalid={invalid || undefined}
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder="0.00"
                        value={draft.amountInput}
                        onChange={(event) =>
                          update({ amountInput: event.target.value })
                        }
                      />
                    )}
                  </Field>

                  {campaign.supportTiers.length > 0 ? (
                    <fieldset>
                      <legend className="text-sm font-medium text-ink">
                        Reward tier{" "}
                        <span className="text-xs font-normal text-muted">
                          optional
                        </span>
                      </legend>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => update({ tierId: "" })}
                          aria-pressed={draft.tierId === ""}
                          className={`min-h-11 rounded-xl border px-3.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                            draft.tierId === ""
                              ? "border-brand/40 bg-brand/10 font-semibold text-brand-strong"
                              : "border-border bg-surface font-medium text-ink hover:border-brand/35"
                          }`}
                        >
                          No tier
                        </button>
                        {campaign.supportTiers.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => update({ tierId: option.id })}
                            aria-pressed={draft.tierId === option.id}
                            className={`min-h-11 rounded-xl border px-3.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                              draft.tierId === option.id
                                ? "border-brand/40 bg-brand/10 font-semibold text-brand-strong"
                                : "border-border bg-surface font-medium text-ink hover:border-brand/35"
                            }`}
                          >
                            {option.title} · from {formatMoney(option.minimum)}
                          </button>
                        ))}
                      </div>
                      {tier ? (
                        <p className="mt-2 text-xs leading-5 text-muted">
                          {tier.description}
                        </p>
                      ) : null}
                    </fieldset>
                  ) : (
                    <p className="rounded-xl border border-border bg-canvas p-3.5 text-xs leading-5 text-muted">
                      This campaign has no reward tiers. Contribute any amount
                      you choose.
                    </p>
                  )}

                  {amount ? (
                    <p className="rounded-xl border border-border bg-canvas p-3.5 text-xs leading-5 text-muted">
                      {planShareFor(amount, campaign)}.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {step.id === "settlement" ? (
                <fieldset className="mt-6">
                  <legend className="text-sm font-medium text-ink">
                    How would you like to pay?
                  </legend>
                  <div className="mt-2.5 space-y-3">
                    {routes.map((option) => {
                      const active = draft.route === option.route;

                      return (
                        <div key={option.route}>
                          <label
                            className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors ${
                              active
                                ? "border-brand/45 bg-brand/[0.06]"
                                : "border-border bg-surface"
                            } ${option.available ? "hover:border-brand/35" : "cursor-not-allowed opacity-80"}`}
                          >
                            <input
                              type="radio"
                              name="settlement-route"
                              value={option.route}
                              checked={active}
                              disabled={!option.available}
                              onChange={() => update({ route: option.route })}
                              className="mt-1 size-5 shrink-0 accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                            />
                            <span className="min-w-0">
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold text-ink">
                                  {option.label}
                                </span>
                                {!option.available ? (
                                  <Pill tone="warning" size="xs">
                                    Not available yet
                                  </Pill>
                                ) : null}
                              </span>
                              <span className="mt-1 block text-sm leading-6 text-muted">
                                {option.description}
                              </span>
                            </span>
                          </label>
                          {!option.available && option.blockedReason ? (
                            <p className="mt-1.5 flex gap-2 rounded-xl bg-warning/[0.08] px-3.5 py-2.5 text-xs leading-5 text-muted">
                              <HugeiconsIcon
                                icon={Alert02Icon}
                                size={14}
                                strokeWidth={2}
                                aria-hidden="true"
                                className="mt-0.5 shrink-0 text-warning-strong"
                              />
                              {option.blockedReason}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                  {errorFor("route") ? (
                    <p className="mt-2 text-xs font-medium text-danger">
                      {errorFor("route")}
                    </p>
                  ) : null}
                </fieldset>
              ) : null}

              {step.id === "disclosures" ? (
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-border bg-canvas p-4">
                    <p className="text-sm font-semibold text-ink">
                      What you would be agreeing to
                    </p>
                    <ul className="mt-2.5 space-y-2.5 text-sm leading-6 text-muted">
                      <li>{workingCapitalSentence(campaign)}</li>
                      <li>{campaign.disclosures.failurePlan}</li>
                      <li>{campaign.disclosures.risks}</li>
                      <li>
                        Your contribution is refundable in full if the campaign
                        fails to reach its target by the funding deadline,
                        unless it has already been released as the
                        working-capital tranche described above.
                      </li>
                    </ul>
                  </div>

                  <Acknowledgement
                    checked={draft.acknowledgeTerms}
                    error={errorFor("acknowledgeTerms")}
                    onChange={(acknowledgeTerms) =>
                      update({ acknowledgeTerms })
                    }
                  >
                    I have read the terms above, including how the
                    working-capital tranche is released and is not refundable.
                  </Acknowledgement>
                </div>
              ) : null}

              {step.id === "review" ? (
                <div className="mt-6 space-y-5">
                  <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
                    {quote.map((line) => (
                      <div
                        key={line.label}
                        className="flex items-baseline justify-between gap-4 bg-surface px-4 py-3 text-sm"
                      >
                        <dt className="text-muted">{line.label}</dt>
                        <dd
                          className={`text-right font-medium ${
                            line.unknown ? "text-muted" : "text-ink"
                          }`}
                        >
                          {line.value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <p className="text-sm leading-6 text-muted">
                    {contributionSummaryLine(amount)}.
                  </p>

                  <PrototypeNotice title="No payment will be taken">
                    This is a design preview. There is no wallet connection and
                    no payment provider in this build, so confirming runs the
                    flow to its end without submitting anything.
                  </PrototypeNotice>

                  <Acknowledgement
                    checked={draft.acknowledgeDemo}
                    error={errorFor("acknowledgeDemo")}
                    onChange={(acknowledgeDemo) => update({ acknowledgeDemo })}
                  >
                    I understand this is a preview and that no contribution will
                    be made.
                  </Acknowledgement>
                </div>
              ) : null}

              <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-border pt-5">
                {stepIndex > 0 ? (
                  <button
                    type="button"
                    onClick={back}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <HugeiconsIcon
                      icon={ArrowLeft02Icon}
                      size={16}
                      strokeWidth={1.9}
                      aria-hidden="true"
                    />
                    Back
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={next}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {step.id === "review"
                    ? "Confirm contribution (preview)"
                    : "Continue"}
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={16}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                </button>

                <Link
                  href={`/campaigns/${campaign.slug}`}
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Cancel
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <aside aria-label="Contribution summary" className="lg:sticky lg:top-24">
        <div className="rounded-3xl border border-border bg-canvas p-5">
          <h2 className="text-sm font-semibold text-ink">
            You are contributing to
          </h2>
          <p className="mt-1.5 text-sm font-medium text-ink">
            {campaign.title}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            by {campaign.creator.name}
          </p>

          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted">Amount</dt>
              <dd className="font-semibold tabular-nums text-ink">
                {amount ? <Amount value={amount} /> : "—"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted">Asset</dt>
              <dd className="font-medium text-ink">
                {campaign.funding.fundingAsset}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted">Route</dt>
              <dd className="max-w-[62%] text-right font-medium text-ink">
                {route ? route.label : "Not chosen"}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex gap-2.5 rounded-xl border border-border bg-surface p-3.5">
            <HugeiconsIcon
              icon={Shield01Icon}
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-brand-strong"
            />
            <p className="text-xs leading-5 text-muted">
              Held in a campaign-specific escrow and released only against
              approved milestones. Full refund if the target is not reached.
            </p>
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
            <HugeiconsIcon
              icon={LockKeyIcon}
              size={13}
              strokeWidth={1.9}
              aria-hidden="true"
            />
            No wallet is connected in this preview.
          </p>
        </div>
      </aside>
    </div>
  );
}
