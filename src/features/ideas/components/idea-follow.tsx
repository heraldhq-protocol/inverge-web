"use client";

import { FollowCreatorButton } from "@/features/feedback/components/community-invite";
import { useIdeaViewer } from "@/features/ideas/components/idea-viewer";

/**
 * Follow entry point bound to the page's viewer state. The button itself is
 * honest about the missing follow service; this wrapper only decides whether to
 * send a signed-out reader through sign-in or show the account state.
 */
export function IdeaFollow({
  creatorName,
  ideaId,
}: {
  creatorName: string;
  ideaId: string;
}) {
  const { viewer } = useIdeaViewer();

  return (
    <FollowCreatorButton
      creatorName={creatorName}
      signedIn={viewer === "signed-in"}
      returnTo={`/ideas/${ideaId}`}
      compact
    />
  );
}
