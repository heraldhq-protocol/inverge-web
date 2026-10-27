import "server-only";

import { cache } from "react";

import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { readSessionToken } from "@/features/auth/server/session";
import { previewAnalytics } from "@/features/analytics/content/preview-analytics";
import {
  analyticsDateRange,
  currentViewSeries,
  type AnalyticsPeriod,
} from "@/features/analytics/lib/analytics";
import {
  mapAcquisition,
  mapActivity,
  mapConversion,
  mapFeedback,
  mapGeography,
  mapIdeaAnalyticsSummary,
  mapInsightsSeries,
  mapTiers,
  mapViewSeries,
  type ApiIdeaAnalyticsAcquisition,
  type ApiIdeaAnalyticsGeography,
  type ApiIdeaAnalyticsSummary,
  type ApiIdeaAnalyticsTimeseries,
  type ApiIdeaAnalyticsValidation,
  type ApiIdeaInsights,
} from "@/features/analytics/lib/live";
import { previewAnalyticsWorkspace } from "@/features/analytics/lib/preview";
import type {
  AnalyticsWorkspaceView,
  CreatorAnalyticsIdea,
} from "@/features/analytics/lib/types";
import { getAnalyticsAccess } from "@/features/analytics/server/access";
import {
  getLiveIdea,
  getLiveMyIdeas,
  ideaStatusFor,
  toDiscoveryIdea,
  toIdeaDetail,
  type ApiIdea,
} from "@/features/ideas/server/live-ideas";
import {
  ApiRequestError,
  fetchApiJson,
  isApiConfigured,
} from "@/lib/api/server";

const REPORT_TIMEOUT_MS = 5_000;

export type CreatorIdeaResult =
  | { status: "preview"; idea: AnalyticsWorkspaceView["idea"] }
  | {
      status: "live";
      idea: AnalyticsWorkspaceView["idea"];
      insights: ApiIdeaInsights;
    }
  | { status: "not_found" }
  | { status: "signed_out" }
  | { status: "unavailable"; reason: string };

export type AnalyticsWorkspaceResult =
  | { status: "preview" | "live"; view: AnalyticsWorkspaceView }
  | { status: "not_found" }
  | { status: "signed_out" }
  | { status: "unavailable"; reason: string };

export type CreatorAnalyticsIndexResult =
  | {
      status: "preview" | "live";
      ideas: readonly CreatorAnalyticsIdea[];
      truncated?: boolean;
    }
  | { status: "signed_out" }
  | { status: "unavailable"; reason: string };

function unavailable(error: unknown): {
  status: "unavailable";
  reason: string;
} {
  const status = error instanceof ApiRequestError ? error.status : null;
  return {
    reason:
      status !== null && status >= 500
        ? "The analytics service is temporarily unavailable. Try again."
        : "We could not load analytics for this idea. Try again.",
    status: "unavailable",
  };
}

function failure(error: unknown): CreatorIdeaResult | AnalyticsWorkspaceResult {
  const status = error instanceof ApiRequestError ? error.status : null;
  if (status === 401) return { status: "signed_out" };
  if (status === 403 || status === 404) return { status: "not_found" };
  return unavailable(error);
}

/**
 * A report failure after ownership has already been established.
 *
 * A 404 here is the API's analytics kill switch (`ANALYTICS_READ_ENABLED`),
 * not a missing idea: the creator-only insights read succeeded. Mapping it to
 * `notFound()` would hide an idea the creator owns.
 */
function reportFailure(error: unknown): AnalyticsWorkspaceResult {
  const status = error instanceof ApiRequestError ? error.status : null;
  if (status === 401) return { status: "signed_out" };
  if (status === 404) {
    return {
      reason:
        "Analytics reports are not enabled in this deployment. The idea itself is still available.",
      status: "unavailable",
    };
  }
  return unavailable(error);
}

/**
 * Resolves one idea for the analytics shell.
 *
 * Preview auth resolves only the fixture idea. Live auth reads the idea and the
 * creator-only insights report together: the insights endpoint is the ownership
 * check, so a published idea owned by someone else becomes a 404 here rather
 * than rendering a header before the page fails. React `cache` deduplicates the
 * pair across the layout and the page in one request.
 */
export const getCreatorIdea = cache(
  async (id: string): Promise<CreatorIdeaResult> => {
    if (isPreviewAuth() || !isApiConfigured()) {
      return id === previewAnalytics.idea.id
        ? { idea: previewAnalytics.idea, status: "preview" }
        : { status: "not_found" };
    }

    const token = await readSessionToken();
    if (!token) return { status: "signed_out" };

    try {
      const [idea, insights] = await Promise.all([
        getLiveIdea(id, { includeDraft: true, token }),
        fetchApiJson<ApiIdeaInsights>(
          `/ideas/${encodeURIComponent(id)}/insights`,
          { timeoutMs: REPORT_TIMEOUT_MS, token },
        ),
      ]);

      return idea
        ? { idea: toIdeaDetail(idea), insights, status: "live" }
        : { status: "not_found" };
    } catch (error) {
      return failure(error) as CreatorIdeaResult;
    }
  },
);

