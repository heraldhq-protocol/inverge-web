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
import { CountrySelect } from "@/components/ui/country-select";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/ui/pill";
import { Select } from "@/components/ui/select";
import { MediaImage } from "@/features/campaigns/components/media-image";
import { PrototypeNotice } from "@/features/campaigns/components/prototype-notice";
import { RewardFulfilmentLine } from "@/features/campaigns/components/reward-fulfilment-line";
import { StepRail } from "@/features/campaigns/components/step-rail";
import {
  chosenDestination,
  contributionAmount,
  contributionSummaryLine,
  emptyContributionDraft,
  fulfilmentCharge,
  handoffStates,
  maxRewardQuantity,
  planShareFor,
  quoteLines,
  rewardQuantity,
  routeAvailability,
  selectedTier,
  totalDue,
  validateContributionStep,
  visibleContributionSteps,
  type ContributionDraft,
  type ContributionIssue,
  type ContributionStepId,
  type QuoteLine,
} from "@/features/campaigns/lib/contribution";
import { workingCapitalSentence } from "@/features/campaigns/lib/escrow";
import {
  destinationName,
  shippingSummary,
  type ShippingOutcome,
} from "@/features/campaigns/lib/shipping";
import type {
  Campaign,
  CountryCode,
  RewardAddOn,
  RewardVariantGroup,
  SupportTier,
} from "@/features/campaigns/types";
import {
  assessWalletFunding,
  type FundingAssessment,
} from "@/features/wallet/lib/funding";
import { formatTokenAmountWithSymbol } from "@/features/wallet/lib/token-amount";
import type { WalletFundingSnapshot } from "@/features/wallet/types";
import { normaliseCountryCode } from "@/lib/countries";
import { formatMoney } from "@/lib/money";

/**
 * The contribution flow.
 *
 * A real flow with a real stopping point: it walks a backer through the reward,
 * whatever that reward needs configured, the payment route, and the terms exactly
 * as the product will, and then stops short of moving money because this build
 * has no wallet and no provider. The final state says that plainly rather than
 * showing a success screen, because a demo that fakes a confirmed payment on a
 * crowdfunding page teaches the wrong thing about what a confirmation means.
 *
 * The naira route is listed and blocked with its reason. Hiding it would suggest
 * the product does not support naira; showing it as available would invent a
 * rate. Blocked-and-explained is the only honest third option (§9, FR-402).
 *
 * Two kinds of money are shown and never mixed. The contribution is what the
 * campaign's escrow holds and what a failed campaign refunds; postage is what
 * the creator spends on sending the reward, so it sits in the total but not in
 * the escrow. A destination the creator's rules do not cover is stated and
 * blocks the step rather than being priced from a guess, and a rate the creator
 * defers is shown as deferred rather than as a figure.
 *
 * This flow owns selection, configuration, and the totals. It owns no payment
 * step and no address collection: the first belongs to the provider this build
 * has not connected, and the second to a fulfilment process that asks for one
 * when a verified quote needs it.
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
 *
 * The card carries the creator's artwork when they supplied one. When they did
 * not, it draws the product's own reward mark rather than reusing the campaign's
 * cover: a page where every reward shows the same photograph tells a backer
 * nothing about what they are choosing between.
 */
