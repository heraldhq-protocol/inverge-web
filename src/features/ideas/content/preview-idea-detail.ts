import type { IdeaDetail } from "@/features/ideas/types";
import { findIdeaById } from "@/features/ideas/lib/catalog";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import { previewCoverFor } from "@/features/ideas/content/preview-covers";
import { previewIdeaDetails } from "@/features/ideas/content/preview-details";
import {
  getPreviewFeedbackForm,
  previewCommunityInvites,
  previewCreatorFollows,
  previewGoals,
} from "@/features/feedback/content/preview-feedback";

/**
 * One merged public idea record for every surface.
 *
 * The catalogue summary, story, goals, feedback form and community settings are
 * separate fixtures on purpose (they change for different reasons). This helper
 * is the single place they are joined, so the detail page, the feedback modal,
 * and analytics cannot disagree about what the creator configured.
 */
export function getPreviewIdeaDetail(id: string): IdeaDetail | undefined {
  const summary = findIdeaById(ideasPreviewData, id);
  const detail = previewIdeaDetails[id];
  if (!summary || !detail) return undefined;

  const goals = previewGoals[id] ?? {
    community: false,
    feedback: true,
    funding: false,
  };
  const handle = previewCreatorFollows[id];
  return {
    ...summary,
    ...detail,
    goals,
    community: previewCommunityInvites[id],
    cover: detail.cover ?? previewCoverFor(id),
    creatorFollow: handle
      ? {
          creatorHandle: handle,
          creatorId: summary.creatorInitials.toLocaleLowerCase(),
          followerCount: id === "campus-konekt" ? 412 : 83,
          isFollowing: false,
        }
      : undefined,
    feedbackForm: getPreviewFeedbackForm(id),
    fundingIntent: goals.funding
      ? {
          estimatedAsk: detail.askAmount,
          nextStep:
            "If the idea becomes a campaign, supporters are notified first. Nothing here opens a raise or moves money.",
          useOfFunds: detail.askBreakdown,
        }
      : undefined,
  };
}

export function allPreviewIdeaDetails(): IdeaDetail[] {
  return [...ideasPreviewData.featured, ...ideasPreviewData.ideas].flatMap(
    (idea) => {
      const detail = getPreviewIdeaDetail(idea.id);
      return detail ? [detail] : [];
    },
  );
}
