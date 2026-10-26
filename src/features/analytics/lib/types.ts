import type { DiscoveryCategory } from "@/features/home/discovery-categories";
import type { IdeaArtworkVariant } from "@/features/home/types";
import type {
  IdeaDetail,
  IdeaStatus,
  IdeaVisibility,
} from "@/features/ideas/types";
import type { MoneyAmount } from "@/lib/money";

import type { AnalyticsPeriod } from "@/features/analytics/lib/analytics";

/** A cumulative support/interest point, in the shape the preview fixtures use. */
export type AnalyticsPoint = {
  date: string;
  supporters: number;
  estimatedInterestAtomic: string;
};

/** One aggregate event shown in the creator's recent-activity list. */
export type AnalyticsActivity = {
  date: string;
  detail: string;
  kind: "feedback" | "interest" | "published" | "supporter";
  title: string;
};

export type AnalyticsDataSource = "live" | "preview";

export type AnalyticsSummaryView = {
  views: number | null;
  uniqueSessions: number | null;
  uniqueSessionsExact: boolean;
  supporters: number;
  estimatedInterest: MoneyAmount;
  feedbackCount: number;
  feedbackScore: number;
  commentCount: number;
  prePledges: number | null;
  follows: number | null;
  saves: number | null;
  lastAggregatedDay: string | null;
};

export type AnalyticsViewPoint = {
  date: string;
  views: number;
  uniqueSessions: number;
  supportCount: number;
  prePledgeCount: number;
};

export type AnalyticsFeedbackQuestionView = {
  id: string;
  prompt: string;
  type: "BOOLEAN" | "MULTI_CHOICE" | "RATING" | "SINGLE_CHOICE" | "TEXT";
  answered: number;
  average: number | null;
  distribution: readonly { rating: number; count: number }[];
  tallies: readonly { label: string; count: number; share: number }[];
  textAnswers: readonly string[];
};

export type AnalyticsFeedbackView = {
  responseCount: number;
  configured: boolean;
  ratingAverage: number | null;
  ratingCount: number;
  ratingDistribution: readonly { rating: number; count: number }[];
  questions: readonly AnalyticsFeedbackQuestionView[];
  /**
   * True only when the surface holds the submitted text. The API returns
   * aggregates for the creator dashboard, so live reports never claim to show
   * words they do not have.
   */
  textAnswersAvailable: boolean;
};

export type AnalyticsTierView = {
  key: string;
  label: string;
  count: number;
  weight?: string;
  weighted?: MoneyAmount;
};

export type AnalyticsAcquisitionSourceView = {
  source: string;
  label: string;
  views: number;
  uniqueSessions: number;
  sharePct: number | null;
};

export type AnalyticsAcquisitionView = {
  totalViews: number;
  sources: readonly AnalyticsAcquisitionSourceView[];
  premium: boolean;
};

export type AnalyticsGeographyCountryView = {
  countryCode: string;
  label: string;
  views: number;
  uniqueSessions: number;
  sharePct: number | null;
};

export type AnalyticsGeographyView = {
  totalViews: number;
  countries: readonly AnalyticsGeographyCountryView[];
  truncated: boolean;
  premium: boolean;
};

export type AnalyticsConversionView = {
  viewToSupportPct: number | null;
  viewToFeedbackPct: number | null;
  viewToCommentPct: number | null;
};

/**
 * The single view model every analytics page renders.
 *
 * Live and preview data are mapped into this shape before rendering, so a page
 * cannot accidentally mix a live total with a fixture series. `views` is `null`
 * for preview because the fixture has no view data; it is never a fabricated
 * zero.
 */
export type AnalyticsWorkspaceView = {
  dataSource: AnalyticsDataSource;
  idea: IdeaDetail;
  /**
   * The server-side entitlement decision used to fetch the premium reports.
   * Pages gate premium panels on this, not on a client-side or inferred value.
   */
  premium: boolean;
  period: AnalyticsPeriod;
  from: string;
  to: string;
  summary: AnalyticsSummaryView;
  series: readonly AnalyticsPoint[];
  viewSeries: readonly AnalyticsViewPoint[];
  feedback: AnalyticsFeedbackView | null;
  tiers: readonly AnalyticsTierView[];
  activity: readonly AnalyticsActivity[];
  conversion: AnalyticsConversionView | null;
  acquisition: AnalyticsAcquisitionView | null;
  geography: AnalyticsGeographyView | null;
};

/** One row on the creator analytics index. */
export type CreatorAnalyticsIdea = {
  artwork: IdeaArtworkVariant;
  category: string;
  cover: string | null;
  description: string;
  discoveryCategory: DiscoveryCategory;
  feedbackResponses: number;
  id: string;
  prePledged: MoneyAmount;
  status: IdeaStatus | null;
  supporters: number;
  title: string;
  visibility: IdeaVisibility;
};