function RewardChoice({
  asset,
  onSelect,
  selected,
  tier,
}: {
  asset: string;
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
            <span className="ml-1 text-xs font-medium text-muted">{asset}</span>
          </span>
        </span>

        <span className="mt-1 block text-sm leading-6 text-muted">
          {tier.description}
        </span>

        {tier.includes.length > 0 ? (
          <ul className="mt-2 space-y-1 pl-4 text-xs leading-5 text-muted marker:text-brand-strong/60">
            {tier.includes.map((item) => (
              <li key={item} className="list-disc">
                {item}
              </li>
            ))}
          </ul>
        ) : null}

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

/** A choice the creator requires before the reward can be sent. */
function VariantChoice({
  error,
  group,
  onChange,
  selectedId,
}: {
  error?: string | null;
  group: RewardVariantGroup;
  onChange: (optionId: string) => void;
  selectedId: string | undefined;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">{group.label}</legend>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {group.options.map((option) => (
          <label
            key={option.id}
            className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm transition-colors ${
              selectedId === option.id
                ? "border-brand/45 bg-brand/6"
                : "border-border bg-surface hover:border-brand/35"
            }`}
          >
            <input
              type="radio"
              name={`variant-${group.id}`}
              value={option.id}
              checked={selectedId === option.id}
              onChange={() => onChange(option.id)}
              className="size-4 shrink-0 accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            />
            <span className="font-medium text-ink">{option.label}</span>
          </label>
        ))}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>
      ) : null}
    </fieldset>
  );
}

/** Something the backer can take on top of the reward. */
function AddOnChoice({
  addOn,
  added,
  onToggle,
}: {
  addOn: RewardAddOn;
  added: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-2xl border p-3.5 transition-colors ${
        added
          ? "border-brand/45 bg-brand/6"
          : "border-border bg-surface hover:border-brand/35"
      }`}
    >
      <input
        type="checkbox"
        checked={added}
        onChange={onToggle}
        className="mt-1 size-5 shrink-0 rounded border-border accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      />
      {addOn.image ? (
        <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-brand/8">
          <MediaImage
            alt=""
            className="object-cover"
            sizes="48px"
            src={addOn.image}
          />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="text-sm font-semibold text-ink">{addOn.title}</span>
          <span className="text-sm font-semibold text-ink">
            <Amount value={addOn.price} />
          </span>
        </span>
        <span className="mt-1 block text-xs leading-5 text-muted">
          {addOn.description}
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-2">
          <Pill size="xs" tone={added ? "accent" : "neutral"}>
            {added ? "Added" : "Add"}
          </Pill>
          <span className="text-[0.6875rem] text-muted">
            {addOn.fulfilment === "digital"
              ? "Sent digitally — no postage"
              : `${addOn.estimatedDelivery ?? "Delivery date not stated"} · ${
                  addOn.affectsShipping
                    ? "posted separately"
                    : "goes in the same parcel"
                }`}
          </span>
        </span>
      </span>
    </label>
  );
}

/**
 * Whether the wallet balance can cover the contribution.
 *
 * Five states are kept apart because they mean different things to a backer:
 * covered and signable, covered but not signable, short, no wallet, and a wallet
 * that cannot hold the settlement asset. The sample label travels with the
 * figures so a preview balance is never mistaken for a chain read.
 */
function WalletFundingPanel({
  funding,
  sample,
}: {
  funding: FundingAssessment;
  sample: boolean;
}) {
  const presentation = {
    ready: { label: "Ready to sign", tone: "accent" },
    "signing-unavailable": { label: "Signing not connected", tone: "warning" },
    insufficient: { label: "Insufficient balance", tone: "danger" },
    "wallet-unavailable": { label: "Wallet unavailable", tone: "neutral" },
    "unsupported-asset": { label: "Asset unsupported", tone: "warning" },
  } as const satisfies Record<
    FundingAssessment["status"],
    { label: string; tone: "accent" | "danger" | "neutral" | "warning" }
  >;
  const view = presentation[funding.status];

  return (
    <div className="rounded-2xl border border-border bg-canvas p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">
          Paying from your wallet
        </p>
        <span className="flex flex-wrap items-center gap-2">
          {sample ? (
            <Pill size="xs" tone="neutral">
              Sample balance
            </Pill>
          ) : null}
          <Pill size="xs" tone={view.tone}>
            {view.label}
          </Pill>
        </span>
      </div>

      <p className="mt-1.5 text-sm leading-6 text-muted">{funding.message}</p>

      {funding.balance ? (
        <dl className="mt-2.5 grid gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted">Balance</dt>
            <dd className="font-semibold tabular-nums text-ink">
              {formatTokenAmountWithSymbol(funding.balance, {
                maxFractionDigits: 2,
              })}
            </dd>
          </div>
          {funding.required ? (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted">Required</dt>
              <dd className="font-semibold tabular-nums text-ink">
                {formatTokenAmountWithSymbol(funding.required, {
                  maxFractionDigits: 2,
                })}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {funding.status === "insufficient" ? (
        <Link
          href="/d/wallet"
          className="mt-2.5 inline-flex min-h-10 items-center rounded-lg text-sm font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Add USDC to your wallet
        </Link>
      ) : null}
    </div>
  );
}

/** The figure rows, shared by the review step, the summary, and the handoff. */
function SummaryRows({
  className = "",
  lines,
}: {
  className?: string;
  lines: readonly QuoteLine[];
}) {
  return (
    <dl className={className}>
      {lines.map((line) => (
        <div
          key={line.label}
          className="flex items-baseline justify-between gap-4 bg-surface px-4 py-3 text-sm"
        >
          <dt className="text-muted">{line.label}</dt>
          <dd
            className={`max-w-[62%] text-right font-medium ${
              line.unknown ? "text-muted" : "text-ink"
            }`}
          >
            {line.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * What the creator's rules say about shipping, before the backer continues.
 *
 * Four questions a backer is entitled to an answer to are answered separately
 * rather than folded into one sentence: whether the creator ships there, what it
 * costs or why it does not cost anything yet, when it is charged, and what
 * happens at the border. The duty wording is the creator's own, quoted; Inverge
 * calculates no duty and collects none, and says so rather than implying
 * otherwise.
 */
function ShippingDisclosure({
  country,
  outcome,
  tier,
}: {
  country: CountryCode | null;
  outcome: ShippingOutcome;
  tier: SupportTier;
}) {
  if (!tier.shipping) return null;

  const rules = shippingSummary(tier.shipping);
  const name = country === null ? null : destinationName(country);

  let heading = "Where this reward can be sent";
  let verdict =
    "The creator's own rules decide where this reward goes. Choose a country to see how it applies to you.";
  let next: string | null = null;
  let tone: "neutral" | "warning" | "ok" = "neutral";

  if (name !== null) {
    heading = `Shipping to ${name}`;
    tone = "ok";

    switch (outcome.kind) {
      case "free":
        verdict =
          "The creator charges no postage for this destination. Nothing extra is added to the amount above.";
        break;
      case "quoted":
        verdict = `The creator's own rate for this destination is ${formatMoney(
          outcome.amount,
        )}.`;
        break;
      case "deferred":
        verdict = outcome.note
          ? `Postage is not charged now: ${outcome.note}`
          : "Postage is not charged now. The creator arranges it separately and will come back to you with a figure.";
        break;
      case "unsupported":
        tone = "warning";
        verdict =
          outcome.cause === "excluded"
            ? (outcome.note ??
              `The creator has said they cannot send this reward to ${name}.`)
            : `This reward's shipping does not cover ${name}.`;
        next = `Choose another destination, or contribute without this reward.`;
        break;
      case "unchosen":
        verdict = "Choose the country this reward should be sent to.";
        break;
      case "not-required":
        break;
    }
  }

  return (
    <div className="space-y-3">
      <div
        className={`rounded-2xl border p-4 ${
          tone === "warning"
            ? "border-warning/40 bg-warning/[0.07]"
            : "border-border bg-canvas"
        }`}
      >
        <p className="flex items-start gap-2 text-sm font-semibold text-ink">
          {tone === "warning" ? (
            <HugeiconsIcon
              icon={Alert02Icon}
              size={15}
              strokeWidth={2}
              aria-hidden="true"
              className="mt-1 shrink-0 text-warning-strong"
            />
          ) : null}
          {heading}
        </p>
        <p className="mt-1.5 text-sm leading-6 text-muted">{verdict}</p>
        {next ? (
          <p className="mt-1.5 text-xs leading-5 text-muted">{next}</p>
        ) : null}

        {outcome.kind === "quoted" || outcome.kind === "free" ? (
          <p className="mt-2 text-xs leading-5 text-muted">
            These are the creator&rsquo;s own rates, not a carrier quote.
            Inverge has no carrier integration, so it does not estimate or
            confirm postage.
          </p>
        ) : null}
      </div>

      {rules.length > 0 ? (
        <div className="rounded-2xl border border-border bg-canvas p-4">
          <p className="text-sm font-semibold text-ink">
            What the creator charges, and where
          </p>
          <ul className="mt-2 space-y-1.5 text-xs leading-5 text-muted">
            {rules.map((rule, index) => (
              <li key={`${index}-${rule.coverage}`}>
                <span className="font-medium text-ink">{rule.coverage}</span> —{" "}
                {rule.rate.toLowerCase()}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-canvas p-4">
        <p className="text-sm font-semibold text-ink">At the border</p>
        <p className="mt-1.5 text-xs leading-5 text-muted">
          {tier.shipping.customs ??
            "The creator has not said how duty is handled. Ask them before you continue if this matters to you."}
        </p>
        <p className="mt-1.5 text-xs leading-5 text-muted">
          Inverge does not calculate, collect, or remit import duty or taxes,
          and does not claim that a destination has none.
        </p>
      </div>

      {tier.shipping.terms ? (
        <p className="text-xs leading-5 text-muted">{tier.shipping.terms}</p>
      ) : null}
    </div>
  );
}

export function ContributionPreview({
  campaign,
  initialCountry = "",
  initialTierId = null,
  walletFunding = null,
}: {
  campaign: Campaign;
  /**
   * The wallet balance and signing facts the settlement step may use. Null
   * means no wallet state is available, which is stated rather than assumed.
   */
  walletFunding?: WalletFundingSnapshot | null;
  /**
   * A destination handed over from the campaign page or a link. Ignored unless
   * it is a real country code, so a hand-edited query string cannot put the flow
   * into a state the country list does not contain.
   */
  initialCountry?: string;
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
    destinationCountry: normaliseCountryCode(initialCountry) ?? "",
    route: "usdc-wallet",
    tierId: campaign.supportTiers.some((tier) => tier.id === initialTierId)
      ? (initialTierId ?? "")
      : "",
  }));
  const [issues, setIssues] = useState<readonly ContributionIssue[]>([]);
  const [reachedHandoff, setReachedHandoff] = useState(false);

  /**
   * The steps that apply right now. The options step exists only while the
   * selected reward actually has something to configure, so a reward taken as-is
   * never leaves an empty question behind.
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
  const funding =
    amount === null
      ? null
      : assessWalletFunding({ required: amount, snapshot: walletFunding });
  const tier = selectedTier(draft, campaign);
  const destination = chosenDestination(draft);
  const outcome = fulfilmentCharge(draft, campaign);
  const total = totalDue(draft, campaign);
  const quantity = rewardQuantity(draft, campaign);
  const quantityLimit = tier === null ? 1 : maxRewardQuantity(tier);
  const quote = quoteLines(draft, campaign);
  const summaryLines = quote.filter(
    (line) => line.label !== "Campaign" && line.label !== "Reward",
  );

  function update(patch: Partial<ContributionDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
    setIssues([]);
  }

  /**
   * Switching reward clears everything that belonged to the previous one. A
   * leftover variant id or destination would be answered for a reward the backer
   * is no longer taking, which is worse than asking again.
   */
  function selectTier(tierId: string) {
    update({
      addOnIds: [],
      destinationCountry: "",
      quantity: 1,
      tierId,
      variantSelections: {},
    });
  }

  function toggleAddOn(addOnId: string) {
    update({
      addOnIds: draft.addOnIds.includes(addOnId)
        ? draft.addOnIds.filter((id) => id !== addOnId)
        : [...draft.addOnIds, addOnId],
    });
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

    /**
     * A balance that cannot cover the contribution blocks the step, just as it
     * would in the live flow. "Signing not connected" does not: it is the
     * preview's normal end state, and the final screen still submits nothing.
     */
    if (
      currentId === "settlement" &&
      draft.route === "usdc-wallet" &&
      funding !== null &&
      (funding.status === "insufficient" ||
        funding.status === "wallet-unavailable" ||
        funding.status === "unsupported-asset")
    ) {
      setIssues([{ field: "walletFunding", message: funding.message }]);
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

        <SummaryRows
          className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border"
          lines={summaryLines}
        />

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
                        asset={campaign.funding.fundingAsset}
                        onSelect={() =>
                          option.id === draft.tierId
                            ? update({})
                            : selectTier(option.id)
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
                        onChange={() => selectTier("")}
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
                    selects this reward, not a price for postage or a fee. Any
                    extra items and postage are added on the next step.
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

              {quantityLimit > 1 ? (
                <Field
                  label="How many?"
                  help={`The creator has limited this reward to ${quantityLimit} per backer.`}
                  error={errorFor("quantity")}
                >
                  {({ id, invalid }) => (
                    <Select
                      id={id}
                      value={String(quantity)}
                      options={Array.from(
                        { length: quantityLimit },
                        (_, index) => ({
                          label: `${index + 1}`,
                          value: `${index + 1}`,
                        }),
                      )}
                      onValueChange={(value) =>
                        update({ quantity: Number(value) })
                      }
                      className={invalid ? "[&>button]:border-danger" : ""}
                    />
                  )}
                </Field>
              ) : null}

              {tier.variants.map((group) => (
                <VariantChoice
                  key={group.id}
                  error={errorFor(`variants.${group.id}`)}
                  group={group}
                  onChange={(optionId) =>
                    update({
                      variantSelections: {
                        ...draft.variantSelections,
                        [group.id]: optionId,
                      },
                    })
                  }
                  selectedId={draft.variantSelections[group.id]}
                />
              ))}

              {tier.addOns.length > 0 ? (
                <fieldset>
                  <legend className="text-sm font-medium text-ink">
                    Add anything else?{" "}
                    <span className="text-xs font-normal text-muted">
                      optional
                    </span>
                  </legend>
                  <p className="mt-1.5 text-xs leading-5 text-muted">
                    Add-ons are priced by the creator and added to your
                    contribution. Select an added item again to remove it.
                  </p>
                  <div className="mt-3 space-y-3">
                    {tier.addOns.map((addOn) => (
                      <AddOnChoice
                        key={addOn.id}
                        addOn={addOn}
                        added={draft.addOnIds.includes(addOn.id)}
                        onToggle={() => toggleAddOn(addOn.id)}
                      />
                    ))}
                  </div>
                </fieldset>
              ) : null}

              {tier.shipping ? (
                <div className="space-y-4">
                  <Field
                    label="Where should it be sent?"
                    help="Type to search. The creator's own rules decide where this reward goes, and what postage costs if anything."
                    error={errorFor("destinationCountry")}
                  >
                    {({ describedBy, id, invalid }) => (
                      <CountrySelect
                        {...(describedBy ? { describedBy } : {})}
                        id={id}
                        invalid={invalid}
                        value={draft.destinationCountry}
                        onChange={(code) =>
                          update({ destinationCountry: code })
                        }
                      />
                    )}
                  </Field>

                  <ShippingDisclosure
                    country={destination}
                    outcome={outcome}
                    tier={tier}
                  />
                </div>
              ) : (
                <p className="rounded-xl border border-border bg-canvas p-3.5 text-xs leading-5 text-muted">
                  Nothing is posted for this reward, so there is no destination
                  to choose and no postage to pay. The creator sends it the way
                  the reward describes.
                </p>
              )}
            </div>
          ) : null}

          {currentId === "settlement" ? (
            <fieldset className="mt-6">
              <legend className="text-sm font-medium text-ink">
                How would you like to pay?
              </legend>
              <p className="mt-1.5 text-xs leading-5 text-muted">
                Two ways in, one escrow. Paying from your own wallet settles the
                exact figure above. Paying by card or bank transfer goes through
                a licensed provider that converts your money first, so the
                amount that settles is only known once the provider quotes it.
              </p>
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
              {draft.route === "usdc-wallet" && funding ? (
                <div className="mt-3">
                  <WalletFundingPanel
                    funding={funding}
                    sample={walletFunding?.sample ?? false}
                  />
                </div>
              ) : null}

              {errorFor("route") ? (
                <p className="mt-2 text-xs font-medium text-danger">
                  {errorFor("route")}
                </p>
              ) : null}
              {errorFor("walletFunding") ? (
                <p
                  className="mt-2 text-xs font-medium text-danger"
                  role="alert"
                >
                  {errorFor("walletFunding")}
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
                    fails to reach its target by the funding deadline. After a
                    successful funding close, the released working-capital
                    tranche is not refundable, but the remaining escrow stays
                    subject to the milestone and refund rules.
                  </li>
                  {tier ? (
                    <li>
                      A reward is a promise from the creator, not from Inverge.
                      Inverge does not make the item, ship it, guarantee a
                      delivery date, or quote postage for it.
                    </li>
                  ) : null}
                  {outcome.kind === "quoted" || outcome.kind === "free" ? (
                    <li>
                      Postage is paid to the creator for fulfilment. It is not
                      part of the escrowed contribution, so it is not part of
                      what an all-or-nothing refund would return.
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
              <SummaryRows
                className="divide-y divide-border overflow-hidden rounded-2xl border border-border"
                lines={quote}
              />

              <p className="text-sm leading-6 text-muted">
                {contributionSummaryLine(amount)}.
              </p>

              {draft.route === "usdc-wallet" && funding ? (
                <WalletFundingPanel
                  funding={funding}
                  sample={walletFunding?.sample ?? false}
                />
              ) : null}

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
              <dt className="text-muted">Total due</dt>
              <dd className="font-semibold tabular-nums text-ink">
                {amount === null ? (
                  "—"
                ) : total ? (
                  <Amount value={total} />
                ) : (
                  <span className="text-muted">Pending</span>
                )}
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

      <aside
        aria-label="Contribution summary"
        className="lg:sticky lg:top-24 lg:self-start"
      >
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
                    {quantity > 1 ? `${quantity} × ` : ""}
                    {tier.fulfilment === null
                      ? "reward"
                      : tier.fulfilment === "mixed"
                        ? "reward with a posted part"
                        : tier.fulfilment === "physical"
                          ? "reward, posted"
                          : "digital reward"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm font-medium text-ink">
                No reward — a contribution to the work
              </p>
            )}
          </div>

          <SummaryRows
            className="mt-4 divide-y divide-border text-sm"
            lines={summaryLines}
          />

          <div className="mt-4 flex gap-2.5 rounded-xl border border-border bg-surface p-3.5">
            <HugeiconsIcon
              icon={Shield01Icon}
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-brand-strong"
            />
            <p className="text-xs leading-5 text-muted">
              The contribution is held in a campaign-specific escrow and
              released only against approved milestones. Full refund if the
              target is not reached.
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
