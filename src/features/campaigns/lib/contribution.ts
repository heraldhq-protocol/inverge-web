import {
  destinationName,
  resolveShipping,
  shippedUnits,
  type ShippingOutcome,
} from "@/features/campaigns/lib/shipping";
import { bpsOf, formatOrUnknown } from "@/features/campaigns/lib/amounts";
import type {
  Campaign,
  CountryCode,
  RewardAddOn,
  RewardVariantGroup,
  SupportTier,
} from "@/features/campaigns/types";
import { normaliseCountryCode } from "@/lib/countries";
import {
  formatMoney,
  parseUsdAmount,
  scaleMoneyAmount,
  sumMoneyAmounts,
  type MoneyAmount,
} from "@/lib/money";

/**
 * Contribution preview.
 *
 * The flow demonstrates the real decision points without pretending any of them
 * moved money. Two routes exist because the product has two (FR-401, FR-402):
 * paying in USDC from the wallet needs no conversion and no rate, so it can be
 * reviewed end-to-end; the card and bank on-ramp needs a live quote from a
 * licensed provider, and the moment no valid quote exists the flow says so and
 * refuses to continue (§9). No amount, fee, or rate is ever derived from one that
 * does not exist.
 *
 * Two totals are kept apart on purpose. The **contribution** is what enters the
 * campaign's escrow — the reward at the quantity taken, its add-ons, and any
 * extra support — and it is what an all-or-nothing refund would return and what
 * the milestone plan is written against. The **fulfilment charge** is postage,
 * which the creator spends on sending the reward and which therefore never sits
 * in escrow and never changes the milestone figures. The flow shows them as
 * separate lines and adds them only into the total due, because a backer
 * deciding whether to continue needs to see which part is refundable.
 *
 * Postage is only ever a figure the creator published. Where their policy defers
 * the cost, refuses the destination, or simply does not cover it, this module
 * reports that outcome and states no number at all.
 */

export type ContributionRoute = "fiat-on-ramp" | "usdc-wallet";

export type ContributionStepId =
  "reward" | "options" | "settlement" | "disclosures" | "review";

export type ContributionStep = {
  id: ContributionStepId;
  title: string;
  description: string;
};

export const contributionSteps: readonly ContributionStep[] = [
  {
    description:
      "Pick what you would like to receive, or contribute without a reward.",
    id: "reward",
    title: "Reward",
  },
  {
    description:
      "Any choices the reward needs, extra items you would like, and where it should be sent.",
    id: "options",
    title: "Options and delivery",
  },
  {
    description: "Choose how you will pay. Nothing is charged yet.",
    id: "settlement",
    title: "How you'll pay",
  },
  {
    description: "Read what you would be agreeing to before you decide.",
    id: "disclosures",
    title: "Terms",
  },
  {
    description: "Review the whole contribution. This is a preview only.",
    id: "review",
    title: "Review",
  },
];

export type ContributionDraft = {
  /** The reward the backer picked. Empty means contributing without a reward. */
  tierId: string;
  /** The free amount, used only when no reward is selected. */
  amountInput: string;
  /** An optional extra on top of a reward's amount. Blank means none. */
  supportInput: string;
  /**
   * The destination, ISO 3166-1 alpha-2, or empty when not chosen.
   *
   * A country rather than a country-plus-street: a full address is only needed
   * once a real fulfilment process asks for one, and collecting it here would
   * store personal data no step in this build can use.
   */
  destinationCountry: CountryCode | "";
  /** One chosen option id per variant group, keyed by the group's id. */
  variantSelections: Readonly<Record<string, string>>;
  /** How many of the reward. Always at least one, and never above the limit. */
  quantity: number;
  /** The add-ons the backer took, by id. */
  addOnIds: readonly string[];
  route: ContributionRoute | "";
  acknowledgeTerms: boolean;
  acknowledgeDemo: boolean;
};

