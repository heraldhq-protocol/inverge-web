import type { MyIdea } from "@/features/ideas/types";

/**
 * One row on the creator's own list, with the links that genuinely exist.
 *
 * The detail page is only reachable for ideas the fixture can resolve, so
 * `detailHref` is `null` for a draft that has never been published. Callers must
 * render a plain title in that case rather than a link that 404s.
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
  }: {
    /** Idea ids with an analytics dataset; anything else gets no link. */
    analyticsIdeaIds: readonly string[];
    feedbackCounts: Readonly<Record<string, number>>;
    /** Whether a public/detail record exists for the id. */
    hasDetail: (ideaId: string) => boolean;
  },
): CreatorIdeaRow[] {
  const analytics = new Set(analyticsIdeaIds);

  return ideas.map((idea) => {
    const detailed = hasDetail(idea.id);

    return {
      ...idea,
      analyticsHref: analytics.has(idea.id)
        ? `/d/ideas/${idea.id}/insights`
        : null,
      detailHref: detailed ? `/ideas/${idea.id}` : null,
      feedbackHref: detailed ? `/d/ideas/${idea.id}/feedback` : null,
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

export function ideaVisibilityLabel(idea: MyIdea): string {
  if (idea.visibility === "public") return "Listed in discovery";
  return idea.status === "draft" ? "Unpublished" : "Unlisted";
}
