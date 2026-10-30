import "server-only";

import { previewAnalytics } from "@/features/analytics/content/preview-analytics";
import { isPreviewAuth } from "@/features/auth/server/auth-mode";
import { readSessionToken } from "@/features/auth/server/session";
import {
  getPreviewFeedbackForm,
  previewFeedbackSubmissions,
} from "@/features/feedback/content/preview-feedback";
import { toFeedbackAnswers } from "@/features/feedback/lib/answers";
import {
  describeSubmissionAnswers,
  type DescribedAnswer,
} from "@/features/feedback/lib/submissions";
import {
  toFeedbackForm,
  type ApiQuestion,
} from "@/features/feedback/server/builder";
import { getPreviewIdeaDetail } from "@/features/ideas/content/preview-idea-detail";
import { previewMyIdeas } from "@/features/ideas/content/preview-my-ideas";
import {
  getLiveIdea,
  toIdeaDetail,
  toMyIdea,
} from "@/features/ideas/server/live-ideas";
import type { MyIdea } from "@/features/ideas/types";
import { ApiRequestError, fetchApiJson, isApiConfigured } from "@/lib/api/server";

export type IdeaWorkspaceView = {
  dataSource: "live" | "preview";
  idea: MyIdea;
  /** Public idea page (D-014), when the idea has a published record. */
  detailHref: string | null;
  /** Feedback setup, when the selected source can resolve the builder. */
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

export type IdeaWorkspaceResult =
  | { status: "ready"; view: IdeaWorkspaceView }
  | { status: "not_found" }
  | { status: "signed_out" }
  | { status: "unavailable"; reason: string };

type ApiWorkspaceFeedback = {
  questions: ApiQuestion[];
  data: Array<{
    answers: unknown;
    createdAt: string;
  }>;
  truncated: boolean;
};

function previewView(ideaId: string): IdeaWorkspaceResult {
  const idea = previewMyIdeas.find((candidate) => candidate.id === ideaId);
  if (!idea) return { status: "not_found" };

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
    status: "ready",
    view: {
      dataSource: "preview",
      idea,
      detailHref: detail ? `/ideas/${ideaId}` : null,
      feedbackHref: detail ? `/d/creator/ideas/${ideaId}/feedback` : null,
      analyticsHref: hasAnalytics
        ? `/d/creator/ideas/${ideaId}/insights`
        : null,
      feedbackCount: submissions.length,
      latestFeedback,
      summary: detail
        ? { problem: detail.problem, solution: detail.solution }
        : null,
    },
  };
}

function failure(error: unknown): IdeaWorkspaceResult {
  const status = error instanceof ApiRequestError ? error.status : null;
  if (status === 401) return { status: "signed_out" };
  if (status === 403 || status === 404) return { status: "not_found" };
  return {
    reason:
      status !== null && status >= 500
        ? "The creator service is temporarily unavailable. Try again."
        : "We could not load this idea workspace. Try again.",
    status: "unavailable",
  };
}

/**
 * One idea's creator workspace.
 *
 * Live auth reads the idea with `includeDraft`, the creator-only insights report,
 * and the anonymous response list together; insights and responses both enforce
 * ownership. The workspace shows the newest three responses against the current
 * form, or none when the idea has no survey yet.
 */
export async function getIdeaWorkspaceView(
  ideaId: string,
): Promise<IdeaWorkspaceResult> {
  if (isPreviewAuth() || !isApiConfigured()) {
    return previewView(ideaId);
  }

  const token = await readSessionToken();
  if (!token) return { status: "signed_out" };

  try {
    const [apiIdea, , feedback] = await Promise.all([
      getLiveIdea(ideaId, { includeDraft: true, token }),
      fetchApiJson(`/ideas/${encodeURIComponent(ideaId)}/insights`, { token }),
      fetchApiJson<ApiWorkspaceFeedback>(
        `/ideas/${encodeURIComponent(ideaId)}/survey/responses?limit=3`,
        { token },
      ),
    ]);
    if (!apiIdea) return { status: "not_found" };

    const idea = toMyIdea(apiIdea);
    if (!idea) return { status: "not_found" };

    const detail = toIdeaDetail(apiIdea);
    const id = apiIdea.id;
    const form = toFeedbackForm(feedback.questions);
    const latestFeedback = feedback.data.map((response) => ({
      answers: describeSubmissionAnswers(
        form.questions,
        toFeedbackAnswers(response.answers),
      ),
      submittedAt: response.createdAt,
    }));

    return {
      status: "ready",
      view: {
        dataSource: "live",
        idea,
        detailHref: apiIdea.status === "DRAFT" ? null : `/ideas/${id}`,
        feedbackHref:
          apiIdea.status === "DRAFT"
            ? `/d/creator/ideas/${id}/feedback`
            : null,
        analyticsHref: `/d/creator/ideas/${id}/insights`,
        feedbackCount: apiIdea.feedbackCount ?? 0,
        latestFeedback,
        summary: { problem: detail.problem, solution: detail.solution },
      },
    };
  } catch (error) {
    return failure(error);
  }
}
