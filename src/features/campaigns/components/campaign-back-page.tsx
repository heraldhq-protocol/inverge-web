import { Container } from "@/components/ui/container";
import { CampaignBreadcrumbs } from "@/features/campaigns/components/campaign-breadcrumbs";
import { ContributionPreview } from "@/features/campaigns/components/contribution-preview";
import { categoryLabel } from "@/features/campaigns/lib/filters";
import type { Campaign } from "@/features/campaigns/types";
import type { WalletFundingSnapshot } from "@/features/wallet/types";

/**
 * The contribution entry screen.
 *
 * It exists so the flow has its own URL to link to and to return to, and so the
 * campaign page's primary call to action goes somewhere real rather than opening
 * a modal that hides the terms. The heading says "preview" before a backer
 * enters an amount, not after.
 */
export function CampaignBackPage({
  campaign,
  initialCountry = "",
  initialTierId = null,
  walletFunding = null,
}: {
  campaign: Campaign;
  /**
   * The wallet slice the checkout may use to answer "can this be paid from the
   * wallet balance?". Null means no wallet state is available, which the flow
   * states rather than assuming a balance.
   */
  walletFunding?: WalletFundingSnapshot | null;
  /**
   * A destination handed over from the campaign page or a shared link, when the
   * backer already said where they are. Only used when it is a real country
   * code, so a hand-edited query string cannot preset a destination the country
   * list does not contain.
   */
  initialCountry?: string;
  /**
   * A reward tier chosen on the campaign page, when the backer picked one. Only
   * used when it matches a tier this campaign actually publishes.
   */
  initialTierId?: string | null;
}) {
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
            { href: `/campaigns/${campaign.slug}`, label: campaign.title },
            { label: "Contribute" },
          ]}
        />

        <header className="mt-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-strong">
            Contribution preview
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
            Back {campaign.title}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
            This walks through how a contribution will work — amount, payment
            route, and terms. It stops before money moves: this build has no
            wallet connection and no payment provider, so no contribution can be
            created.
          </p>
        </header>

        <div className="mt-6">
          <ContributionPreview
            campaign={campaign}
            initialCountry={initialCountry}
            initialTierId={initialTierId}
            walletFunding={walletFunding}
          />
        </div>
      </Container>
    </div>
  );
}
