"use client";

import { DiscussionThread } from "@/features/discussions/components/discussion-thread";
import type {
  DiscussionComment,
  DiscussionViewer,
} from "@/features/discussions/types";
import { useIdeaViewer } from "@/features/ideas/components/idea-viewer";
import type { IdeaComment } from "@/features/ideas/types";

const ANONYMOUS: DiscussionViewer = {
  avatarUrl: null,
  displayName: null,
  id: null,
  signedIn: false,
};

/**
 * The public idea discussion.
 *
 * Live threads are persisted by the API and posted through the BFF. Preview
 * deployments keep a local composer for reviewing the signed-in state, and say
 * so; nothing a reviewer types is presented as platform activity.
 */
export function IdeaDiscussion({
  canPost = true,
  comments: initialComments,
  ideaId,
  initialHasMore = false,
  initialNextCursor = null,
  returnPath,
  source = "preview",
  unavailable = false,
  viewer,
}: {
  canPost?: boolean;
  comments: readonly IdeaComment[];
  ideaId?: string;
  initialHasMore?: boolean;
  initialNextCursor?: string | null;
  returnPath?: string;
  source?: "live" | "preview";
  unavailable?: boolean;
  viewer?: DiscussionViewer | undefined;
}) {
  const { viewer: previewViewer } = useIdeaViewer();
  const preview = source === "preview";

  const effectiveViewer: DiscussionViewer = preview
    ? {
        avatarUrl: null,
        displayName: "You",
        id: previewViewer === "signed-in" ? "preview-viewer" : null,
        signedIn: previewViewer === "signed-in",
      }
    : (viewer ?? ANONYMOUS);

  const comments: DiscussionComment[] = initialComments.map((comment) => ({
    author: {
      avatarUrl: comment.authorAvatarUrl ?? null,
      displayName: comment.author,
      id: comment.authorId ?? `comment-author-${comment.id}`,
      isCreator: comment.isCreator === true,
    },
    body: comment.body,
    createdAt: comment.createdAt,
    id: comment.id,
    ...(comment.pinned ? { pinned: true } : {}),
  }));

  return (
    <DiscussionThread
      canPost={canPost}
      comments={comments}
      creatorLabel="Creator"
      emptyMessage="No comments yet. Join the discussion to share what you think about this idea."
      heading="Community discussion"
      headingId="idea-discussion"
      initialHasMore={initialHasMore}
      initialNextCursor={initialNextCursor}
      listEndpoint={
        ideaId ? `/api/ideas/${encodeURIComponent(ideaId)}/comments` : ""
      }
      mode={preview ? "preview" : "live"}
      prompt="join the discussion"
      returnPath={returnPath ?? (ideaId ? `/ideas/${ideaId}` : "/ideas")}
      unavailable={unavailable}
      viewer={effectiveViewer}
    />
  );
}
