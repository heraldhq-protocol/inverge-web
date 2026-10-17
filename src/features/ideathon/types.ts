import type { DiscoveryIdea } from "@/features/ideas/types";
import type { MoneyAmount } from "@/lib/money";

/**
 * Verification weights are the community-loop scoring rule (FR-707 in the
 * proposal): email-only 0.25, verified social 0.7, KYC-verified 1.0. They live
 * here so the fixture and the UI read one definition.
 */
export type VerificationTier = "EMAIL" | "SOCIAL" | "VERIFIED";

export const TIER_WEIGHTS: Readonly<Record<VerificationTier, number>> = {
  EMAIL: 0.25,
  SOCIAL: 0.7,
  VERIFIED: 1,
};

/** How many scoring accounts of each tier contributed each signal. */
export type TierBucket = Readonly<Record<VerificationTier, number>>;

export type EntrySignals = {
  /** One support per account, counted once. */
  supporters: TierBucket;
  /** One structured feedback response per account. */
  feedback: TierBucket;
  /** One flat point per account; the stated amount never adds points. */
  prePledge: TierBucket;
};

export type StandingEntry = {
  idea: DiscoveryIdea;
  signals: EntrySignals;
  score: number;
  rank: number;
};

export type CompetitionStatus =
  | "archived"
  | "closed"
  | "open"
  | "published"
  | "upcoming";

export type Ideathon = {
  id: string;
  slug: string;
  title: string;
  theme: string;
  themeSummary: string;
  description: string;
  startsAt: string;
  endsAt: string;
  status: CompetitionStatus;
  prizeDescription: string;
  /** Reference figure only; never a payout rail. */
  prizeValue?: MoneyAmount;
  entries: readonly StandingEntry[];
  updatedAt: string;
};

export type CompetitionTotals = {
  supporters: number;
  estimatedInterest: MoneyAmount;
  feedback: number;
  entries: number;
};

export type CompetitionCategoryBreakdown = {
  category: string;
  categoryValue: DiscoveryIdea["discoveryCategory"];
  count: number;
};
