import type { PillTone } from "@/components/ui/pill";

import type { MyIdea } from "@/features/ideas/types";

/**
 * One row on the creator's own list, with the links that genuinely exist.
 *
 * The detail page is only reachable when the selected data source can resolve
 * the record, so `detailHref` is `null` for a draft that has never been
 * published. Callers must render a plain title in that case rather than a link
 * that 404s.
 */
export type CreatorIdeaRow = MyIdea & {
  analyticsHref: string | null;
  detailHref: string | null;
  feedbackHref: string | null;
  feedbackResponses: number;
};

export function buildCreatorIdeaRows(
  ideas: readonly MyIdea[],
  {
    analyticsIdeaIds,
    feedbackCounts,
    hasDetail,
    hasFeedback = hasDetail,
  }: {
    /** Idea ids with an analytics dataset; anything else gets no link. */
    analyticsIdeaIds: readonly string[];
    feedbackCounts: Readonly<Record<string, number>>;
    /** Whether a public/detail record exists for the id. */
    hasDetail: (ideaId: string) => boolean;
    /**
     * Whether the feedback setup surface resolves for the id. Defaults to the
     * detail check; a live studio can count responses without yet exposing the
     * preview-only builder.
     */
    hasFeedback?: (ideaId: string) => boolean;
  },
): CreatorIdeaRow[] {
  const analytics = new Set(analyticsIdeaIds);

  return ideas.map((idea) => {
    const detailed = hasDetail(idea.id);

    return {
      ...idea,
      analyticsHref: analytics.has(idea.id)
        ? `/d/creator/ideas/${idea.id}/insights`
        : null,
      detailHref: detailed ? `/ideas/${idea.id}` : null,
      feedbackHref: hasFeedback(idea.id)
        ? `/d/creator/ideas/${idea.id}/feedback`
        : null,
      feedbackResponses: feedbackCounts[idea.id] ?? 0,
    };
  });
}

/** Human labels for the two independent lifecycle fields. */
export const ideaStatusLabel: Readonly<Record<MyIdea["status"], string>> = {
  archived: "Archived",
  converted: "Converted to campaign",
  draft: "Draft",
  "threshold-met": "Threshold met",
  validating: "Validating",
};

/** Badge tone for a lifecycle state, shared by every creator surface. */
export function ideaStatusTone(status: MyIdea["status"]): PillTone {
  if (status === "threshold-met") return "accent";
  if (status === "draft" || status === "archived") return "neutral";
  return "warning";
}

/** A readable update date; null when the timestamp cannot be parsed. */
export function ideaUpdatedLabel(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function ideaVisibilityLabel(idea: MyIdea): string {
  if (idea.visibility === "public") return "Listed in discovery";
  return idea.status === "draft" ? "Unpublished" : "Unlisted";
}
