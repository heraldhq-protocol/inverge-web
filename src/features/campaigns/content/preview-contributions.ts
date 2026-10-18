import { previewCampaigns } from "@/features/campaigns/content/preview-campaigns";
import type {
  Contribution,
  ContributionState,
  PaymentState,
  RefundState,
} from "@/features/campaigns/types";
import type { MoneyAmount } from "@/lib/money";

/**
 * Preview contribution fixtures — the viewer's backing history.
 *
 * These stand in for the contribution API. They carry every payment and
 * contribution state the product defines, because the receipt has to be readable
 * in all of them, including the ones a happy-path demo never reaches.
 *
 * Constraints that keep them honest:
 *
 * - No `transaction` is ever populated, so no explorer link is fabricated.
 * - No exchange rate, provider fee, or naira amount is invented. The `fiatLeg`
 *   is null throughout and the UI explains that the original naira amount and
 *   rate are not available in this preview.
 * - A payment state and a contribution state are always both present, because
 *   "the provider took the money" and "the contribution is recorded" are
 *   different claims (briefing §4).
 */

type Seed = {
  id: string;
  campaignId: string;
  amount: string;
  submittedAt: string;
  payment: PaymentState;
  contribution: ContributionState;
  contributionConfirmedAt?: string;
  method?: string | null;
  refund?: {
    state: RefundState;
    reason?: string | null;
    eligibleAmount?: string | null;
    claimSubmittedAt?: string | null;
    confirmedAt?: string | null;
  };
  relatedUpdateIds?: readonly string[];
};

function money(atomic: string): MoneyAmount {
  return { atomic, currency: "USD", decimals: 2 };
}

function build(seed: Seed): Contribution {
  const campaign = previewCampaigns.find((item) => item.id === seed.campaignId);
  if (!campaign) {
    throw new Error(
      `Contribution ${seed.id} references a missing campaign: ${seed.campaignId}`,
    );
  }

  const refund = seed.refund;

  return {
    amount: money(seed.amount),
    campaignId: campaign.id,
    campaignSlug: campaign.slug,
    campaignTitle: campaign.title,
    contribution: {
      confirmedAt: seed.contributionConfirmedAt ?? null,
      state: seed.contribution,
      transaction: null,
    },
    cover: campaign.cover,
    creator: campaign.creator.name,
    fiatLeg: null,
    fundingAsset: "USDC",
    id: seed.id,
    payment: {
      method: seed.method ?? "USDC from your wallet",
      providerReference: null,
      state: seed.payment,
    },
    refund: {
      claimSubmittedAt: refund?.claimSubmittedAt ?? null,
      confirmedAt: refund?.confirmedAt ?? null,
      eligibleAmount:
        refund?.eligibleAmount === undefined || refund.eligibleAmount === null
          ? null
          : money(refund.eligibleAmount),
      reason: refund?.reason ?? null,
      state: refund?.state ?? "not-applicable",
      transaction: null,
    },
    route: "usdc-wallet",
    submittedAt: seed.submittedAt,
    support: { relatedUpdateIds: seed.relatedUpdateIds ?? [] },
  };
}

