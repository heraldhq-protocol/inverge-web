import type { DashboardViewer } from "@/features/app-shell/types";

/**
 * Which dashboard modules a viewer's state makes worth rendering.
 *
 * The home dashboard is one composition, not one page per persona: the shell,
 * greeting, discovery grid, and recommendations are shared, and a handful of
 * slots switch on. This module decides those slots from server-derived state so
 * the rule is testable in isolation instead of being scattered through JSX.
 *
 * `creator` is a capability, not a persona — a viewer who backs ideas and also
 * owns two draft ideas is both, and the dashboard keeps discovery first while
 * adding creator modules beside it.
 */
export type DashboardModules = {
  /**
   * The creator callout at the end of the main column. A viewer with no ideas
   * is invited to start one; a creator is sent back to work in progress.
   */
  creatorCallout: "start" | "continue" | "hidden";
  /** The ideathon slot in the right rail. */
  ideathons: "join" | "participating" | "hidden";
  /** Organiser tools, only when the server says this viewer may administer. */
  organizerEntry: boolean;
};

export function deriveDashboardModules(
  viewer: Pick<DashboardViewer, "capabilities">,
  context: { ownedIdeaCount: number; previewEligible: boolean },
): DashboardModules {
  const { capabilities } = viewer;

  return {
    creatorCallout: capabilities.creator
      ? "continue"
      : context.previewEligible
        ? "start"
        : "hidden",
    ideathons: capabilities.ideathonParticipant ? "participating" : "join",
    organizerEntry: capabilities.programmeOrganizer && context.previewEligible,
  };
}

/**
 * Whether the dashboard should lead with first-use guidance.
 *
 * A brand-new account has zero of everything. In that state the dashboard still
 * shows public ideas — the point is to give a reader something real to act on,
 * not to pad the page with empty metric cards.
 */
export function isNewViewer(summary: {
  supportedIdeas: number;
  prePledges: number;
  feedbackGiven: number;
  ownedIdeas: number;
}): boolean {
  return (
    summary.supportedIdeas === 0 &&
    summary.prePledges === 0 &&
    summary.feedbackGiven === 0 &&
    summary.ownedIdeas === 0
  );
}
