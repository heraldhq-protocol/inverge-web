import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FeedbackBuilder } from "@/features/feedback/components/feedback-builder";
import { emptyFeedbackForm } from "@/features/feedback/content/preview-feedback";
import { getPreviewIdeaDetail } from "@/features/ideas/content/preview-idea-detail";
import type { CommunityInvite } from "@/features/feedback/types";

export const metadata: Metadata = {
  title: "Feedback and community",
  description:
    "Configure the feedback form and optional community invitation for one of your ideas.",
};

type PageProps = { params: Promise<{ id: string }> };

const emptyCommunity: CommunityInvite = {
  description: "",
  destinations: [],
  enabled: false,
  primaryDestinationId: null,
  showAfterFeedback: true,
  showOnIdeaPage: false,
  title: "Want to stay connected?",
};

/**
 * Creator-only configuration surface. The API authorises ownership; this page
 * resolves the single preview idea and 404s anything else, so no link implies a
 * workspace that does not exist. The missing session is why the builder labels
 * its persistence as preview.
 */
export default async function FeedbackBuilderPage({ params }: PageProps) {
  const { id } = await params;
  const idea = getPreviewIdeaDetail(id);
  if (!idea) notFound();

  return (
    <FeedbackBuilder
      idea={idea}
      initialForm={idea.feedbackForm ?? emptyFeedbackForm()}
      initialCommunity={idea.community ?? emptyCommunity}
    />
  );
}
