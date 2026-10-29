import "server-only";

import { previewAnalytics } from "@/features/analytics/content/preview-analytics";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { readSessionToken } from "@/features/auth/server/session";
import { previewFeedbackSubmissions } from "@/features/feedback/content/preview-feedback";
import { getPreviewIdeaDetail } from "@/features/ideas/content/preview-idea-detail";
import { previewMyIdeas } from "@/features/ideas/content/preview-my-ideas";
import {
  buildCreatorIdeaRows,
  type CreatorIdeaRow,
} from "@/features/ideas/lib/creator-rows";
import {
  computeCreatorMetrics,
  recommendCreatorActions,
  type CreatorMetrics,
  type CreatorNextStep,
} from "@/features/ideas/lib/studio-metrics";
import {
  getLiveMyIdeas,
  toMyIdea,
  type ApiIdea,
} from "@/features/ideas/server/live-ideas";
import type { MyIdea } from "@/features/ideas/types";
import { ApiRequestError, isApiConfigured } from "@/lib/api/server";

/**
 * The creator's own workspace, projected once for the studio routes.
 *
 * Live auth reads `GET /ideas?mine=true`, so ownership and draft visibility are
 * decided by the API. Preview auth keeps the fixture account, and the view names
 * its source so a page never mixes the two. Feedback setup is preview-only for
 * now: the API exposes response counts but no creator inbox or builder, so live
 * rows keep the count and omit the link rather than sending the creator to a
 * fixture-only route.
 */
export type CreatorStudioView = {
  dataSource: "live" | "preview";
  /** The idea with the most responses, when one has any. */
  feedbackIdea: CreatorIdeaRow | null;
  metrics: CreatorMetrics;
  nextSteps: CreatorNextStep[];
  rows: CreatorIdeaRow[];
  /** True when the API has more owned ideas than the bounded live window. */
  truncated: boolean;
};

export type CreatorStudioResult =
  | { status: "ready"; view: CreatorStudioView }
  | { status: "signed_out" }
  | { status: "unavailable"; reason: string };

function feedbackLeader(
  rows: readonly CreatorIdeaRow[],
): CreatorIdeaRow | null {
  return (
    [...rows]
      .filter((row) => row.feedbackResponses > 0)
      .sort((left, right) => right.feedbackResponses - left.feedbackResponses)
      .at(0) ?? null
  );
}

function previewView(): CreatorStudioView {
  const feedbackCounts = Object.fromEntries(
    Object.entries(previewFeedbackSubmissions).map(([ideaId, submissions]) => [
      ideaId,
      submissions.length,
    ]),
  );

  const rows = buildCreatorIdeaRows(previewMyIdeas, {
    analyticsIdeaIds: [previewAnalytics.idea.id],
    feedbackCounts,
    hasDetail: (ideaId) => getPreviewIdeaDetail(ideaId) !== undefined,
  });

  return {
    dataSource: "preview",
    feedbackIdea: feedbackLeader(rows),
    metrics: computeCreatorMetrics(previewMyIdeas, feedbackCounts),
    nextSteps: recommendCreatorActions(previewMyIdeas),
    rows,
    truncated: false,
  };
}

function liveView(
  apiIdeas: readonly ApiIdea[],
  truncated: boolean,
): CreatorStudioView {
  const byId = new Map(apiIdeas.map((idea) => [idea.id, idea]));
  const ideas = apiIdeas
    .map(toMyIdea)
    .filter((idea): idea is MyIdea => idea !== null);
  const feedbackCounts = Object.fromEntries(
    apiIdeas.map((idea) => [idea.id, idea.feedbackCount ?? 0]),
  );

  const rows = buildCreatorIdeaRows(ideas, {
    analyticsIdeaIds: ideas.map((idea) => idea.id),
    feedbackCounts,
    // LINK_ONLY ideas still have a readable public page; only DRAFT does not.
    hasDetail: (ideaId) => {
      const idea = byId.get(ideaId);
      return idea ? idea.status !== "DRAFT" : false;
    },
    hasFeedback: () => false,
  });

  return {
    dataSource: "live",
    feedbackIdea: feedbackLeader(rows),
    metrics: computeCreatorMetrics(ideas, feedbackCounts),
    nextSteps: recommendCreatorActions(ideas),
    rows,
    truncated,
  };
}

function unavailable(error: unknown): CreatorStudioResult {
  const status = error instanceof ApiRequestError ? error.status : null;
  return {
    reason:
      status !== null && status >= 500
        ? "The creator service is temporarily unavailable. Try again."
        : "We could not load your creator workspace. Try again.",
    status: "unavailable",
  };
}

export async function getCreatorView(): Promise<CreatorStudioResult> {
  if (isPreviewAuth() || !isApiConfigured()) {
    return { status: "ready", view: previewView() };
  }

  const token = await readSessionToken();
  if (!token) return { status: "signed_out" };

  try {
    const { ideas, truncated } = await getLiveMyIdeas(token);
    return { status: "ready", view: liveView(ideas, truncated) };
  } catch (error) {
    if (
      error instanceof ApiRequestError &&
      (error.status === 401 || error.status === 403)
    ) {
      return { status: "signed_out" };
    }
    return unavailable(error);
  }
}
