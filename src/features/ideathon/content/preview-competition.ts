import type { DiscoveryIdea } from "@/features/ideas/types";
import { allPublicIdeas } from "@/features/ideas/lib/catalog";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import {
  entryScore,
  rankEntries,
  totalSupporters,
} from "@/features/ideathon/lib/standings";
import type {
  EntrySignals,
  Ideathon,
  TierBucket,
  VerificationTier,
} from "@/features/ideathon/types";

/**
 * Preview competition data.
 *
 * The community-loop plan (inverge-api/docs/idea-community-loop-plan.md) is a
 * draft with no endpoints or tables yet, so there are no live standings. This
 * module derives sample tier buckets from the public preview catalogue so the
 * board can be reviewed at a realistic density. Nothing here is an official
 * result, and every surface that reads it says so.
 */

const TIER_ORDER: readonly VerificationTier[] = ["EMAIL", "SOCIAL", "VERIFIED"];

/** Split a total into tiers, distributing the remainder deterministically. */
function allocate(total: number, shares: readonly number[]): TierBucket {
  const safeTotal = Math.max(0, Math.floor(total));
  const raw = shares.map((share) => safeTotal * share);
  const values = raw.map((value) => Math.floor(value));
  let remainder = safeTotal - values.reduce((sum, value) => sum + value, 0);

  for (let index = 0; remainder > 0; index += 1) {
    values[index % values.length] = (values[index % values.length] ?? 0) + 1;
    remainder -= 1;
  }

  return {
    EMAIL: values[0] ?? 0,
    SOCIAL: values[1] ?? 0,
    VERIFIED: values[2] ?? 0,
  };
}

/** Allocate an engagement total, never exceeding that tier's supporter count. */
function allocateWithin(total: number, supporters: TierBucket): TierBucket {
  const shares = TIER_ORDER.map((tier) => supporters[tier] / Math.max(1, totalSupporters(supporters)));
  const allocated = allocate(total, shares);

  return {
    EMAIL: Math.min(allocated.EMAIL, supporters.EMAIL),
    SOCIAL: Math.min(allocated.SOCIAL, supporters.SOCIAL),
    VERIFIED: Math.min(allocated.VERIFIED, supporters.VERIFIED),
  };
}

/**
 * Per-entry sample inputs. `prePledgeAccounts` is stated explicitly rather than
 * inferred from the amount, because the official rule scores the act of
 * pre-pledging, never the money.
 */
const perEntry: Readonly<
  Record<string, { feedbackAccounts: number; prePledgeAccounts: number }>
> = {
  "sungrid-community-power": { feedbackAccounts: 29, prePledgeAccounts: 74 },
  "farmlink-coldbox": { feedbackAccounts: 17, prePledgeAccounts: 51 },
  "campus-konekt": { feedbackAccounts: 38, prePledgeAccounts: 96 },
  "studymate-ng": { feedbackAccounts: 12, prePledgeAccounts: 33 },
  "zippy-campus": { feedbackAccounts: 9, prePledgeAccounts: 22 },
  "crop-circle": { feedbackAccounts: 11, prePledgeAccounts: 29 },
  agroroute: { feedbackAccounts: 13, prePledgeAccounts: 36 },
  "ecocharge-kiosks": { feedbackAccounts: 15, prePledgeAccounts: 41 },
  solarchill: { feedbackAccounts: 16, prePledgeAccounts: 47 },
  "kitchen-collective": { feedbackAccounts: 12, prePledgeAccounts: 31 },
};

const ENTRY_IDS = Object.keys(perEntry);

function signalsFor(idea: DiscoveryIdea): EntrySignals {
  const supporters = allocate(idea.supporters, [0.22, 0.38, 0.4]);
  const config = perEntry[idea.id] ?? {
    feedbackAccounts: idea.feedbackResponses,
    prePledgeAccounts: Math.round(idea.supporters * 0.18),
  };

  return {
    supporters,
    feedback: allocateWithin(config.feedbackAccounts, supporters),
    prePledge: allocateWithin(config.prePledgeAccounts, supporters),
  };
}

const byId = new Map(
  allPublicIdeas(ideasPreviewData).map((idea) => [idea.id, idea]),
);

const entries = rankEntries(
  ENTRY_IDS.flatMap((id) => {
    const idea = byId.get(id);
    if (!idea) return [];
    const signals = signalsFor(idea);
    return [{ idea, signals, score: entryScore(signals) }];
  }),
);

export const previewCompetition: Ideathon = {
  id: "ideathon-sustainable-solutions-2026-10",
  slug: "sustainable-solutions",
  title: "Big ideas. Real impact.",
  theme: "Sustainable Solutions",
  themeSummary:
    "Ideas that tackle climate, food, energy, and environmental challenges in Africa.",
  description:
    "Every month, the Inverge ideathon brings creators together to solve real problems. Explore the ideas taking part, see how the community is responding, and support the builders whose work you want to exist.",
  startsAt: "2026-10-01T00:00:00.000Z",
  endsAt: "2026-10-31T23:59:59.000Z",
  status: "open",
  prizeDescription:
    "Recognition in the Inverge showcase, a creator feature, and coaching with the Inverge team. Fulfilled outside the platform.",
  updatedAt: "2026-10-17T08:00:00.000Z",
  entries,
};

export const previewNextCompetition = {
  theme: "Tools for everyday work",
  opensAt: "2026-11-01T00:00:00.000Z",
  summary:
    "Software and services that make small, repetitive work faster for traders, artisans, and local businesses.",
} as const;
