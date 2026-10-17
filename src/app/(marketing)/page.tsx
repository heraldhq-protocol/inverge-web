import type { Metadata } from "next";
import Link from "next/link";

import { CallToAction } from "@/features/marketing/components/call-to-action";
import { CampaignAnatomySection } from "@/features/marketing/components/campaign-anatomy-section";
import { FaqSection } from "@/features/marketing/components/faq-section";
import { HomeHero } from "@/features/marketing/components/home-hero";
import { HowItWorks } from "@/features/marketing/components/how-it-works";
import { IdeaCardsSection } from "@/features/marketing/components/idea-cards-section";
import { MissionTeaserSection } from "@/features/marketing/components/mission-teaser-section";
import { StatsSection } from "@/features/marketing/components/stats-section";
import { TrustStrip } from "@/features/marketing/components/trust-strip";
import { TwoDoorsSection } from "@/features/marketing/components/two-doors-section";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  description:
    "Milestone-escrowed crowdfunding and idea validation for African builders. Validate demand, fund curated campaigns, and review delivery with pro-rata escrow refunds.",
  og: {
    eyebrow: "Crowdfunding",
    template: "default",
  },
  path: "/",
  title: "Back bold ideas. Keep delivery accountable.",
});

export default function HomePage() {
  return (
    <main>
      {/* 2. Hero */}
      <HomeHero />

      {/* 3. Trust Strip */}
      <TrustStrip />

      {/* 4. How It Works (Preserved as requested) */}
      <HowItWorks />

      {/* 5. Idea Cards / Discover (Preserved as requested) */}
      <IdeaCardsSection />

      {/* 6. Anatomy of a Protected Campaign */}
      <CampaignAnatomySection />

      {/* 7. Two Doors */}
      <TwoDoorsSection />

      {/* 8. Inverge Activity Band */}
      <StatsSection />

      {/* 9. Mission Teaser */}
      <MissionTeaserSection />

      {/* 10. FAQ Accordion */}
      <FaqSection />

      {/* 11. Final CTA Banner on Forest */}
      <div data-reveal>
        <CallToAction title="Building in the open.">
          <Link
            href="/contact"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Talk to the Inverge team
          </Link>
          <Link
            href="/guides"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/40 bg-transparent px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Explore guides
          </Link>
        </CallToAction>
      </div>
    </main>
  );
}
