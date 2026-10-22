import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { AdSlot } from "@/features/advertising/components/ad-slot";
import { CampaignBreadcrumbs } from "@/features/campaigns/components/campaign-breadcrumbs";
import { CampaignDetailHero } from "@/features/campaigns/components/campaign-detail-hero";
import { CampaignDiscussion } from "@/features/campaigns/components/campaign-discussion";
import { CampaignEscrowCard } from "@/features/campaigns/components/campaign-escrow-card";
import {
  CampaignFacts,
  CampaignFactsTab,
} from "@/features/campaigns/components/campaign-facts";
import { CampaignFaq } from "@/features/campaigns/components/campaign-faq";
import {
  CampaignFundingPanel,
  CampaignMobileFundingBar,
} from "@/features/campaigns/components/campaign-funding-panel";
import { CampaignMilestoneTimeline } from "@/features/campaigns/components/campaign-milestone-timeline";
import { CampaignRelated } from "@/features/campaigns/components/campaign-related";
import { CampaignStory } from "@/features/campaigns/components/campaign-story";
import { CampaignSupportTiers } from "@/features/campaigns/components/campaign-support-tiers";
import {
  CampaignTabs,
  type CampaignTabPanel,
} from "@/features/campaigns/components/campaign-tabs";
import { CampaignUpdates } from "@/features/campaigns/components/campaign-updates";
import { PreviewDataChip } from "@/features/campaigns/components/prototype-notice";
import {
  campaignTabsFor,
  type CampaignTabId,
} from "@/features/campaigns/lib/campaign-tabs";
import {
  campaignCategoryHref,
  campaignTaxonomyText,
} from "@/features/campaigns/lib/filters";
import type { CampaignDetailView } from "@/features/campaigns/server/campaigns";

/**
 * The campaign detail page.
 *
 * Two registers, deliberately separated. The main column is the pitch and then
 * the campaign's story, told in tabs — a backer who wants the release terms
 * should not have to scroll the entire story, and a backer reading the story
 * should not have a milestone contract in the way.
 *
 * The rail is the third register: the things a backer checks *while* reading.
 * Funding state, what the rewards are, the facts, the escrow rule, and the
 * creator's answers are all one glance away on desktop instead of being reached
 * by leaving the story. It runs the full height of the page rather than
 * stopping under the hero, because a column that empties halfway down is a
 * column that is only decorative.
 *
 * On a phone there is no room for a second column, so the rail's content is not
 * duplicated above or below the tabs — the same material is already the Rewards,
 * Campaign facts, and FAQs tabs, which stack cleanly, and the funding summary is
 * repeated directly under the hero as a compact bar.
 *
 * The tabs used to be an anchor bar over one long page. Anchors meant every
 * section was always in the DOM (searchable, but also in the reading order of
 * someone who only wanted the rewards), and the page reached a length where the
 * funding panel had to be either detached from what it described or covering it.
 * See docs/DECISIONS.md.
 *
 * Which tab is open is a query string, resolved on the server, so a shared link
 * and a refresh both open on the right tab with no client-side flash.
 */
export function CampaignDetail({
  activeTab,
  view,
}: {
  activeTab: CampaignTabId;
  view: CampaignDetailView;
}) {
  const { campaign, now, related } = view;
  const tabs = campaignTabsFor(campaign);
  const categoryHref = campaignCategoryHref(campaign);
  const categoryText = campaignTaxonomyText(campaign);

  const content: Record<CampaignTabId, ReactNode> = {
    discussion: <CampaignDiscussion slug={campaign.slug} />,
    facts: <CampaignFactsTab campaign={campaign} />,
    faqs: <CampaignFaq campaign={campaign} />,
    milestones: <CampaignMilestoneTimeline campaign={campaign} nowIso={now} />,
    rewards: <CampaignSupportTiers campaign={campaign} />,
    story: <CampaignStory campaign={campaign} />,
    updates: <CampaignUpdates campaign={campaign} />,
  };

  const panels: readonly CampaignTabPanel[] = tabs.map((tab) => ({
    tab,
    content: content[tab.id],
  }));

  return (
    <div className="bg-canvas pb-14 sm:pb-20">
      <Container className="py-6 sm:py-8">
        <CampaignBreadcrumbs
          trail={[
            { href: "/", label: "Home" },
            { href: "/campaigns", label: "Campaigns" },
            ...(categoryHref
              ? [{ href: categoryHref, label: categoryText }]
              : []),
            { label: campaign.title },
          ]}
        />

        {/* Stretch, not `items-start`: the main column has to keep its height so
            the tab bar stays stuck to the top for as long as the rail runs
            beside it. */}
        <div className="mt-4 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_23rem] xl:gap-10">
          <div className="min-w-0">
            <CampaignDetailHero campaign={campaign} />

            <div className="mt-5 lg:hidden">
              <CampaignMobileFundingBar campaign={campaign} nowIso={now} />
            </div>

            <div className="mt-10">
              {/* Keyed on the tab so a link from the funding panel to another tab
                  remounts the bar on the tab the server rendered. */}
              <CampaignTabs
                key={activeTab}
                activeTab={activeTab}
                panels={panels}
                slug={campaign.slug}
              />
            </div>

            {/* After the decision content, never inside the funding panel or
                between a metric and its explanation. It renders nothing when
                no approved creative is in schedule. */}
            <AdSlot
              className="mt-8"
              now={now}
              page={{ category: campaign.category, kind: "campaign" }}
              placementId="campaign-detail-inline"
            />
          </div>

          <aside
            aria-label="Campaign funding, rewards, and facts"
            className="hidden min-w-0 space-y-4 lg:block"
          >
            <CampaignFundingPanel campaign={campaign} nowIso={now} />
            <CampaignSupportTiers campaign={campaign} variant="rail" />
            <CampaignFacts campaign={campaign} variant="rail" />
            <CampaignEscrowCard campaign={campaign} />
            <AdSlot
              now={now}
              page={{ category: campaign.category, kind: "campaign" }}
              placementId="campaign-detail-rail"
            />
            <CampaignFaq campaign={campaign} variant="rail" />
          </aside>
        </div>

        {related.length > 0 ? (
          <section
            aria-labelledby="related-heading"
            className="mt-14 border-t border-border pt-8"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2
                  id="related-heading"
                  className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
                >
                  More campaigns you might like
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Related by subcategory, then category, then editorial feature.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <PreviewDataChip />
                <Link
                  href={`/campaigns/${campaign.slug}/recommended`}
                  className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  See more
                </Link>
              </div>
            </div>
            <div className="mt-5">
              <CampaignRelated
                campaigns={related}
                nowIso={now}
                source={campaign}
              />
            </div>
          </section>
        ) : null}
      </Container>
    </div>
  );
}
