"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowLeft02Icon,
  ArrowRight01Icon,
  Award01Icon,
  CheckmarkCircle01Icon,
  InformationCircleIcon,
  LockKeyIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { Amount } from "@/components/ui/amount";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/ui/pill";
import { MediaImage } from "@/features/campaigns/components/media-image";
import { PrototypeNotice } from "@/features/campaigns/components/prototype-notice";
import { RewardFulfilmentLine } from "@/features/campaigns/components/reward-fulfilment-line";
import { StepRail } from "@/features/campaigns/components/step-rail";
import {
  additionalSupportAmount,
  contributionAmount,
  contributionSummaryLine,
  emptyContributionDraft,
  handoffStates,
  planShareFor,
  quoteLines,
  routeAvailability,
  selectedTier,
  shippingRegions,
  validateContributionStep,
  visibleContributionSteps,
  type ContributionDraft,
  type ContributionIssue,
  type ContributionStepId,
} from "@/features/campaigns/lib/contribution";
import { workingCapitalSentence } from "@/features/campaigns/lib/escrow";
import type { Campaign, SupportTier } from "@/features/campaigns/types";

/**
 * The contribution flow.
 *
 * A real flow with a real stopping point: it walks a backer through the reward,
 * anything the reward needs configured, the payment route, and the terms exactly
 * as the product will, and then stops short of moving money because this build
 * has no wallet and no provider. The final state says that plainly rather than
 * showing a success screen, because a demo that fakes a confirmed payment on a
 * crowdfunding page teaches the wrong thing about what a confirmation means.
 *
 * The naira route is listed and blocked with its reason. Hiding it would suggest
 * the product does not support naira; showing it as available would invent a
 * rate. Blocked-and-explained is the only honest third option (§9, FR-402).
 *
 * The flow owns selection, configuration, and the total. It owns no payment
 * step, no address collection, and no shipping price: the first belongs to the
 * provider this build has not connected, and the second and third to a
 * fulfilment process the campaign model does not carry.
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
            ? "border-danger bg-danger/5"
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

/**
 * One selectable reward.
 *
 * Selection is a real radio, so keyboard users get arrow-key movement and a
 * screen reader announces the group. The chosen option also shows a worded
 * "Selected" badge, because a border colour alone is not a selected state.
 */