export const emptyContributionDraft: ContributionDraft = {
  acknowledgeDemo: false,
  acknowledgeTerms: false,
  addOnIds: [],
  amountInput: "",
  destinationCountry: "",
  quantity: 1,
  route: "",
  supportInput: "",
  tierId: "",
  variantSelections: {},
};

export type ContributionIssue = { field: string; message: string };

export type RouteAvailability = {
  route: ContributionRoute;
  label: string;
  description: string;
  available: boolean;
  /** Why the route cannot be used, when it cannot. Null when it can. */
  blockedReason: string | null;
};

const ON_RAMP_BLOCKED =
  "This route runs through the licensed on-ramp provider and needs a live conversion quote — the rate, the provider's fee, and an expiry. No provider is connected in this build, so the route is offered but cannot continue. Inverge will not invent a rate to fill the gap.";

/**
 * Which settlement routes this campaign and this build can actually offer.
 *
 * Two ways to pay, because the product has two (FR-401, FR-402): directly in
 * USDC from a wallet, which needs no conversion and therefore no rate, and by
 * card or bank transfer through the licensed on-ramp provider, which converts
 * the backer's money into the stablecoin the campaign settles in.
 *
 * Both are always listed. The campaign's supported assets decide what the
 * provider converts *to* — a campaign that accepts cNGN can settle in naira
 * rails rather than in USDC — but they never decide whether a backer may pay by
 * card at all, which is a property of the checkout rather than of the campaign.
 *
 * The on-ramp is listed but blocked rather than hidden: a backer should be able
 * to see that the option exists and understand exactly why it is not usable yet.
 */
export function routeAvailability(
  campaign: Campaign,
): readonly RouteAvailability[] {
  const settlesInCngn =
    campaign.funding.supportedSettlementAssets.includes("cNGN");

  return [
    {
      available: true,
      blockedReason: null,
      description:
        "Pay in USDC from your connected wallet, in the asset this campaign is denominated in. Nothing is converted, so there is no rate to quote and no provider fee to estimate.",
      label: "USDC from your wallet",
      route: "usdc-wallet",
    },
    {
      available: false,
      blockedReason: ON_RAMP_BLOCKED,
      description: settlesInCngn
        ? "Pay by card or bank transfer in your own currency. The licensed provider converts it to USDC or cNGN and completes the contribution in one flow (FR-402), and quotes the rate, its fee, and the amount that settles."
        : "Pay by card or bank transfer in your own currency. The licensed provider converts it to USDC and completes the contribution in one flow (FR-402), and quotes the rate, its fee, and the amount that settles.",
      label: "Card or bank transfer",
      route: "fiat-on-ramp",
    },
  ];
}

export function selectedTier(
  draft: ContributionDraft,
  campaign: Campaign,
): SupportTier | null {
  if (!draft.tierId) return null;
  return campaign.supportTiers.find((tier) => tier.id === draft.tierId) ?? null;
}

/** A field the backer left blank, or an explicit zero, both mean "no extra". */
function isBlankOrZero(input: string): boolean {
  const trimmed = input.trim();
  return trimmed === "" || /^0+(\.0{1,2})?$/.test(trimmed);
}

/**
 * The optional extra a backer adds on top of a reward's amount.
 *
 * This is an additional contribution to the campaign, not a purchase: it buys no
 * extra reward, and it is not a tip to Inverge. Null means the backer added
 * nothing, either because they left the field blank or typed a zero.
 */
export function additionalSupportAmount(
  draft: ContributionDraft,
): MoneyAmount | null {
  if (isBlankOrZero(draft.supportInput)) return null;

  const atomic = parseUsdAmount(draft.supportInput);
  return atomic === null ? null : { atomic, currency: "USD", decimals: 2 };
}

/** True when the extra-support field holds something that is not a valid amount. */
export function additionalSupportInvalid(draft: ContributionDraft): boolean {
  if (isBlankOrZero(draft.supportInput)) return false;
  return parseUsdAmount(draft.supportInput) === null;
}

/**
 * The most units one backer may take.
 *
 * A reward without a stated limit is a single unit rather than an unlimited one:
 * Inverge holds no stock count, so "you may take any number" would be a promise
 * about availability that nothing can keep.
 */
