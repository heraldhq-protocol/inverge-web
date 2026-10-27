import { getPreviewIdeaDetail } from "@/features/ideas/content/preview-idea-detail";
import { previewFeedbackSubmissions } from "@/features/feedback/content/preview-feedback";
import type { IdeaDetail } from "@/features/ideas/types";
import type {
  AnalyticsActivity,
  AnalyticsPoint,
} from "@/features/analytics/lib/types";
import type { MoneyAmount } from "@/lib/money";

export type {
  AnalyticsActivity,
  AnalyticsPoint,
} from "@/features/analytics/lib/types";

const DAY_MS = 86_400_000;
const END = Date.UTC(2026, 9, 16);
const ANALYTICS_IDEA_ID = "skill-circle";

/**
 * Split an integer total across weighted buckets without losing a unit.
 *
 * Money and counts are distributed as BigInt with weights scaled to a million,
 * so no amount passes through binary floating arithmetic (D-010). The remainder
 * is assigned one unit at a time, which keeps the sum exact.
 */
function distribute(total: bigint, weights: readonly number[]): bigint[] {
  const scaled = weights.map((weight) =>
    BigInt(Math.max(0, Math.round(weight * 1_000_000))),
  );
  const weightTotal = scaled.reduce((sum, weight) => sum + weight, 0n);
  if (weightTotal === 0n) return weights.map(() => 0n);

  const values = scaled.map((weight) => (total * weight) / weightTotal);
  let remainder = total - values.reduce((sum, value) => sum + value, 0n);

  for (let index = 0; remainder > 0n; index += 1) {
    const position = index % values.length;
    values[position] = (values[position] ?? 0n) + 1n;
    remainder -= 1n;
  }

  return values;
}

type SeriesInput = {
  days: number;
  startSupporters: number;
  endSupporters: number;
  startInterest: MoneyAmount;
  endInterest: MoneyAmount;
};

function buildSeries({
  days,
  startSupporters,
  endSupporters,
  startInterest,
  endInterest,
}: SeriesInput): readonly AnalyticsPoint[] {
  const steps = Math.max(1, days - 1);
  // Positive, slightly uneven increments: cumulative counts never fall, while
  // the line still reads like real activity rather than a ruler.
  const weights = Array.from(
    { length: steps },
    (_, index) =>
      1 + 0.5 * Math.sin(index * 1.31) + 0.24 * Math.cos(index * 0.57 + 1.2),
  );

  const supporterIncrements = distribute(
    BigInt(endSupporters - startSupporters),
    weights,
  );
  const interestIncrements = distribute(
    BigInt(endInterest.atomic) - BigInt(startInterest.atomic),
    weights,
  );

  let supporters = startSupporters;
  let interest = BigInt(startInterest.atomic);
  const firstDate = END - steps * DAY_MS;

  const points: AnalyticsPoint[] = [
    {
      date: new Date(firstDate).toISOString(),
      estimatedInterestAtomic: interest.toString(),
      supporters,
    },
  ];

  for (let index = 0; index < steps; index += 1) {
    supporters += Number(supporterIncrements[index] ?? 0n);
    interest += interestIncrements[index] ?? 0n;
    points.push({
      date: new Date(firstDate + (index + 1) * DAY_MS).toISOString(),
      estimatedInterestAtomic: interest.toString(),
      supporters,
    });
  }

  return points;
}

export type AnalyticsDataset = {
  idea: IdeaDetail;
  series: readonly AnalyticsPoint[];
  supportersByTier: readonly {
    tier: "Email" | "Identity verified" | "Social";
    count: number;
    weight: string;
  }[];
  /** Real sample submissions, attributed to the form version they answered. */
  demoSubmissions: readonly {
    answers: import("@/features/feedback/types").FeedbackAnswers;
    formVersion: number;
  }[];
  activity: readonly AnalyticsActivity[];
};

function requireIdea(): IdeaDetail {
  const idea = getPreviewIdeaDetail(ANALYTICS_IDEA_ID);
  if (!idea) {
    throw new Error(
      `Preview analytics needs the "${ANALYTICS_IDEA_ID}" idea in the catalogue.`,
    );
  }

  return idea;
}

const idea = requireIdea();
const publishedAt = new Date(idea.publishedAt).getTime();
const days = Math.max(2, Math.round((END - publishedAt) / DAY_MS) + 1);

/**
 * Preview analytics for one creator idea.
 *
 * Everything is sample data derived from the same preview record the public
 * page renders, so supporter and interest totals agree across surfaces. The API
 * already returns the equivalent series, tier breakdown and feedback histogram
 * from `GET /ideas/:id/insights`; views and referrals are not collected, so this
 * dataset deliberately has none.
 */
export const previewAnalytics: AnalyticsDataset = {
  idea,
  demoSubmissions: previewFeedbackSubmissions[ANALYTICS_IDEA_ID] ?? [],
  series: buildSeries({
    days,
    startSupporters: 12,
    endSupporters: idea.supporters,
    startInterest: { atomic: "12000000", currency: "USD", decimals: 2 },
    endInterest: idea.prePledged,
  }),
  supportersByTier: [
    { tier: "Email", count: 26, weight: "0.25" },
    { tier: "Social", count: 31, weight: "0.7" },
    { tier: "Identity verified", count: 26, weight: "1.0" },
  ],
  activity: [
    {
      date: "2026-10-16T09:20:00.000Z",
      detail: "+3 supporters, two identity-verified",
      kind: "supporter",
      title: "New supporters",
    },
    {
      date: "2026-10-15T16:05:00.000Z",
      detail: "4 / 5 rating, structured response",
      kind: "feedback",
      title: "New feedback",
    },
    {
      date: "2026-10-14T11:40:00.000Z",
      detail: "$250 indicative intent, non-binding",
      kind: "interest",
      title: "Pre-pledge recorded",
    },
    {
      date: "2026-10-11T08:00:00.000Z",
      detail: "Placed in the Community topic",
      kind: "published",
      title: "Featured in a topic",
    },
  ],
};

export const analyticsMetricLabels = {
  feedback: "Feedback received",
  interest: "Estimated interest",
  supporters: "Total supporters",
  views: "Idea views",
} as const;

export { distribute, END, ANALYTICS_IDEA_ID };
