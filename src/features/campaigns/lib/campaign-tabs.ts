import type { Campaign } from "@/features/campaigns/types";

/**
 * The campaign detail tabs.
 *
 * The detail page was one continuous document with an in-page anchor bar. The
 * anchor bar is gone: a backer who wants the reward terms should not have to
 * scroll past the whole milestone contract to reach them, and a page that length
 * makes the important information look like the unimportant information.
 *
 * Tab state lives in `?tab=`. A query string rather than a route, because every
 * tab reads the same campaign and the same record: splitting them into separate
 * routes would mean four fetches and four 404 checks for one campaign. The panel
 * itself is rendered on the server, so a shared link opens on the right tab with
 * no flash and no client-only content.
 */
export const campaignTabIds = [
  "story",
  "milestones",
  "rewards",
  "updates",
  "discussion",
  "faqs",
  "facts",
] as const;

export type CampaignTabId = (typeof campaignTabIds)[number];

export type CampaignTab = {
  id: CampaignTabId;
  label: string;
};

export const defaultCampaignTab: CampaignTabId = "story";

const tabLabels: Record<CampaignTabId, string> = {
  discussion: "Discussion",
  facts: "Campaign facts",
  faqs: "FAQs",
  milestones: "Milestones",
  rewards: "Rewards",
  story: "Story",
  updates: "Updates",
};

/**
 * Which tabs this campaign shows.
 *
 * Rewards always appear. A donation-based campaign has no tiers, and that is a
 * deliberate state the tab states plainly rather than a tab that quietly
 * vanishes — a backer looking for rewards should be told there are none, not
 * left wondering whether the page is broken.
 *
 * Milestones only appear when the campaign has actually published a plan, so the
 * tab is never an empty container.
 */
export function campaignTabsFor(campaign: Campaign): readonly CampaignTab[] {
  return campaignTabIds
    .filter((id) => id !== "milestones" || campaign.milestones.length > 0)
    .map((id) => ({ id, label: tabLabels[id] }));
}

/** The tab a `?tab=` value names, or null when it names nothing. */
export function parseCampaignTab(
  tab: string | undefined,
): CampaignTabId | null {
  return campaignTabIds.find((id) => id === tab) ?? null;
}

/** The tab this view should open on, given the tabs it actually has. */
export function resolveCampaignTab(
  request: string | undefined,
  tabs: readonly CampaignTab[],
): CampaignTabId {
  const parsed = parseCampaignTab(request);

  if (parsed && tabs.some((tab) => tab.id === parsed)) return parsed;

  return tabs[0]?.id ?? defaultCampaignTab;
}

/** The link to one tab of one campaign. Used for real anchors, not just state. */
export function campaignTabHref(slug: string, tab: CampaignTabId): string {
  return `/campaigns/${encodeURIComponent(slug)}?tab=${tab}`;
}