export function maxRewardQuantity(tier: SupportTier): number {
  return tier.quantityLimit !== null && tier.quantityLimit > 1
    ? tier.quantityLimit
    : 1;
}

/** The quantity actually in force, clamped to the reward's own limit. */
export function rewardQuantity(
  draft: ContributionDraft,
  campaign: Campaign,
): number {
  const tier = selectedTier(draft, campaign);
  if (!tier) return 1;

  const limit = maxRewardQuantity(tier);
  const requested = Math.trunc(draft.quantity);

  if (!Number.isFinite(requested) || requested < 1) return 1;
  return Math.min(requested, limit);
}

/** The add-ons the backer took that this reward actually offers, in its order. */
export function selectedAddOns(
  draft: ContributionDraft,
  campaign: Campaign,
): readonly RewardAddOn[] {
  const tier = selectedTier(draft, campaign);
  if (!tier) return [];

  return tier.addOns.filter((addOn) => draft.addOnIds.includes(addOn.id));
}

/** The reward's own amount for the quantity taken, before add-ons and support. */
export function rewardSubtotal(
  draft: ContributionDraft,
  campaign: Campaign,
): MoneyAmount | null {
  const tier = selectedTier(draft, campaign);
  if (!tier) return null;

  return scaleMoneyAmount(tier.minimum, rewardQuantity(draft, campaign));
}

/** The add-ons' prices added together, or null when none are selected. */
export function addOnTotal(
  draft: ContributionDraft,
  campaign: Campaign,
): MoneyAmount | null {
  const addOns = selectedAddOns(draft, campaign);
  if (addOns.length === 0) return null;

  return sumMoneyAmounts(addOns.map((addOn) => addOn.price));
}

/**
 * The contribution that enters escrow, or null when the inputs do not make one.
 *
 * With a reward selected it is the reward's amount at the quantity taken, plus
 * the add-ons, plus whatever the backer chose to add. With no reward it is
 * whatever they typed. Postage is deliberately absent: it is not escrowed, so
 * adding it here would overstate both the refund and the milestone plan.
 */
export function contributionAmount(
  draft: ContributionDraft,
  campaign: Campaign,
): MoneyAmount | null {
  const tier = selectedTier(draft, campaign);

  if (tier) {
    if (additionalSupportInvalid(draft)) return null;

    const parts = [rewardSubtotal(draft, campaign)];
    const addOns = addOnTotal(draft, campaign);
    const support = additionalSupportAmount(draft);

    if (addOns) parts.push(addOns);
    if (support) parts.push(support);

    return sumMoneyAmounts(parts.filter((part) => part !== null));
  }

  const atomic = parseUsdAmount(draft.amountInput);
  return atomic === null ? null : { atomic, currency: "USD", decimals: 2 };
}

/** The destination as a real country, or null when nothing valid is chosen. */
export function chosenDestination(
  draft: ContributionDraft,
): CountryCode | null {
  return normaliseCountryCode(draft.destinationCountry);
}

/** The chosen option's label for a variant group, or null when unanswered. */
export function chosenVariantLabel(
  draft: ContributionDraft,
  group: RewardVariantGroup,
): string | null {
  const chosenId = draft.variantSelections[group.id];
  if (!chosenId) return null;

  return group.options.find((option) => option.id === chosenId)?.label ?? null;
}

/** The variant groups the backer has not answered yet. */
export function unansweredVariants(
  draft: ContributionDraft,
  campaign: Campaign,
): readonly RewardVariantGroup[] {
  const tier = selectedTier(draft, campaign);
  if (!tier) return [];

  return tier.variants.filter(
    (group) => chosenVariantLabel(draft, group) === null,
  );
}

/**
 * What the creator's policy says postage costs for this order.
 *
 * Structured rather than pre-formatted so the summary, the destination step, and
 * the validation can each say the same thing in the size they need — and so that
 * "we cannot ship there" is never accidentally rendered as a price.
 */
