import type { DiscussionComment } from "@/features/discussions/types";

/** The comment shape both discussion endpoints return. */
export type ApiDiscussionComment = {
  id: string;
  body: string;
  createdAt: string;
  highlighted?: boolean;
  likeCount?: number;
  author: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    isCreator: boolean;
  };
};

export type ApiDiscussionPage = {
  data: ApiDiscussionComment[];
  page: { hasMore: boolean; nextCursor: string | null };
};

/**
 * Projects one API comment onto the view model.
 *
 * Nothing is derived from a display string: the author id is the API's opaque
 * account id, and an absent display name stays null so the UI can use a neutral
 * label. An email is never considered, because the API never sends one.
 */
export function toDiscussionComment(
  comment: ApiDiscussionComment,
): DiscussionComment {
  return {
    author: {
      avatarUrl: comment.author.avatarUrl,
      displayName: comment.author.displayName,
      id: comment.author.id,
      isCreator: comment.author.isCreator,
    },
    body: comment.body,
    createdAt: comment.createdAt,
    id: comment.id,
    ...(typeof comment.highlighted === "boolean"
      ? { pinned: comment.highlighted }
      : {}),
    ...(typeof comment.likeCount === "number"
      ? { likeCount: comment.likeCount }
      : {}),
  };
}

export function toDiscussionPage(page: ApiDiscussionPage) {
  return {
    comments: page.data.map(toDiscussionComment),
    hasMore: page.page.hasMore,
    nextCursor: page.page.nextCursor,
  };
}