function RewardChoice({
  onSelect,
  selected,
  tier,
}: {
  onSelect: () => void;
  selected: boolean;
  tier: SupportTier;
}) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-2xl border p-3.5 transition-colors ${
        selected
          ? "border-brand/45 bg-brand/6"
          : "border-border bg-surface hover:border-brand/35"
      }`}
    >
      <input
        type="radio"
        name="reward-choice"
        value={tier.id}
        checked={selected}
        onChange={onSelect}
        className="mt-1 size-5 shrink-0 accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      />

      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-brand/8">
        {tier.image ? (
          <MediaImage
            alt={`${tier.title} reward`}
            className="object-cover"
            sizes="80px"
            src={tier.image}
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-brand-strong/55">
            <HugeiconsIcon
              icon={Award01Icon}
              size={24}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="text-sm font-bold tracking-[-0.015em] text-ink">
            {tier.title}
          </span>
          <span className="text-sm font-bold text-ink">
            <Amount value={tier.minimum} />
          </span>
        </span>

        <span className="mt-1 block text-sm leading-6 text-muted">
          {tier.description}
        </span>

        <RewardFulfilmentLine className="mt-2" tier={tier} />

        {selected ? (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[0.6875rem] font-semibold text-brand-strong">
            <HugeiconsIcon
              icon={CheckmarkCircle01Icon}
              size={12}
              strokeWidth={2.4}
              aria-hidden="true"
            />
            Selected
          </span>
        ) : null}
      </div>
    </label>
  );
}

export function ContributionPreview({
  campaign,
  initialTierId = null,
}: {
  campaign: Campaign;
  /**
   * A reward tier preselected from the campaign page. Ignored unless the id
   * matches a tier this campaign publishes, so a hand-edited query string cannot
   * put the flow into a state the campaign does not offer.
   */
  initialTierId?: string | null;
}) {
  const [stepId, setStepId] = useState<ContributionStepId>("reward");
  const [draft, setDraft] = useState<ContributionDraft>(() => ({
    ...emptyContributionDraft,
    route: "usdc-wallet",
    tierId: campaign.supportTiers.some((tier) => tier.id === initialTierId)
      ? (initialTierId ?? "")
      : "",
  }));
  const [issues, setIssues] = useState<readonly ContributionIssue[]>([]);
  const [reachedHandoff, setReachedHandoff] = useState(false);

  /**
   * The steps that apply right now. The Delivery step exists only while the
   * selected reward actually ships, so choosing a digital reward removes it
   * rather than leaving an empty question behind.
   */
  const steps = visibleContributionSteps(draft, campaign);
  const stepIndex = Math.max(
    steps.findIndex((candidate) => candidate.id === stepId),
    0,
  );
  const step = steps[stepIndex] ?? steps[0];
  if (!step) throw new Error("Contribution step index out of range");
  const currentId = step.id;

  const amount = contributionAmount(draft, campaign);
  const tier = selectedTier(draft, campaign);
  const regions = shippingRegions(draft, campaign);
  const support = additionalSupportAmount(draft);
  const route =
    routeAvailability(campaign).find(
      (option) => option.route === draft.route,
    ) ?? null;
  const quote = quoteLines(draft, campaign);

  function update(patch: Partial<ContributionDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
    setIssues([]);
  }

  function errorFor(field: string): string | null {
    return issues.find((issue) => issue.field === field)?.message ?? null;
  }

  function next() {
    const found = validateContributionStep(draft, campaign, currentId);

    if (found.length > 0) {
      setIssues(found);
      return;
    }

    setIssues([]);
    const following = steps[stepIndex + 1];
    if (following) setStepId(following.id);
    else setReachedHandoff(true);
  }

  function back() {
    setIssues([]);
    const previous = steps[stepIndex - 1];
    if (previous) setStepId(previous.id);
  }

  const goTo = (index: number) => {
    const target = steps[index];
    if (target) setStepId(target.id);
  };

  if (reachedHandoff) {
    return (
      <div className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
        <span className="grid size-11 place-items-center rounded-2xl bg-warning/[0.14] text-warning-strong">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            size={22}
            strokeWidth={2}
            aria-hidden="true"
          />
        </span>
        <h2 className="mt-3 text-xl font-bold tracking-[-0.03em] text-ink">
          Payment is not connected in this build
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          The flow ran to the end so you can see every step. Nothing was
          submitted: this build has no wallet connection and no payment
          provider, so no contribution exists, no money moved, and no
          transaction was created.
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

        <div className="mt-5 rounded-2xl border border-border bg-canvas p-4">
          <p className="text-sm font-semibold text-ink">
            What would happen with a provider connected
          </p>
          <ol className="mt-2.5 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-muted">
            <li>
              Inverge records the contribution and asks the provider for a
              hosted payment session.
            </li>
            <li>
              You finish paying inside the provider&rsquo;s own flow, including
              any identity checks it requires.
            </li>
            <li>
              You come back here, and Inverge reads the provider&rsquo;s real
              status instead of assuming the payment worked.
            </li>
          </ol>
          <p className="mt-3 text-xs leading-5 text-muted">
            The flow is built to show these states rather than skip them:{" "}
            {handoffStates.join(" · ")}.
          </p>
        </div>

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
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
      <div className="min-w-0">
        <StepRail currentIndex={stepIndex} onGoTo={goTo} steps={steps} />

        <div className="mt-6 rounded-3xl border border-border bg-surface p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-strong">
            Step {stepIndex + 1} of {steps.length}
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-[-0.03em] text-ink sm:text-2xl">
            {step.title}
          </h2>
          <p className="mt-1.5 text-sm leading-6 text-muted">
            {step.description}
          </p>

          {currentId === "reward" ? (
            <div className="mt-6 space-y-5">
              {campaign.supportTiers.length > 0 ? (
                <fieldset>
                  <legend className="text-sm font-medium text-ink">
                    Choose a reward{" "}
                    <span className="text-xs font-normal text-muted">
                      optional
                    </span>
                  </legend>

                  <p className="mt-1.5 text-xs leading-5 text-muted">
                    A reward changes what the creator sends you. It does not
                    change how the funding works: the contribution still goes to
                    the campaign&rsquo;s escrow and is released against approved
                    milestones.
                  </p>

                  <div className="mt-3 space-y-3">
                    {campaign.supportTiers.map((option) => (
                      <RewardChoice
                        key={option.id}
                        onSelect={() =>
                          update({
                            shippingRegion:
                              option.id === draft.tierId
                                ? draft.shippingRegion
                                : "",
                            tierId: option.id,
                          })
                        }
                        selected={draft.tierId === option.id}
                        tier={option}
                      />
                    ))}

                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition-colors ${
                        draft.tierId === ""
                          ? "border-brand/45 bg-brand/6"
                          : "border-border bg-surface hover:border-brand/35"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reward-choice"
                        value=""
                        checked={draft.tierId === ""}
                        onChange={() =>
                          update({ shippingRegion: "", tierId: "" })
                        }
                        className="size-5 shrink-0 accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-ink">
                          Contribute without a reward
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-muted">
                          Your contribution still funds the campaign. Nothing is
                          sent to you, and you choose the amount.
                        </span>
                      </span>
                    </label>
                  </div>

                  {errorFor("tierId") ? (
                    <p className="mt-2 text-xs font-medium text-danger">
                      {errorFor("tierId")}
                    </p>
                  ) : null}
                </fieldset>
              ) : (
                <p className="rounded-xl border border-border bg-canvas p-3.5 text-xs leading-5 text-muted">
                  This campaign is donation-based and offers no rewards. A
                  contribution is a contribution to the work, not a purchase, so
                  you choose the amount you want to give.
                </p>
              )}

              {tier ? (
                <div className="rounded-2xl border border-border bg-canvas p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium text-ink">
                      Reward amount
                    </p>
                    <p className="text-lg font-bold tabular-nums text-ink">
                      <Amount value={tier.minimum} />
                    </p>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Set by the creator for {tier.title}. It is the amount that
                    selects this reward, not a price for postage or a fee.
                  </p>

                  <div className="mt-4">
                    <Field
                      label="Additional support (optional)"
                      help="Added on top of the reward amount. It is an extra contribution to the campaign, not an extra reward."
                      error={errorFor("supportInput")}
                    >
                      {({ describedBy, id, invalid }) => (
                        <Input
                          id={id}
                          inputMode="decimal"
                          autoComplete="off"
                          placeholder="0.00"
                          value={draft.supportInput}
                          aria-describedby={describedBy || undefined}
                          aria-invalid={invalid || undefined}
                          onChange={(event) =>
                            update({ supportInput: event.target.value })
                          }
                        />
                      )}
                    </Field>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-border pt-3">
                    <p className="text-sm font-medium text-ink">
                      Contribution amount
                    </p>
                    <p className="text-base font-bold tabular-nums text-ink">
                      {amount ? <Amount value={amount} /> : "—"}
                    </p>
                  </div>
                </div>
              ) : (
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
              )}

              {amount ? (
                <p className="rounded-xl border border-border bg-canvas p-3.5 text-xs leading-5 text-muted">
                  {planShareFor(amount, campaign)}.
                </p>
              ) : null}
            </div>
          ) : null}

          {currentId === "options" && tier ? (
            <div className="mt-6 space-y-5">
              <div className="rounded-2xl border border-border bg-canvas p-4">
                <p className="text-sm font-semibold text-ink">{tier.title}</p>
                <RewardFulfilmentLine className="mt-2" tier={tier} />
              </div>

              <fieldset>
                <legend className="text-sm font-medium text-ink">
                  Where should it be sent?
                </legend>
                <div className="mt-2.5 space-y-2.5">
                  {regions.map((region) => {
                    const active = draft.shippingRegion === region;

                    return (
                      <label
                        key={region}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition-colors ${
                          active
                            ? "border-brand/45 bg-brand/6"
                            : "border-border bg-surface hover:border-brand/35"
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping-region"
                          value={region}
                          checked={active}
                          onChange={() => update({ shippingRegion: region })}
                          className="size-5 shrink-0 accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        />
                        <span className="text-sm font-medium text-ink">
                          {region}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {errorFor("shippingRegion") ? (
                  <p className="mt-2 text-xs font-medium text-danger">
                    {errorFor("shippingRegion")}
                  </p>
                ) : null}
              </fieldset>

              <p className="rounded-xl border border-border bg-canvas p-3.5 text-xs leading-5 text-muted">
                {tier.shipping?.terms
                  ? `${tier.shipping.terms} `
                  : "The creator has not added shipping terms. "}
                Inverge quotes no postage and this build collects no delivery
                address, so shipping is never added to the amount above.
              </p>

              <p className="rounded-xl border border-border bg-canvas p-3.5 text-xs leading-5 text-muted">
                If your destination is not listed, the creator has not said they
                will post there, so this reward may not reach you. Only pick a
                destination you can actually receive it at.
              </p>
            </div>
          ) : null}

          {currentId === "settlement" ? (
            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-ink">
                How would you like to pay?
              </legend>
              <div className="mt-2.5 space-y-3">
                {routeAvailability(campaign).map((option) => {
                  const active = draft.route === option.route;

                  return (
                    <div key={option.route}>
                      <label
                        className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors ${
                          active
                            ? "border-brand/45 bg-brand/6"
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
                        <p className="mt-1.5 flex gap-2 rounded-xl bg-warning/8 px-3.5 py-2.5 text-xs leading-5 text-muted">
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

          {currentId === "disclosures" ? (
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
                    fails to reach its target by the funding deadline, unless it
                    has already been released as the working-capital tranche
                    described above.
                  </li>
                  {tier ? (
                    <li>
                      A reward is a promise from the creator, not from Inverge.
                      Inverge does not make the item, ship it, guarantee a
                      delivery date, or quote postage for it.
                    </li>
                  ) : null}
                </ul>
              </div>

              <Acknowledgement
                checked={draft.acknowledgeTerms}
                error={errorFor("acknowledgeTerms")}
                onChange={(acknowledgeTerms) => update({ acknowledgeTerms })}
              >
                I have read the terms above, including how the working-capital
                tranche is released and is not refundable.
              </Acknowledgement>
            </div>
          ) : null}

          {currentId === "review" ? (
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
                This is a design preview. There is no wallet connection and no
                payment provider in this build, so continuing shows the handoff
                state without submitting anything.
              </PrototypeNotice>

              <Acknowledgement
                checked={draft.acknowledgeDemo}
                error={errorFor("acknowledgeDemo")}
                onChange={(acknowledgeDemo) => update({ acknowledgeDemo })}
              >
                I understand this is a preview and that no contribution will be
                made.
              </Acknowledgement>
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-border pt-5">
            <dl className="mr-auto flex items-baseline gap-2 text-sm lg:hidden">
              <dt className="text-muted">Contribution</dt>
              <dd className="font-semibold tabular-nums text-ink">
                {amount ? <Amount value={amount} /> : "—"}
              </dd>
            </dl>

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
              {currentId === "review" ? "Continue to payment" : "Continue"}
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

          <div className="mt-4 border-t border-border pt-4">
            {tier ? (
              <div className="flex gap-3">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-brand/8">
                  {tier.image ? (
                    <MediaImage
                      alt=""
                      className="object-cover"
                      sizes="48px"
                      src={tier.image}
                    />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center text-brand-strong/55">
                      <HugeiconsIcon
                        icon={Award01Icon}
                        size={18}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </span>
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{tier.title}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    <Amount value={tier.minimum} /> reward
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm font-medium text-ink">
                No reward — a contribution to the work
              </p>
            )}

            {support ? (
              <div className="mt-2 flex items-baseline justify-between gap-3 text-xs">
                <span className="text-muted">Additional support</span>
                <span className="font-medium tabular-nums text-ink">
                  <Amount value={support} />
                </span>
              </div>
            ) : null}
          </div>

          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted">Contribution</dt>
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
            {regions.length > 0 ? (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted">Delivering to</dt>
                <dd className="max-w-[62%] text-right font-medium text-ink">
                  {draft.shippingRegion || "Not chosen"}
                </dd>
              </div>
            ) : null}
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
