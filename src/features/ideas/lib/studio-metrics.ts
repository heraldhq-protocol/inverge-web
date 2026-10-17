import type { MyIdea } from "@/features/ideas/types";
import type { MoneyAmount } from "@/lib/money";

/**
 * Creator metrics, computed once from the rows the studio lists.
 *
 * The definitions are deliberately narrow, because each number is shown next to
 * a label:
 *
 * - published: ideas listed in discovery;
 * - draft: ideas that are not published;
 * - supporters: the sum of the supporters each idea records (one account can
 *   support more than one idea, so this is support signals, not unique people);
 * - feedback: structured responses, counted per idea;
 * - pre-pledged intent: non-binding interest in USD atomic units, never money
 *   raised. Empty inputs produce zero, never `undefined`.
 */
export type CreatorMetrics = {
  draftIdeas: number;
  feedbackReceived: number;
  prePledgedIntent: MoneyAmount;
  publishedIdeas: number;
  totalSupporters: number;
};

export function computeCreatorMetrics(
  ideas: readonly MyIdea[],
  feedbackCounts: Readonly<Record<string, number>>,
): CreatorMetrics {
  const prePledgedAtomic = ideas.reduce(
    (total, idea) => total + BigInt(idea.prePledged.atomic),
    0n,
  );

  return {
    draftIdeas: ideas.filter((idea) => idea.status === "draft").length,
    feedbackReceived: ideas.reduce(
      (total, idea) => total + (feedbackCounts[idea.id] ?? 0),
      0,
    ),
    prePledgedIntent: {
      atomic: prePledgedAtomic.toString(),
      currency: "USD",
      decimals: 2,
    },
    publishedIdeas: ideas.filter((idea) => idea.visibility === "public").length,
    totalSupporters: ideas.reduce((total, idea) => total + idea.supporters, 0),
  };
}

/**
 * What a creator should consider doing next, derived from their own rows.
 *
 * No suggestion appears without a matching record: a draft, a threshold that is
 * met, or no public idea at all. The links stay inside routes that exist.
 */
export type CreatorNextStep = {
  description: string;
  href: string;
  label: string;
  title: string;
};

export function recommendCreatorActions(
  ideas: readonly MyIdea[],
): CreatorNextStep[] {
  const steps: CreatorNextStep[] = [];

  const drafts = ideas.filter((idea) => idea.status === "draft");
  if (drafts.length > 0) {
    steps.push({
      description: `${drafts.length === 1 ? drafts[0]?.title : `${drafts.length} drafts`} ${
        drafts.length === 1 ? "is" : "are"
      } still private and cannot be found in discovery.`,
      href: "/d/ideas",
      label: "Review drafts",
      title: "Finish a draft",
    });
  }

  const ready = ideas.filter((idea) => idea.status === "threshold-met");
  if (ready.length > 0) {
    steps.push({
      description:
        "These ideas met the validation threshold. Review the signals before deciding whether to take one further.",
      href: "/d/ideas",
      label: "Check readiness",
      title: "A validated idea is ready for review",
    });
  }

  const unpublished = ideas.filter((idea) => idea.visibility === "private");
  if (unpublished.length > 0) {
    steps.push({
      description:
        "Unlisted ideas are reachable by link only. Listing one adds it to discovery, where supporters can find it.",
      href: "/d/ideas",
      label: "See unlisted ideas",
      title: "Make an idea discoverable",
    });
  }

  return steps;
}
