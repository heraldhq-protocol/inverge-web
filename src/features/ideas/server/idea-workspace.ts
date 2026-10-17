import "server-only";

import { previewAnalytics } from "@/features/analytics/content/preview-analytics";
import {
  getPreviewFeedbackForm,
  previewFeedbackSubmissions,
} from "@/features/feedback/content/preview-feedback";
import {
  describeSubmissionAnswers,
  type DescribedAnswer,
} from "@/features/feedback/lib/submissions";
import { getPreviewIdeaDetail } from "@/features/ideas/content/preview-idea-detail";
import { previewMyIdeas } from "@/features/ideas/content/preview-my-ideas";
import type { MyIdea } from "@/features/ideas/types";

/**
 * One idea's creator workspace: the view model behind `/d/creator/ideas/[id]`.
 *
 * Scoped to the ideas the signed-in account owns. An id outside that list
 * resolves to `null` and the route 404s, so editing the URL never reaches
 * another creator's idea. Links are populated only for routes that actually
 * resolve: a draft that was never published has no public page, and only the
 * idea with an analytics dataset gets analytics.
 */
export type IdeaWorkspaceView = {
  idea: MyIdea;
  /** Public idea page (D-014), when the idea has a published record. */
  detailHref: string | null;
  /** Feedback setup, when the idea resolves to a public detail record. */
  feedbackHref: string | null;
  /** Analytics workspace, when an analytics dataset exists for the idea. */
  analyticsHref: string | null;
  feedbackCount: number;
  /** The newest responses, already resolved against the form's questions. */
  latestFeedback: readonly {
    answers: readonly DescribedAnswer[];
    submittedAt: string;
  }[];
  summary: { problem: string; solution: string } | null;
};

export function getIdeaWorkspaceView(ideaId: string): IdeaWorkspaceView | null {
  const idea = previewMyIdeas.find((candidate) => candidate.id === ideaId);
  if (!idea) return null;

  const detail = getPreviewIdeaDetail(ideaId);
  const submissions = previewFeedbackSubmissions[ideaId] ?? [];
  const questions = getPreviewFeedbackForm(ideaId)?.questions ?? [];
  const hasAnalytics = previewAnalytics.idea.id === ideaId;

  const latestFeedback = [...submissions]
    .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt))
    .slice(0, 3)
    .map((submission) => ({
      answers: describeSubmissionAnswers(questions, submission.answers),
      submittedAt: submission.submittedAt,
    }));

  return {
    idea,
    detailHref: detail ? `/ideas/${ideaId}` : null,
    feedbackHref: detail ? `/d/creator/ideas/${ideaId}/feedback` : null,
    analyticsHref: hasAnalytics ? `/d/creator/ideas/${ideaId}/insights` : null,
    feedbackCount: submissions.length,
    latestFeedback,
    summary: detail
      ? { problem: detail.problem, solution: detail.solution }
      : null,
  };
}