export function fulfilmentCharge(
  draft: ContributionDraft,
  campaign: Campaign,
): ShippingOutcome {
  const tier = selectedTier(draft, campaign);
  if (!tier) return { kind: "not-required" };

  return resolveShipping(
    tier.shipping,
    chosenDestination(draft),
    shippedUnits(tier, rewardQuantity(draft, campaign), draft.addOnIds),
  );
}

/**
 * The whole amount due, or null when it cannot be stated.
 *
 * Null is a real answer: while the destination is unanswered, refused, or
 * priced later by the creator, there is no total to show, and a backer is better
 * served by "pending" than by a figure that misses the postage.
 */
export function totalDue(
  draft: ContributionDraft,
  campaign: Campaign,
): MoneyAmount | null {
  const contribution = contributionAmount(draft, campaign);
  if (contribution === null) return null;

  const fulfilment = fulfilmentCharge(draft, campaign);

  switch (fulfilment.kind) {
    case "not-required":
    case "free":
      return contribution;
    case "quoted":
      return sumMoneyAmounts([contribution, fulfilment.amount]);
    case "unchosen":
    case "deferred":
    case "unsupported":
      return null;
  }
}

/** True when the reward has anything to configure beyond taking it as-is. */
export function needsOptionsStep(tier: SupportTier): boolean {
  return (
    tier.variants.length > 0 || tier.addOns.length > 0 || tier.shipping !== null
  );
}

/**
 * The steps that apply to this draft.
 *
 * Options and delivery is dropped when the chosen reward has no choices, no
 * add-ons, and nothing to post, so a backer is never walked through a question
 * with no answer. A contribution with no reward never sees it either.
 */
export function visibleContributionSteps(
  draft: ContributionDraft,
  campaign: Campaign,
): readonly ContributionStep[] {
  const tier = selectedTier(draft, campaign);

  if (tier && needsOptionsStep(tier)) return contributionSteps;
  return contributionSteps.filter((step) => step.id !== "options");
}

export function validateContributionStep(
  draft: ContributionDraft,
  campaign: Campaign,
  step: ContributionStepId,
): ContributionIssue[] {
  switch (step) {
    case "reward": {
      const tier = selectedTier(draft, campaign);

      if (draft.tierId && !tier) {
        return [
          {
            field: "tierId",
            message: "That reward is not offered by this campaign.",
          },
        ];
      }

      if (tier) {
        return additionalSupportInvalid(draft)
          ? [
              {
                field: "supportInput",
                message:
                  "Enter an amount with at most two decimals, or leave this blank.",
              },
            ]
          : [];
      }

      if (!draft.amountInput.trim()) {
        return [{ field: "amount", message: "Enter an amount to continue." }];
      }

      if (parseUsdAmount(draft.amountInput) === null) {
        return [
          {
            field: "amount",
            message:
              "Enter a positive amount, using at most two decimal places.",
          },
        ];
      }

      return [];
    }
    case "options": {
      const tier = selectedTier(draft, campaign);
      if (!tier) return [];

      const issues: ContributionIssue[] = [];

      for (const group of tier.variants) {
        if (chosenVariantLabel(draft, group) === null) {
          issues.push({
            field: `variants.${group.id}`,
            message: `Choose ${group.label.toLowerCase()} for this reward.`,
          });
        }
      }

      const limit = maxRewardQuantity(tier);
      const quantity = rewardQuantity(draft, campaign);

      if (
        !Number.isInteger(draft.quantity) ||
        draft.quantity < 1 ||
        draft.quantity > limit
      ) {
        issues.push({
          field: "quantity",
          message:
            limit > 1
              ? `Choose between 1 and ${limit} of this reward.`
              : "This reward is limited to one.",
        });
      }

      if (tier.shipping) {
        issues.push(...destinationIssues(draft, tier, quantity));
      }

      return issues;
    }
    case "settlement": {
      if (!draft.route) {
        return [
          { field: "route", message: "Choose how you would like to pay." },
        ];
      }

      const option = routeAvailability(campaign).find(
        (candidate) => candidate.route === draft.route,
      );

      if (!option) {
        return [
          {
            field: "route",
            message: "That payment route is not available for this campaign.",
          },
        ];
      }

      if (!option.available) {
        return [
          {
            field: "route",
            message:
              option.blockedReason ?? "That payment route is unavailable.",
          },
        ];
      }

      return [];
    }
    case "disclosures":
      return draft.acknowledgeTerms
        ? []
        : [
            {
              field: "acknowledgeTerms",
              message: "Read and accept the terms to continue.",
            },
          ];
    case "review":
      return draft.acknowledgeDemo
        ? []
        : [
            {
              field: "acknowledgeDemo",
              message:
                "Confirm you understand this is a preview and no payment will be taken.",
            },
          ];
  }
}

