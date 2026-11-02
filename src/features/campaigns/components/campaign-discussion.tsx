"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Comment01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { DiscussionThread } from "@/features/discussions/components/discussion-thread";
import type {
  DiscussionComment,
  DiscussionViewer,
} from "@/features/discussions/types";
import { campaignTabHref } from "@/features/campaigns/lib/campaign-tabs";
import type { CampaignComment } from "@/features/campaigns/types";

const ANONYMOUS: DiscussionViewer = {
  avatarUrl: null,
  displayName: null,
  id: null,
  signedIn: false,
};

/**
 * A preview deployment has no comments store, so the tab says that plainly
 * instead of seeding a conversation. A live campaign renders the shared
 * discussion thread against the campaign's own comment endpoint.
 */
function PreviewDiscussionNotice({ slug }: { slug: string }) {
  return (
    <div className="max-w-3xl">
      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <span className="grid size-9 place-items-center rounded-xl bg-canvas text-muted ring-1 ring-border">
          <HugeiconsIcon
            icon={Comment01Icon}
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
        <h2 className="mt-3 text-lg font-bold tracking-tight text-ink">
          Discussion is not available in this preview
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          This preview build has no comments store, so nothing is shown rather
          than a simulated thread. In the API-backed product, backers and the
          creator can talk here.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          <Link
            className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            href={campaignTabHref(slug, "faqs")}
          >
            Read the FAQs
          </Link>
          <Link
            className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            href={campaignTabHref(slug, "updates")}
          >
            See the updates
          </Link>
        </div>
      </div>
    </div>
  );
}

export function CampaignDiscussion({
  campaignId,
  comments: initialComments,
  initialHasMore = false,
  initialNextCursor = null,
  slug,
  source = "live",
  unavailable = false,
  viewer,
}: {
  campaignId: string;
  comments: readonly CampaignComment[];
  initialHasMore?: boolean;
  initialNextCursor?: string | null;
  slug: string;
  source?: "live" | "preview";
  unavailable?: boolean;
  viewer?: DiscussionViewer | undefined;
}) {
  if (source === "preview") return <PreviewDiscussionNotice slug={slug} />;

  const comments: DiscussionComment[] = initialComments.map((comment) => ({
    author: comment.author,
    body: comment.body,
    createdAt: comment.createdAt,
    id: comment.id,
  }));

  return (
    <DiscussionThread
      comments={comments}
      creatorLabel="Campaign creator"
      emptyMessage="No comments yet. Ask the creator a question or share what you think about this campaign."
      heading="Discussion"
      headingId="campaign-discussion"
      initialHasMore={initialHasMore}
      initialNextCursor={initialNextCursor}
      listEndpoint={`/api/campaigns/${encodeURIComponent(campaignId)}/comments`}
      mode="live"
      prompt="join the discussion"
      returnPath={campaignTabHref(slug, "discussion")}
      unavailable={unavailable}
      viewer={viewer ?? ANONYMOUS}
    />
  );
}
