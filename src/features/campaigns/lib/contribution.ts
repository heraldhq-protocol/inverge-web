import { bpsOf, formatOrUnknown } from "@/features/campaigns/lib/amounts";
import type { Campaign, SupportTier } from "@/features/campaigns/types";
import {
  formatMoney,
  parseUsdAmount,
  sumMoneyAmounts,
  type MoneyAmount,
} from "@/lib/money";

/**
 * Contribution preview.
 *
 * The flow demonstrates the real decision points without pretending any of them
 * moved money. Two routes exist because the product has two (FR-401, FR-402):
 * paying in USDC from the wallet needs no conversion and no rate, so it can be
 * reviewed end-to-end; the naira on-ramp needs a live quote, and the moment no
 * valid quote exists the flow says so and refuses to continue (§9). No amount,
 * fee, or rate is ever derived from one that does not exist.
 *
 * A reward sets the amount. Picking one puts its minimum in as the contribution
 * and offers an optional extra on top, which is how the product frames a reward
 * (FR-301: tiers are optional, and a contribution is never refused for being
 * below one — the reward is simply not selected). Shipping is creator-declared
 * and display-only: this module carries the destination the backer chose but
 * never a price, because Inverge holds no carrier integration and quoting one
 * would be inventing a number.
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
      "Where a physical reward goes, and how the creator fulfils it.",
    id: "options",
    title: "Delivery",
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
  /** The destination the backer chose from the reward's own list. */
  shippingRegion: string;
  route: ContributionRoute | "";
  acknowledgeTerms: boolean;
  acknowledgeDemo: boolean;
};

export const emptyContributionDraft: ContributionDraft = {
  acknowledgeDemo: false,
  acknowledgeTerms: false,
  amountInput: "",
  route: "",
  shippingRegion: "",
  supportInput: "",
  tierId: "",
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
  "Converting naira to USDC needs a live exchange quote, including the rate, the provider fee, and an expiry. No quote service is connected in this preview, so this route cannot continue.";

/**
 * Which settlement routes this campaign and this build can actually offer.
 *
 * The on-ramp is listed but blocked rather than hidden: a backer should be able
 * to see that the option exists and understand exactly why it is not usable yet.
 */
export function routeAvailability(
  campaign: Campaign,
): readonly RouteAvailability[] {
  const routes: RouteAvailability[] = [
    {
      available: true,
      blockedReason: null,
      description:
        "Pay in USDC from your connected wallet. No conversion, so the amount you enter is the amount that settles — there is no rate to quote.",
      label: "USDC from your wallet",
      route: "usdc-wallet",
    },
  ];

  if (campaign.funding.supportedSettlementAssets.includes("cNGN")) {
    routes.push({
      available: false,
      blockedReason: ON_RAMP_BLOCKED,
      description:
        "Pay in naira by card or bank transfer. Your provider converts it to USDC at checkout.",
      label: "Naira card or bank transfer",
      route: "fiat-on-ramp",
    });
  }

  return routes;
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
 * The contribution total, or null when the inputs do not make one.
 *
 * With a reward selected the total is the reward's own amount plus whatever the
 * backer chose to add. With no reward it is whatever they typed. Shipping is
 * deliberately absent: Inverge collects no postage, so adding one here would
 * invent a charge.
 */
export function contributionAmount(
  draft: ContributionDraft,
  campaign: Campaign,
): MoneyAmount | null {
  const tier = selectedTier(draft, campaign);

  if (tier) {
    if (additionalSupportInvalid(draft)) return null;

    const extra = additionalSupportAmount(draft);
    return extra ? sumMoneyAmounts([tier.minimum, extra]) : tier.minimum;
  }

  const atomic = parseUsdAmount(draft.amountInput);
  return atomic === null ? null : { atomic, currency: "USD", decimals: 2 };
}

/**
 * The destinations a selected reward will be posted to, in the creator's words.
 *
 * Empty means nothing ships, which is what makes the Delivery step disappear
 * rather than showing an empty question.
 */
export function shippingRegions(
  draft: ContributionDraft,
  campaign: Campaign,
): readonly string[] {
  return selectedTier(draft, campaign)?.shipping?.regions ?? [];
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
      const regions = shippingRegions(draft, campaign);
      if (regions.length === 0) return [];

      return regions.includes(draft.shippingRegion)
        ? []
        : [
            {
              field: "shippingRegion",
              message: "Choose where this reward should be sent.",
            },
          ];
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
 * The steps that apply to this draft.
 *
 * Delivery is dropped unless the chosen reward actually ships, so a backer is
 * never walked through a question with no answer. The flow's order is otherwise
 * fixed.
 */
export function visibleContributionSteps(
  draft: ContributionDraft,
  campaign: Campaign,
): readonly ContributionStep[] {
  if (shippingRegions(draft, campaign).length > 0) return contributionSteps;
  return contributionSteps.filter((step) => step.id !== "options");
}

export type QuoteLine = {
  label: string;
  value: string;
  /** True when the value is a statement of absence rather than a figure. */
  unknown?: boolean;
};

/**
 * The figures a backer reviews.
 *
 * Every value is either read from the campaign's own data or an explicit "not
 * available". A fee line states that Inverge's fee is deducted from the
 * creator's tranche, which is where FR-505 puts it — the backer is not charged a
 * platform fee, and no payment-provider margin is quoted because none exists.
 * Shipping appears as a line that says it is not quoted here rather than as a
 * guessed number, and it is never folded into the contribution total.
 */
export function quoteLines(
  draft: ContributionDraft,
  campaign: Campaign,
): readonly QuoteLine[] {
  const amount = contributionAmount(draft, campaign);
  const tier = selectedTier(draft, campaign);
  const regions = shippingRegions(draft, campaign);
  const route = routeAvailability(campaign).find(
    (candidate) => candidate.route === draft.route,
  );

  const lines: QuoteLine[] = [{ label: "Campaign", value: campaign.title }];

  if (tier) {
    lines.push({ label: "Reward", value: tier.title });
    lines.push({ label: "Reward amount", value: formatMoney(tier.minimum) });

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

  if (regions.length > 0) {
    lines.push({
      label: "Delivering to",
      value: draft.shippingRegion || "Not chosen yet",
      unknown: !draft.shippingRegion,
    });
    lines.push({
      label: "Shipping cost",
      value: "Not quoted by Inverge",
      unknown: true,
    });
  }

  lines.push(
    { label: "Funding asset", value: campaign.funding.fundingAsset },
    {
      label: "Contribution amount",
      value: amount === null ? "—" : formatMoney(amount),
      unknown: amount === null,
    },
  );

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
    lines.push(
      {
        label: "Total charged",
        value: amount === null ? "—" : formatMoney(amount),
        unknown: amount === null,
      },
      {
        label: "Platform fee",
        value:
          "None charged to you — Inverge's fee comes out of each released tranche",
      },
    );
    return lines;
  }

  lines.push(
    { label: "Original currency", value: "Nigerian naira (NGN)" },
    { label: "Exchange rate", value: "Not available", unknown: true },
    { label: "Provider fee", value: "Not available", unknown: true },
    { label: "Total charged", value: "Not available", unknown: true },
    {
      label: "Estimated settlement amount",
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