export const previewContributions: readonly Contribution[] = [
  build({
    amount: "50000",
    campaignId: "campaign-studymate",
    contribution: "confirmed",
    contributionConfirmedAt: "2026-08-04T10:12:00.000Z",
    id: "contrib-studymate-01",
    payment: "succeeded",
    relatedUpdateIds: ["studymate-update-milestone1"],
    submittedAt: "2026-08-03T18:40:00.000Z",
  }),
  build({
    amount: "25000",
    campaignId: "campaign-sungrid",
    contribution: "confirmed",
    contributionConfirmedAt: "2026-12-06T07:55:00.000Z",
    id: "contrib-sungrid-01",
    payment: "succeeded",
    relatedUpdateIds: ["sungrid-update-parts"],
    submittedAt: "2026-12-05T21:10:00.000Z",
  }),
  build({
    amount: "100000",
    campaignId: "campaign-sungrid",
    contribution: "pending",
    id: "contrib-sungrid-02",
    payment: "processing",
    submittedAt: "2027-01-08T08:05:00.000Z",
  }),
  build({
    amount: "15000",
    campaignId: "campaign-farmlink",
    contribution: "none",
    id: "contrib-farmlink-01",
    payment: "awaiting-provider",
    submittedAt: "2027-01-14T12:20:00.000Z",
  }),
  build({
    amount: "20000",
    campaignId: "campaign-farmlink",
    contribution: "none",
    id: "contrib-farmlink-02",
    payment: "user-action-required",
    submittedAt: "2027-01-15T16:45:00.000Z",
  }),
  build({
    amount: "30000",
    campaignId: "campaign-farmlink",
    contribution: "failed",
    id: "contrib-farmlink-03",
    payment: "failed",
    submittedAt: "2027-01-16T09:30:00.000Z",
  }),
  build({
    amount: "12000",
    campaignId: "campaign-ibadan-creative-lab",
    contribution: "none",
    id: "contrib-ibadan-01",
    payment: "quote-expired",
    submittedAt: "2026-12-30T19:00:00.000Z",
  }),
  build({
    amount: "12000",
    campaignId: "campaign-ibadan-creative-lab",
    contribution: "none",
    id: "contrib-ibadan-02",
    payment: "provider-unavailable",
    submittedAt: "2026-12-30T19:12:00.000Z",
  }),
  build({
    amount: "500000",
    campaignId: "campaign-lagos-kitchen",
    contribution: "confirmed",
    contributionConfirmedAt: "2026-08-20T11:05:00.000Z",
    id: "contrib-lagos-kitchen-01",
    payment: "succeeded",
    refund: {
      eligibleAmount: "500000",
      reason:
        "The funding target was not reached by the deadline, so this contribution is refundable in full.",
      state: "available",
    },
    submittedAt: "2026-08-20T10:55:00.000Z",
  }),
  build({
    amount: "250000",
    campaignId: "campaign-lagos-kitchen",
    contribution: "confirmed",
    contributionConfirmedAt: "2026-08-24T09:15:00.000Z",
    id: "contrib-lagos-kitchen-02",
    payment: "succeeded",
    refund: {
      claimSubmittedAt: "2026-09-18T08:00:00.000Z",
      confirmedAt: "2026-09-19T07:30:00.000Z",
      eligibleAmount: "250000",
      reason:
        "The funding target was not reached by the deadline. The refund was claimed and confirmed.",
      state: "confirmed",
    },
    submittedAt: "2026-08-24T09:05:00.000Z",
  }),
  build({
    amount: "40000",
    campaignId: "campaign-studymate",
    contribution: "reconciling",
    id: "contrib-studymate-02",
    payment: "succeeded",
    relatedUpdateIds: ["studymate-update-claim2"],
    submittedAt: "2026-10-14T20:00:00.000Z",
  }),
  build({
    amount: "60000",
    campaignId: "campaign-healthreach",
    contribution: "confirmed",
    contributionConfirmedAt: "2026-12-10T13:40:00.000Z",
    id: "contrib-healthreach-01",
    payment: "succeeded",
    relatedUpdateIds: ["healthreach-update-paused"],
    submittedAt: "2026-12-10T13:30:00.000Z",
  }),
  build({
    amount: "200000",
    campaignId: "campaign-campus-konekt",
    contribution: "confirmed",
    contributionConfirmedAt: "2026-07-20T15:20:00.000Z",
    id: "contrib-campus-konekt-01",
    payment: "succeeded",
    relatedUpdateIds: ["campus-update-milestone1"],
    submittedAt: "2026-07-20T15:10:00.000Z",
  }),
];

export function findPreviewContribution(id: string): Contribution | undefined {
  return previewContributions.find((contribution) => contribution.id === id);
}

export function contributionsForCampaign(
  campaignId: string,
): readonly Contribution[] {
  return previewContributions.filter(
    (contribution) => contribution.campaignId === campaignId,
  );
}