/**
 * Why a destination cannot proceed, if it cannot.
 *
 * An uncovered destination and an explicitly refused one are worded differently
 * because they mean different things — one is a gap in the creator's policy, the
 * other is a decision the creator made — and both say what to do next rather
 * than only that the answer is no.
 */
function destinationIssues(
  draft: ContributionDraft,
  tier: SupportTier,
  quantity: number,
): ContributionIssue[] {
  const country = chosenDestination(draft);

  if (country === null) {
    return [
      {
        field: "destinationCountry",
        message: "Choose the country this reward should be sent to.",
      },
    ];
  }

  const outcome = resolveShipping(
    tier.shipping,
    country,
    shippedUnits(tier, quantity, draft.addOnIds),
  );

  if (outcome.kind !== "unsupported") return [];

  const name = destinationName(country);

  if (outcome.cause === "excluded") {
    return [
      {
        field: "destinationCountry",
        message: outcome.note
          ? `${name} is not a destination for this reward: ${outcome.note}`
          : `The creator has said they cannot send this reward to ${name}.`,
      },
    ];
  }

  return [
    {
      field: "destinationCountry",
      message: `This reward's shipping does not cover ${name}. Choose another destination, or contribute without this reward.`,
    },
  ];
}

export type QuoteLine = {
  label: string;
  value: string;
  /** True when the value is a statement of absence rather than a figure. */
  unknown?: boolean;
};

/** How a fulfilment outcome reads on a summary line. */
function fulfilmentLine(outcome: ShippingOutcome): QuoteLine {
  switch (outcome.kind) {
    case "free":
      return { label: "Shipping", value: "No postage charged to you" };
    case "quoted":
      return { label: "Shipping", value: formatMoney(outcome.amount) };
    case "deferred":
      return {
        label: "Shipping",
        value: outcome.note
          ? `Not known yet — ${outcome.note}`
          : "Not known yet — the creator arranges postage separately",
        unknown: true,
      };
    case "unsupported":
      return {
        label: "Shipping",
        value: "Not available to this destination",
        unknown: true,
      };
    case "unchosen":
      return {
        label: "Shipping",
        value: "Not known until a destination is chosen",
        unknown: true,
      };
    case "not-required":
      return {
        label: "Shipping",
        value: "Not applicable to this reward",
        unknown: true,
      };
  }
}

/**
 * The figures a backer reviews.
 *
 * Every value is either read from the campaign's own data or an explicit "not
 * available". Postage appears as its own line, labelled as a fulfilment charge
 * rather than as escrow, and the two are added only into the total due — so the
 * refundable amount is never mixed up with the cost of sending something. A fee
 * line states that Inverge's fee is deducted from the creator's tranche, which is
 * where FR-505 puts it: the backer is not charged a platform fee, and no payment
 * provider margin is quoted because no provider is connected.
 */
