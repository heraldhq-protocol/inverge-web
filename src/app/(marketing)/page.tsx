import {
  ArrowRight,
  CheckCircle2,
  Compass,
  FileCheck2,
  Layers,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/features/marketing/components/button-link";
import { CallToAction } from "@/features/marketing/components/call-to-action";
import { Container } from "@/features/marketing/components/container";
import { HomeHero } from "@/features/marketing/components/home-hero";
import { HowItWorks } from "@/features/marketing/components/how-it-works";
import { StatsSection } from "@/features/marketing/components/stats-section";

export const metadata: Metadata = {
  title: "Inverge — Back African builders with accountability",
  description:
    "Validate promising African ideas, fund clear milestones, and follow delivery through verifiable campaign records.",
};

const trustPoints = [
  {
    step: "01",
    title: "Signal before funding",
    body: "Idea support and pre-pledges are public validation signals, not paid endorsements or money collected in disguise.",
    icon: Compass,
  },
  {
    step: "02",
    title: "Promises stay visible",
    body: "Campaign milestones and evidence definitions are fixed when a campaign is published, so the standard cannot quietly move later.",
    icon: FileCheck2,
  },
  {
    step: "03",
    title: "Money moves in stages",
    body: "A disclosed working-capital tranche starts delivery; later tranches depend on milestone review instead of releasing the full raise at once.",
    icon: Layers,
  },
  {
    step: "04",
    title: "Outcomes can be checked",
    body: "Contribution, release, and refund records are designed to be verifiable without turning the default experience into a crypto dashboard.",
    icon: CheckCircle2,
  },
] as const;

export default function HomePage() {
  return (
    <main>
      <HomeHero />
      <HowItWorks />
      <StatsSection />

      {/* About & Mission Spotlight Section */}
      <section className="border-b border-border bg-surface py-20 sm:py-28">
        <Container>
          {/* Mission Narrative Row */}
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-0.5 w-6 bg-brand" aria-hidden="true" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                  About Inverge
                </p>
              </div>
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-[-0.04em] text-ink sm:text-4xl lg:text-5xl">
                The funding gap is also a trust gap.
              </h2>
            </div>
            <div className="space-y-5 text-base leading-relaxed text-muted sm:text-lg">
              <p>
                African builders often struggle to raise initial capital to
                prove their ideas, facing geographic lockouts from mainstream
                platforms. At the same time, backers—especially across the
                diaspora—hesitate because traditional crowdfunding hands 100% of
                the money over on day one, destroying accountability if work
                stalls.
              </p>
              <p>
                Inverge fixes that dynamic. Raised funds sit securely in Solana
                smart contract escrow and unlock in milestone tranches approved
                by backers. If delivery stops, eligible funds remain claimable
                as a refund.
              </p>
              <div className="pt-2">
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-strong transition-colors hover:text-brand"
                >
                  <span>Learn more about our mission and principles</span>
                  <ArrowRight
                    className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* Four Controls: Editorial Top-Border Grid */}
          <div className="mt-16 sm:mt-20">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="h-0.5 w-6 bg-brand" aria-hidden="true" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                  Accountability by design
                </p>
              </div>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Four controls. One clear record.
              </h3>
            </div>

            <ol className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
              {trustPoints.map(({ step, title, body, icon: Icon }) => (
                <li
                  key={title}
                  className="group relative border-t-2 border-border/80 pt-6 transition-colors duration-200 hover:border-brand"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xl font-bold tracking-tight text-brand">
                      {step}
                    </span>
                    <span className="grid size-8 place-items-center rounded-lg bg-brand/10 text-brand-strong transition-colors group-hover:bg-brand group-hover:text-white">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                  </div>
                  <h4 className="mt-4 text-lg font-bold tracking-tight text-ink transition-colors group-hover:text-brand-strong sm:text-xl">
                    {title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <CallToAction
        eyebrow="Building in the open"
        title="Interested in the next stage of Inverge?"
        titleSize="large"
        body="Whether you are building, backing, partnering, or testing the pilot, we are open to feedback and conversations."
      >
        <ButtonLink href="/contact" variant="light">
          Talk to the Inverge team
        </ButtonLink>
        <ButtonLink href="/guides" variant="outline-light">
          Explore builder & backer guides
        </ButtonLink>
      </CallToAction>
    </main>
  );
}
