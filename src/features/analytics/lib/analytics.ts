import { evaluateGate } from "@/features/ideas/lib/gate";
import type { IdeaDetail } from "@/features/ideas/types";
import type { AnalyticsPoint } from "@/features/analytics/lib/types";
import { formatMoney } from "@/lib/money";

export const ANALYTICS_PERIODS = [7, 30, 90] as const;
export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

export const defaultAnalyticsPeriod: AnalyticsPeriod = 30;

export function parseAnalyticsPeriod(
  value: string | string[] | undefined,
): AnalyticsPeriod {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "", 10);
  return parsed === 7 || parsed === 30 || parsed === 90
    ? parsed
    : defaultAnalyticsPeriod;
}

function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shiftUtcDay(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return utcDay(date);
}

/**
 * The inclusive UTC day range for a period, plus the immediately preceding
 * range.
 *
 * The API treats `from` and `to` as UTC calendar days. Sending the range from
 * the browser would make the window depend on the reader's clock, so the server
 * derives it once and passes the same dates to every report on the page.
 */
export type AnalyticsDateRange = {
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
};

export function analyticsDateRange(
  period: AnalyticsPeriod,
  now: Date = new Date(),
): AnalyticsDateRange {
  const to = utcDay(now);
  const from = shiftUtcDay(to, -(period - 1));
  const previousTo = shiftUtcDay(from, -1);
  const previousFrom = shiftUtcDay(previousTo, -(period - 1));

  return { from, previousFrom, previousTo, to };
}

/**
 * The current-period slice of a daily view series.
 *
 * The API zero-fills every day in the requested range. Slicing by the range
 * boundary rather than by array length keeps the chart correct when the API
 * adds a bucket or changes its interval.
 */
export function currentViewSeries<T extends { date: string }>(
  points: readonly T[],
  from: string,
): T[] {
  return points.filter((point) => point.date.slice(0, 10) >= from);
}

export type AnalyticsWindow = {
  period: AnalyticsPeriod;
  points: readonly AnalyticsPoint[];
  supporterChange: number | null;
  previousSupporterChange: number | null;
  interestChangeAtomic: string | null;
  previousInterestChangeAtomic: string | null;
  hasComparison: boolean;
};

/**
 * Slice a series to a period and compare it with the immediately preceding
 * period. When the available history does not cover both windows, comparison
 * figures are `null` rather than zero or a fabricated percentage.
 */
export function analyticsWindow(
  series: readonly AnalyticsPoint[],
  period: AnalyticsPeriod,
): AnalyticsWindow {
  if (series.length === 0) {
    return {
      period,
      points: [],
      supporterChange: null,
      previousSupporterChange: null,
      interestChangeAtomic: null,
      previousInterestChangeAtomic: null,
      hasComparison: false,
    };
  }

  const end = series.length - 1;
  const start = Math.max(0, end - period);
  const latest = series[end];
  const baseline = series[start];
  const hasBaseline = start > 0;
  const previousStart = Math.max(0, start - period);
  const hasComparison = start - period >= 0;

  const supporterChange =
    latest && baseline ? latest.supporters - baseline.supporters : null;
  const interestChangeAtomic =
    latest && baseline
      ? (
          BigInt(latest.estimatedInterestAtomic) -
          BigInt(baseline.estimatedInterestAtomic)
        ).toString()
      : null;

  const previousSupporterChange =
    hasComparison && baseline && series[previousStart]
      ? baseline.supporters -
        (series[previousStart]?.supporters ?? baseline.supporters)
      : null;
  const previousInterestChangeAtomic =
    hasComparison && baseline && series[previousStart]
      ? (
          BigInt(baseline.estimatedInterestAtomic) -
          BigInt(
            series[previousStart]?.estimatedInterestAtomic ??
              baseline.estimatedInterestAtomic,
          )
        ).toString()
      : null;

  return {
    period,
    points: series.slice(start),
    supporterChange: hasBaseline ? supporterChange : null,
    previousSupporterChange,
    interestChangeAtomic: hasBaseline ? interestChangeAtomic : null,
    previousInterestChangeAtomic,
    hasComparison,
  };
}

export function formatSeriesDate(iso: string, withYear = false): string {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  };
  if (withYear) options.year = "numeric";

  return new Intl.DateTimeFormat("en-GB", options).format(new Date(iso));
}

export type Recommendation = {
  body: string;
  key: "convert" | "feedback" | "share" | "supporters" | "interest";
  title: string;
};

/**
 * Next steps derived only from the existing FR-204 gate and observed feedback.
 * This is not a second quality score: every line names a threshold or an
 * observed count that the creator can act on.
 */
export function recommendIdeaActions(idea: IdeaDetail): Recommendation[] {
  const gate = evaluateGate(
    { prePledged: idea.prePledged, supporters: idea.supporters },
    idea.gate,
  );
  const recommendations: Recommendation[] = [];

  const supporters = gate.checks.find(
    (check) => check.requirement === "supporters",
  );
  if (supporters && !supporters.met) {
    recommendations.push({
      body: `The launch threshold is ${supporters.required.toLocaleString("en-US")} supporters. Share one specific part of the idea rather than the whole page and ask people to support it if they want it to exist.`,
      key: "supporters",
      title: `${(supporters.required - supporters.current).toLocaleString("en-US")} more supporters to reach the threshold`,
    });
  }

  const interest = gate.checks.find(
    (check) => check.requirement === "pre-pledged",
  );
  if (interest && !interest.met) {
    const remaining =
      BigInt(interest.required.atomic) - BigInt(interest.current.atomic);
    recommendations.push({
      body: `Estimated interest is ${formatMoney(interest.current)} against a ${formatMoney(interest.required)} threshold. A pre-pledge is non-binding, so make it clear that recording intent moves no money.`,
      key: "interest",
      title: `${formatMoney({ atomic: remaining.toString(), currency: "USD", decimals: 2 })} more estimated interest to reach the threshold`,
    });
  }

  if (idea.feedbackResponses === 0) {
    recommendations.push({
      body: "Structured feedback is the part a support count cannot replace. Ask a few people who know the problem what would stop them backing it.",
      key: "feedback",
      title: "Ask for structured feedback",
    });
  } else if (idea.feedbackScore < 4) {
    recommendations.push({
      body: `The average rating is ${idea.feedbackScore.toFixed(1)} / 5 across ${idea.feedbackResponses} responses. Read the lowest ratings first and answer the concern in the story before asking for more support.`,
      key: "feedback",
      title: "Respond to the concerns behind the rating",
    });
  }

  if (gate.convertible) {
    recommendations.push({
      body: "Both launch thresholds are met. The next step is opening a campaign draft, which carries supporters over as a notified waitlist.",
      key: "convert",
      title: "Your idea has met the launch threshold",
    });
  }

  recommendations.push({
    body: "A short update about what changed after feedback gives supporters a reason to return and shows that the signal is being used.",
    key: "share",
    title: "Share what changed",
  });

  return recommendations.slice(0, 3);
}
