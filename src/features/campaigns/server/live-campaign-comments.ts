import "server-only";

import { fetchDiscussionPage } from "@/features/discussions/server/comments-api";
import type { CampaignComment } from "@/features/campaigns/types";

export type CampaignDiscussionView = {
  comments: CampaignComment[];
  hasMore: boolean;
  nextCursor: string | null;
  state: "live" | "unavailable";
};

export const CAMPAIGN_COMMENT_PAGE_SIZE = 20;

/**
 * The public campaign thread.
 *
 * Resolved by the campaign id the detail read already proved public, never by a
 * client-supplied slug. A failed thread is reported as `unavailable` so the tab
 * can offer a retry; it is never presented as "no comments".
 */
export async function getLiveCampaignComments(
  campaignId: string,
): Promise<CampaignDiscussionView> {
  try {
    const page = await fetchDiscussionPage(
      `/campaigns/${encodeURIComponent(campaignId)}/comments`,
      { limit: CAMPAIGN_COMMENT_PAGE_SIZE },
    );

    return {
      comments: page.comments.map((comment) => ({
        author: comment.author,
        body: comment.body,
        createdAt: comment.createdAt,
        id: comment.id,
      })),
      hasMore: page.hasMore,
      nextCursor: page.nextCursor,
      state: "live",
    };
  } catch {
    return {
      comments: [],
      hasMore: false,
      nextCursor: null,
      state: "unavailable",
    };
  }
}
