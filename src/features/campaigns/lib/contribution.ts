import { bpsOf, formatOrUnknown } from "@/features/campaigns/lib/amounts";
import type { Campaign } from "@/features/campaigns/types";
import { formatMoney, parseUsdAmount, type MoneyAmount } from "@/lib/money";

/**
 * Contribution preview.
 *
 * The flow demonstrates the real decision points without pretending any of them
 * moved money. Two routes exist because the product has two (FR-401, FR-402):
 * paying in USDC from the wallet needs no conversion and no rate, so it can be
 * reviewed end-to-end; the naira on-ramp needs a live quote, and the moment no
 * valid quote exists the flow says so and refuses to continue (§9). No amount,
 * fee, or rate is ever derived from one that does not exist.
 */

export type ContributionRoute = "fiat-on-ramp" | "usdc-wallet";

export type ContributionStepId =
  "amount" | "settlement" | "disclosures" | "review";

export type ContributionStep = {
  id: ContributionStepId;
  title: string;
  description: string;
};

export const contributionSteps: readonly ContributionStep[] = [
  {
    description: "Choose how much you want to contribute.",
    id: "amount",
    title: "Amount",
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
  amountInput: string;
  route: ContributionRoute | "";
  tierId: string;
  acknowledgeTerms: boolean;
  acknowledgeDemo: boolean;
};

export const emptyContributionDraft: ContributionDraft = {
  acknowledgeDemo: false,
  acknowledgeTerms: false,
  amountInput: "",
  route: "",
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

export function selectedTier(draft: ContributionDraft, campaign: Campaign) {
  if (!draft.tierId) return null;
  return campaign.supportTiers.find((tier) => tier.id === draft.tierId) ?? null;
}

/** The parsed contribution amount, or null when the input is not a valid amount. */
export function contributionAmount(
  draft: ContributionDraft,
): MoneyAmount | null {
  const atomic = parseUsdAmount(draft.amountInput);
  if (atomic === null) return null;

  return { atomic, currency: "USD", decimals: 2 };
}

export function validateContributionAmount(
  draft: ContributionDraft,
  campaign: Campaign,
): ContributionIssue[] {
  const issues: ContributionIssue[] = [];
  const amount = contributionAmount(draft);

  if (!draft.amountInput.trim()) {
    issues.push({ field: "amount", message: "Enter an amount to continue." });
    return issues;
  }

  if (amount === null) {
    issues.push({
      field: "amount",
      message: "Enter a positive amount, using at most two decimal places.",
    });
    return issues;
  }

  const tier = selectedTier(draft, campaign);
  if (tier && BigInt(amount.atomic) < BigInt(tier.minimum.atomic)) {
    issues.push({
      field: "amount",
      message: `${tier.title} starts at ${formatMoney(tier.minimum)}.`,
    });
  }

  return issues;
}

export function validateContributionStep(
  draft: ContributionDraft,
  campaign: Campaign,
  step: ContributionStepId,
): ContributionIssue[] {
  switch (step) {
    case "amount":
      return validateContributionAmount(draft, campaign);
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

export type QuoteLine = {
  label: string;
  value: string;
  /** True when the value is a statement of absence rather than a figure. */
  unknown?: boolean;
};

/**
 * The figures a backer reviews.
 *
 * Every value is either read from the campaign's own data or an explicit
 * "not available". A fee line states that Inverge's fee is deducted from the
 * creator's tranche, which is where FR-505 puts it — the backer is not charged a
 * platform fee, and no payment-provider margin is quoted because none exists.
 */
export function quoteLines(
  draft: ContributionDraft,
  campaign: Campaign,
): readonly QuoteLine[] {
  const amount = contributionAmount(draft);
  const tier = selectedTier(draft, campaign);
  const route = routeAvailability(campaign).find(
    (candidate) => candidate.route === draft.route,
  );

  const lines: QuoteLine[] = [
    { label: "Campaign", value: campaign.title },
    { label: "Funding asset", value: campaign.funding.fundingAsset },
    {
      label: "Contribution amount",
      value: amount === null ? "—" : formatMoney(amount),
      unknown: amount === null,
    },
  ];

  if (tier) {
    lines.push({
      label: "Reward tier",
      value: `${tier.title} (from ${formatMoney(tier.minimum)})`,
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
