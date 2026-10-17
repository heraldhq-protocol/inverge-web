import "server-only";

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
  /** Feedback setup for this idea, when its public record exists. */
  setupHref: string | null;
  workspaceHref: string;
};

export type FeedbackInboxView = {
  /** One section per idea with responses, newest response first. */
  groups: readonly FeedbackInboxGroup[];
  totalResponses: number;
};

export function getFeedbackInboxView(): FeedbackInboxView {
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
  };
}
