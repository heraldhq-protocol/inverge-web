import "server-only";

import { previewAnalytics } from "@/features/analytics/content/preview-analytics";
import { previewFeedbackSubmissions } from "@/features/feedback/content/preview-feedback";
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
import { getPreviewIdeaDetail } from "@/features/ideas/content/preview-idea-detail";
import { previewMyIdeas } from "@/features/ideas/content/preview-my-ideas";

/**
 * The creator's own workspace, projected once for both studio routes.
 *
 * Ownership is not checked here because the fixture *is* the signed-in account's
 * work. When the API lands this function becomes the authorized query, and the
 * route keeps rendering the same view model.
 */
export type CreatorView = {
  /** The idea whose feedback form has a real destination, when one exists. */
  feedbackIdea: CreatorIdeaRow | null;
  metrics: CreatorMetrics;
  nextSteps: CreatorNextStep[];
  rows: CreatorIdeaRow[];
};

export function getCreatorView(): CreatorView {
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

  const feedbackIdea =
    [...rows]
      .filter((row) => row.feedbackHref !== null && row.feedbackResponses > 0)
      .sort((a, b) => b.feedbackResponses - a.feedbackResponses)
      .at(0) ?? null;

  return {
    feedbackIdea,
    metrics: computeCreatorMetrics(previewMyIdeas, feedbackCounts),
    nextSteps: recommendCreatorActions(previewMyIdeas),
    rows,
  };
}