export function quoteLines(
  draft: ContributionDraft,
  campaign: Campaign,
): readonly QuoteLine[] {
  const amount = contributionAmount(draft, campaign);
  const tier = selectedTier(draft, campaign);
  const route = routeAvailability(campaign).find(
    (candidate) => candidate.route === draft.route,
  );

  const lines: QuoteLine[] = [{ label: "Campaign", value: campaign.title }];

  if (tier) {
    lines.push({ label: "Reward", value: tier.title });

    const quantity = rewardQuantity(draft, campaign);
    lines.push({
      label: "Reward amount",
      value:
        quantity > 1
          ? `${formatMoney(tier.minimum)} × ${quantity}`
          : formatMoney(tier.minimum),
    });

    for (const group of tier.variants) {
      const chosen = chosenVariantLabel(draft, group);
      lines.push({
        label: group.label,
        value: chosen ?? "Not chosen yet",
        unknown: chosen === null,
      });
    }

    for (const addOn of selectedAddOns(draft, campaign)) {
      lines.push({ label: addOn.title, value: formatMoney(addOn.price) });
    }

    const extra = additionalSupportAmount(draft);
    if (extra) {
      lines.push({
        label: "Additional support",
        value: formatMoney(extra),
      });
    }
  } else {
    lines.push({
      label: "Reward",
      value: "None — a contribution to the work",
      unknown: true,
    });
  }

  if (tier?.shipping) {
    const country = chosenDestination(draft);

    lines.push({
      label: "Delivering to",
      value: country === null ? "Not chosen yet" : destinationName(country),
      unknown: country === null,
    });
    lines.push(fulfilmentLine(fulfilmentCharge(draft, campaign)));
  }

  lines.push(
    {
      label: "Contribution (escrowed)",
      value: amount === null ? "—" : formatMoney(amount),
      unknown: amount === null,
    },
    { label: "Funding asset", value: campaign.funding.fundingAsset },
  );

  const total = totalDue(draft, campaign);

  if (total === null && amount !== null) {
    lines.push({
      label: "Total due",
      value: "Pending — postage is not known yet",
      unknown: true,
    });
  } else {
    lines.push({
      label: "Total due",
      value: total === null ? "—" : formatMoney(total),
      unknown: total === null,
    });
  }

  if (!route) {
    lines.push({
      label: "Payment route",
      value: "Not chosen yet",
      unknown: true,
    });
    return lines;
  }

  lines.push({ label: "Payment route", value: route.label });

  if (route.route === "usdc-wallet") {
    lines.push({
      label: "Platform fee",
      value:
        "None charged to you — Inverge's fee comes out of each released tranche",
    });
    return lines;
  }

  lines.push(
    { label: "Charge currency", value: "Not available", unknown: true },
    { label: "Exchange rate", value: "Not available", unknown: true },
    { label: "Provider fee", value: "Not available", unknown: true },
    {
      label: "Amount that settles",
      value: "Not available",
      unknown: true,
    },
  );

  return lines;
}

/**
 * What the escrow tranche for a contribution would be worth against the
 * milestone plan. Used to say plainly that a contribution funds the plan, not a
 * lump sum handed over on day one.
 */
export function planShareFor(amount: MoneyAmount, campaign: Campaign): string {
  const first = campaign.milestones.at(0);
  if (!first) return "the published milestone plan";

  const tranche = bpsOf(amount, first.allocationBps);
  return `${formatMoney(tranche)} would be released against milestone one (${first.title})`;
}

/** A one-line summary of the contribution for the receipt and review step. */
export function contributionSummaryLine(amount: MoneyAmount | null): string {
  return `${formatOrUnknown(amount)} to a campaign-specific escrow`;
}

/**
 * The handoff states the real flow will have to show, named so that nobody
 * mistakes this build for one of them.
 *
 * They are listed rather than demonstrated: no provider is connected, so there
 * is nothing to transition through, and faking a confirmation would teach a
 * backer the wrong thing about what a confirmation means (§11).
 */
export const handoffStates: readonly string[] = [
  "Preparing the contribution",
  "Opening the payment provider",
  "Authentication required",
  "Identity verification required",
  "Wallet connection required",
  "Payment processing",
  "Contribution awaiting confirmation",
  "Contribution confirmed",
  "Quote expired",
  "Payment cancelled or failed",
];
