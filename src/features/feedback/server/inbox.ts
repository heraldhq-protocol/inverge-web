import "server-only";

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
import { ApiRequestError, fetchApiJson, isApiConfigured } from "@/lib/api/server";

/**
 * One response in the creator's inbox, scoped to the ideas they own.
 *
 * Responses are anonymous by design: an entry carries the idea it belongs to,
 * the form version it answered, and the date - never a respondent, because
 * feedback visibility is the respondent's choice, not the creator's. Reply
 * state is absent because this client has no reply surface yet; each group
 * links to the feedback setup that configures the form instead.
 */
export type FeedbackInboxEntry = {
  answers: readonly DescribedAnswer[];
  formVersion: number;
  submittedAt: string;
};

export type FeedbackInboxGroup = {
  entries: readonly FeedbackInboxEntry[];
  ideaId: string;
  ideaTitle: string;
  /** Feedback setup for this idea, when the survey is still editable. */
  setupHref: string | null;
  workspaceHref: string;
};

export type FeedbackInboxView = {
  /** One section per idea with responses, newest response first. */
  groups: readonly FeedbackInboxGroup[];
  totalResponses: number;
  truncated: boolean;
};

export type FeedbackInboxResult =
  | {
      status: "ready";
      view: FeedbackInboxView;
      dataSource: "live" | "preview";
    }
  | { status: "signed_out" }
  | { status: "unavailable"; reason: string };

type ApiFeedbackPage = {
  data: Array<{
    ideaId: string;
    ideaSlug: string;
    ideaStatus: string;
    ideaTitle: string;
    questions: ApiQuestion[];
    responses: Array<{
      answers: unknown;
      createdAt: string;
      id: string;
    }>;
  }>;
  totalResponses: number;
  truncated: boolean;
};

function previewView(): FeedbackInboxView {
  const groups = previewMyIdeas
    .flatMap((idea) => {
      const submissions = previewFeedbackSubmissions[idea.id];
      if (!submissions || submissions.length === 0) return [];

      const questions = getPreviewFeedbackForm(idea.id)?.questions ?? [];
      const entries = submissions
        .map((submission) => ({
          answers: describeSubmissionAnswers(questions, submission.answers),
          formVersion: submission.formVersion,
          submittedAt: submission.submittedAt,
        }))
        .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt));

      return [
        {
          entries,
          ideaId: idea.id,
          ideaTitle: idea.title,
          setupHref: getPreviewIdeaDetail(idea.id)
            ? `/d/creator/ideas/${idea.id}/feedback`
            : null,
          workspaceHref: `/d/creator/ideas/${idea.id}`,
        },
      ];
    })
    .sort((a, b) => {
      const newestA = a.entries[0]?.submittedAt ?? "";
      const newestB = b.entries[0]?.submittedAt ?? "";
      return Date.parse(newestB) - Date.parse(newestA);
    });

  return {
    groups,
    totalResponses: groups.reduce(
      (total, group) => total + group.entries.length,
      0,
    ),
    truncated: false,
  };
}

function liveView(page: ApiFeedbackPage): FeedbackInboxView {
  const groups = page.data
    .flatMap((group) => {
      const form = toFeedbackForm(group.questions);
      const entries = group.responses
        .map((response) => ({
          answers: describeSubmissionAnswers(
            form.questions,
            toFeedbackAnswers(response.answers),
          ),
          formVersion: form.version,
          submittedAt: response.createdAt,
        }))
        .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt));

      if (entries.length === 0) return [];

      return [
        {
          entries,
          ideaId: group.ideaId,
          ideaTitle: group.ideaTitle,
          setupHref:
            group.ideaStatus === "DRAFT"
              ? `/d/creator/ideas/${group.ideaId}/feedback`
              : null,
          workspaceHref: `/d/creator/ideas/${group.ideaId}`,
        },
      ];
    })
    .sort((a, b) => {
      const newestA = a.entries[0]?.submittedAt ?? "";
      const newestB = b.entries[0]?.submittedAt ?? "";
      return Date.parse(newestB) - Date.parse(newestA);
    });

  return {
    groups,
    totalResponses: page.totalResponses,
    truncated: page.truncated,
  };
}

export async function getFeedbackInboxView(): Promise<FeedbackInboxResult> {
  if (isPreviewAuth() || !isApiConfigured()) {
    return { dataSource: "preview", status: "ready", view: previewView() };
  }

  const token = await readSessionToken();
  if (!token) return { status: "signed_out" };

  try {
    const page = await fetchApiJson<ApiFeedbackPage>("/me/feedback?limit=100", {
      token,
    });
    return {
      dataSource: "live",
      status: "ready",
      view: liveView(page),
    };
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return { status: "signed_out" };
    }
    return {
      reason:
        error instanceof ApiRequestError
          ? error.message
          : "The API could not be reached.",
      status: "unavailable",
    };
  }
}
