import { Container } from "@/components/ui/container";
import { CampaignBreadcrumbs } from "@/features/campaigns/components/campaign-breadcrumbs";
import { CampaignDetailHero } from "@/features/campaigns/components/campaign-detail-hero";
import { CampaignDisclosures } from "@/features/campaigns/components/campaign-disclosures";
import { CampaignDiscussion } from "@/features/campaigns/components/campaign-discussion";
import { CampaignEscrowSection } from "@/features/campaigns/components/campaign-escrow-section";
import { CampaignFacts } from "@/features/campaigns/components/campaign-facts";
import { CampaignFaq } from "@/features/campaigns/components/campaign-faq";
import {
  CampaignFundingPanel,
  CampaignMobileFundingBar,
} from "@/features/campaigns/components/campaign-funding-panel";
import { CampaignMilestoneTimeline } from "@/features/campaigns/components/campaign-milestone-timeline";
import { CampaignRelated } from "@/features/campaigns/components/campaign-related";
import { CampaignSection } from "@/features/campaigns/components/campaign-section";
import {
  CampaignSectionNav,
  type CampaignSection as CampaignSectionLink,
} from "@/features/campaigns/components/campaign-section-nav";
import {
  CampaignStory,
  CampaignStoryMedia,
  CampaignUseOfFunds,
} from "@/features/campaigns/components/campaign-story";
import { CampaignSupportTiers } from "@/features/campaigns/components/campaign-support-tiers";
import { CampaignUpdates } from "@/features/campaigns/components/campaign-updates";
import { PreviewDataChip } from "@/features/campaigns/components/prototype-notice";
import { categoryLabel } from "@/features/campaigns/lib/filters";
import type { CampaignDetailView } from "@/features/campaigns/server/campaigns";

const sections: readonly CampaignSectionLink[] = [
  { id: "overview", label: "Overview" },
  { id: "use-of-funds", label: "Use of funds" },
  { id: "plan", label: "Milestone plan" },
  { id: "escrow", label: "Escrow" },
  { id: "rewards", label: "Rewards" },
  { id: "updates", label: "Updates" },
  { id: "faq", label: "Questions" },
];

/**
 * The campaign detail page.
 *
 * One document, read top to bottom: the claim, how the money would be used, the
 * milestone contract, and the escrow terms — in that order, because a backer
 * decides on the plan before they care about the artwork. The section bar is
 * anchors rather than routes so that reading order is never broken up.
 */
export function CampaignDetail({ view }: { view: CampaignDetailView }) {
  const { campaign, now, related } = view;

  return (
    <div className="bg-canvas pb-14 sm:pb-20">
      <Container className="py-6 sm:py-8">
        <CampaignBreadcrumbs
          trail={[
            { href: "/", label: "Home" },
            { href: "/campaigns", label: "Campaigns" },
            {
              href: `/campaigns/categories/${campaign.category}`,
              label: categoryLabel(campaign.category),
            },
            { label: campaign.title },
          ]}
        />

        <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
          <div className="min-w-0">
            <CampaignDetailHero campaign={campaign} />

            <div className="mt-5">
              <CampaignFacts campaign={campaign} />
            </div>

            <div className="mt-5 lg:hidden">
              <CampaignMobileFundingBar campaign={campaign} nowIso={now} />
            </div>

            <div className="mt-6">
              <CampaignSectionNav sections={sections} />
            </div>

            <div className="mt-8 space-y-10 sm:space-y-12">
              <CampaignSection
                id="overview"
                title="Overview"
                description={`Why ${campaign.creator.name} is building this, and who it is for.`}
                action={<PreviewDataChip />}
              >
                <CampaignStory campaign={campaign} />
                {campaign.story.media.length > 0 ? (
                  <div className="mt-6">
                    <CampaignStoryMedia campaign={campaign} />
                  </div>
                ) : null}
              </CampaignSection>

              <CampaignSection
                id="use-of-funds"
                title="How your contribution is used"
                description="Each line is the creator's own published allocation of the funding target."
              >
                <CampaignUseOfFunds campaign={campaign} />
              </CampaignSection>

              <CampaignSection
                id="plan"
                title="Milestone plan"
                description="Funds are released in these tranches, and only when the evidence for each is approved."
              >
                <CampaignMilestoneTimeline campaign={campaign} nowIso={now} />
              </CampaignSection>

              <CampaignSection
                id="escrow"
                title="How escrow works"
                description="The rules this campaign publishes, and where each tranche sits right now."
              >
                <CampaignEscrowSection campaign={campaign} />
              </CampaignSection>

              <CampaignSection
                id="rewards"
                title="Rewards"
                description="What the creator promises to send, if anything."
              >
                <CampaignSupportTiers campaign={campaign} />
              </CampaignSection>

              <CampaignSection
                id="updates"
                title="Updates"
                description="Progress posts from the creator, newest first."
              >
                <CampaignUpdates campaign={campaign} />
              </CampaignSection>

              <CampaignSection
                id="disclosures"
                title="Before you contribute"
                description="Who can contribute, what could go wrong, and what happens if the target is not reached."
              >
                <CampaignDisclosures campaign={campaign} />
              </CampaignSection>

              <CampaignSection
                id="faq"
                title="Questions"
                description="Answered by the creator."
              >
                <CampaignFaq campaign={campaign} />
              </CampaignSection>

              <CampaignSection id="discussion" title="Discussion">
                <CampaignDiscussion />
              </CampaignSection>
            </div>
          </div>

          <div className="hidden lg:block">
            <CampaignFundingPanel campaign={campaign} nowIso={now} />
          </div>
        </div>

        {related.length > 0 ? (
          <section
            aria-labelledby="related-heading"
            className="mt-14 border-t border-border pt-8"
          >
            <h2
              id="related-heading"
              className="text-lg font-bold tracking-[-0.025em] text-ink sm:text-xl"
            >
              More in {categoryLabel(campaign.category)}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Other campaigns raising in the same category.
            </p>
            <div className="mt-5">
              <CampaignRelated campaigns={related} nowIso={now} />
            </div>
          </section>
        ) : null}
      </Container>
    </div>
  );
}