/**
 * Loads the live reports behind one analytics page.
 *
 * Basic reports (summary and daily timeseries) are always read for an owner.
 * Premium reports are requested only after the access endpoint confirms the
 * grant, so a locked page never leaks a report by fetching it and hiding the
 * response. The optional traffic reports are fetched only on the traffic tab.
 */
export async function getIdeaAnalyticsWorkspace(
  id: string,
  period: AnalyticsPeriod,
  options: { includeTraffic?: boolean } = {},
): Promise<AnalyticsWorkspaceResult> {
  const creator = await getCreatorIdea(id);
  if (creator.status === "preview") {
    return {
      status: "preview",
      view: previewAnalyticsWorkspace(period),
    };
  }
  if (creator.status !== "live") return creator;

  const token = await readSessionToken();
  if (!token) return { status: "signed_out" };

  const range = analyticsDateRange(period);
  const query = new URLSearchParams({
    from: range.from,
    interval: "day",
    to: range.to,
  });
  const reports = `/ideas/${encodeURIComponent(id)}/analytics`;

  try {
    const [access, summary, timeseries] = await Promise.all([
      getAnalyticsAccess(),
      fetchApiJson<ApiIdeaAnalyticsSummary>(
        `${reports}/summary?${query.toString()}`,
        { timeoutMs: REPORT_TIMEOUT_MS, token },
      ),
      fetchApiJson<ApiIdeaAnalyticsTimeseries>(
        `${reports}/timeseries?${query.toString()}`,
        { timeoutMs: REPORT_TIMEOUT_MS, token },
      ),
    ]);

    const premium = access.status === "premium";
    const validation = premium
      ? await fetchApiJson<ApiIdeaAnalyticsValidation>(
          `${reports}/validation?${query.toString()}`,
          { timeoutMs: REPORT_TIMEOUT_MS, token },
        ).catch(() => null)
      : null;

    let acquisition: ApiIdeaAnalyticsAcquisition | null = null;
    let geography: ApiIdeaAnalyticsGeography | null = null;

    if (premium && options.includeTraffic) {
      [acquisition, geography] = await Promise.all([
        fetchApiJson<ApiIdeaAnalyticsAcquisition>(
          `${reports}/acquisition?${query.toString()}`,
          { timeoutMs: REPORT_TIMEOUT_MS, token },
        ).catch(() => null),
        fetchApiJson<ApiIdeaAnalyticsGeography>(
          `${reports}/geography?${query.toString()}`,
          { timeoutMs: REPORT_TIMEOUT_MS, token },
        ).catch(() => null),
      ]);
    }

    return {
      status: "live",
      view: {
        acquisition:
          acquisition?.premium === true ? mapAcquisition(acquisition) : null,
        activity: mapActivity(creator.insights),
        conversion: validation ? mapConversion(validation) : null,
        dataSource: "live",
        feedback: mapFeedback(creator.insights),
        from: range.from,
        geography: geography?.premium === true ? mapGeography(geography) : null,
        idea: creator.idea,
        period,
        premium,
        series: mapInsightsSeries(creator.insights),
        summary: mapIdeaAnalyticsSummary(summary),
        tiers: mapTiers(creator.insights),
        to: range.to,
        viewSeries: currentViewSeries(mapViewSeries(timeseries), range.from),
      },
    };
  } catch (error) {
    return reportFailure(error);
  }
}

function previewIndexIdea(): CreatorAnalyticsIdea {
  const idea = previewAnalytics.idea;
  return {
    artwork: idea.artwork,
    category: idea.category,
    cover: idea.cover ?? null,
    description: idea.description,
    discoveryCategory: idea.discoveryCategory,
    feedbackResponses: previewAnalytics.demoSubmissions.length,
    id: idea.id,
    prePledged: idea.prePledged,
    status: null,
    supporters: idea.supporters,
    title: idea.title,
    visibility: idea.visibility,
  };
}

function indexIdea(idea: ApiIdea): CreatorAnalyticsIdea {
  const base = toDiscoveryIdea(idea);
  return {
    artwork: base.artwork,
    category: base.category,
    cover: base.cover ?? null,
    description: base.description,
    discoveryCategory: base.discoveryCategory,
    feedbackResponses: idea.feedbackCount ?? 0,
    id: idea.id,
    prePledged: base.prePledged,
    status: ideaStatusFor(idea.status),
    supporters: base.supporters,
    title: base.title,
    visibility: base.visibility,
  };
}

/**
 * The creator analytics index. Preview auth gets the one fixture idea; live
 * auth reads the creator's own list from the API. No public catalogue is used to
 * assemble this page.
 */
export async function getCreatorAnalyticsIndex(): Promise<CreatorAnalyticsIndexResult> {
  if (isPreviewAuth() || !isApiConfigured()) {
    return { ideas: [previewIndexIdea()], status: "preview" };
  }

  const token = await readSessionToken();
  if (!token) return { status: "signed_out" };

  try {
    const { ideas, truncated } = await getLiveMyIdeas(token);
    return {
      ideas: ideas.map(indexIdea),
      status: "live",
      truncated,
    };
  } catch (error) {
    const status = error instanceof ApiRequestError ? error.status : null;
    if (status === 401) return { status: "signed_out" };
    return unavailable(error);
  }
}
