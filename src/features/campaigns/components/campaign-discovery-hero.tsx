import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PreviewDataChip } from "@/features/campaigns/components/prototype-notice";

/**
 * Discovery hero.
 *
 * Text only. The visual anchor of this page is the featured campaign band
 * directly beneath, which shows a real listing rather than a stock photograph —
 * a hero image here would compete with it and imply the platform has more reach
 * than its listings do.
 */
export function CampaignDiscoveryHero() {
  return (
    <section className="border-b border-border/80 bg-canvas">
      <Container className="pb-8 pt-9 sm:pb-10 sm:pt-12 lg:pb-12 lg:pt-14">
        <div className="flex flex-wrap items-center gap-2.5">
          <Eyebrow>Crowdfunding for Africa&apos;s next chapter</Eyebrow>
          <PreviewDataChip title="Campaigns on this page come from preview data until the campaigns API is connected" />
        </div>

        <h1 className="mt-3 max-w-3xl text-balance text-[2.1rem] font-bold leading-[1.06] tracking-[-0.045em] text-ink sm:text-5xl lg:text-[3.25rem]">
          Back the work that moves us forward.
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
          Every campaign here publishes a milestone plan before it opens. Money
          is held in escrow, released in stages against evidence, and returned
          in full if the target is not reached.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href="#campaigns"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-contrast px-6 text-sm font-semibold text-white transition-[filter] duration-150 hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Explore campaigns
          </a>
          <Link
            href="/guides/milestones-objections-and-refunds"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-surface px-6 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            How backing works
          </Link>
        </div>
      </Container>
    </section>
  );
}
