import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Globe,
  Milestone,
  Smartphone,
  XCircle,
} from "lucide-react";
import type { Metadata } from "next";

import { ButtonLink } from "@/features/marketing/components/button-link";
import { Container } from "@/features/marketing/components/container";
import { PageHeader } from "@/features/marketing/components/page-header";

export const metadata: Metadata = {
  title: "About — Inverge",
  description:
    "Why Inverge is building a validation-first, milestone-accountable crowdfunding platform for African builders.",
};

const values = [
  {
    step: "01",
    title: "Accountability by design",
    body: "Funding is released in stages against delivered milestones, not handed over in one lump and hoped for.",
    icon: Milestone,
  },
  {
    step: "02",
    title: "Proof over promises",
    body: "Every stage is backed by evidence a builder shows and a backer can inspect: working repositories, live demos, and verifiable metrics.",
    icon: FileCheck2,
  },
  {
    step: "03",
    title: "Access, not gatekeeping",
    body: "A builder in Ibadan, Accra, Lagos, or Nairobi deserves the same shot as one in a coastal accelerator. We lower the bar to being seen.",
    icon: Globe,
  },
  {
    step: "04",
    title: "Built for African reality",
    body: "We build for how money, trust, and community actually work here, not a template borrowed from somewhere else.",
    icon: Smartphone,
  },
] as const;

const guarantees = [
  {
    title: "On-chain escrow PDAs",
    desc: "100% of campaign funds sit in Solana smart contract escrow until milestones are met, never in company accounts.",
  },
  {
    title: "7-day review window",
    desc: "Backers review milestone proof during a silence-is-consent window with capped objection weight (max 15%).",
  },
  {
    title: "Direct claim-based refunds",
    desc: "Backers claim eligible remaining funds directly on-chain if a milestone stalls, fails review, or the campaign misses its target.",
  },
  {
    title: "Disclosed working capital",
    desc: "A published runway tranche (capped at 20–25%) jumpstarts execution for milestone 1, declared upfront.",
  },
  {
    title: "Strict promotion separation",
    desc: "Paid promotion affects discovery placement only, never organic validation data or milestone governance.",
  },
] as const;

const exclusions = [
  {
    title: "No platform tokens",
    desc: "No speculative tokens, meme coins, or airdrop farming mechanisms whatsoever.",
  },
  {
    title: "No equity or profit promises",
    desc: "Strictly rewards-based and donation crowdfunding at launch, preserving regulatory clarity.",
  },
  {
    title: "No DeFi yield or lending risk",
    desc: "Escrowed backer funds remain inert and are never deployed into yield strategies or lending protocols.",
  },
  {
    title: "No manufactured proof",
    desc: "No fabricated traction numbers, artificial social proof, or paid fake endorsements.",
  },
  {
    title: "No centralized spending custody",
    desc: "No unilateral backend authority or discretionary withdrawal power over escrowed money.",
  },
] as const;

export default function AboutPage() {
  return (
    <main>
      <PageHeader
        eyebrow="ABOUT INVERGE"
        title="Backing ideas. Built on accountability."
        description="We help early-stage builders across Africa turn an idea into something real, and give the people who back them a reason to trust it."
      />

      {/* Mission Narrative */}
      <section className="bg-surface py-16 sm:py-24">
        <Container>
          <div className="grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-0.5 w-6 bg-brand" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                  Why we exist
                </span>
              </div>
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-[-0.04em] text-ink sm:text-4xl">
                Good ideas fail for the wrong reasons.
              </h2>
            </div>
            <div className="space-y-5 text-base leading-relaxed text-muted sm:text-lg">
              <p>
                Across Africa, brilliant builders struggle to raise the first
                few thousand dollars to prove an idea, while the people who
                might back them hold back, unsure their money will be used the
                way it was promised. Both sides lose.
              </p>
              <p>
                Inverge closes that gap. Builders validate an idea with real
                feedback before they raise a dollar. When they do raise, the
                money is held in escrow and released in milestones, each one
                unlocked by proof of delivery, not the passage of time. If a
                milestone isn&apos;t met, the funds tied to it go back.
              </p>
              <p className="font-medium text-ink">
                The result is simple: backers support with confidence, and
                builders earn trust by shipping. Accountability stops being a
                slogan and becomes how the money moves.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* What We Stand For */}
      <section className="border-y border-border bg-canvas py-16 sm:py-24">
        <Container>
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="h-0.5 w-6 bg-brand" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                What we stand for
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-ink sm:text-4xl">
              Four things we won&apos;t compromise on
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ step, title, body, icon: Icon }) => (
              <div
                key={title}
                className="flex flex-col rounded-xl border border-border bg-surface p-6 transition-colors duration-200 hover:border-brand/40"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand-strong">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-xs font-semibold text-muted">
                    {step}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-ink">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* What We Guarantee vs What We Exclude */}
      <section className="bg-surface py-16 sm:py-24">
        <Container>
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="h-0.5 w-6 bg-brand" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                The Inverge Standard
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-ink sm:text-4xl">
              What we guarantee vs. what we exclude
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted">
              Clear accountability starts with explicit boundaries. Here is what
              you can rely on in our escrow rules, and what we deliberately
              refuse to introduce.
            </p>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {/* Guarantees */}
            <div className="flex flex-col rounded-2xl border border-border bg-canvas p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-bold text-ink">
                    What we commit to
                  </h3>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                  Guaranteed
                </span>
              </div>
              <ul className="mt-6 space-y-4">
                {guarantees.map(({ title, desc }) => (
                  <li key={title} className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-1 size-4 shrink-0 text-brand"
                      aria-hidden="true"
                    />
                    <div className="text-sm leading-relaxed">
                      <strong className="font-semibold text-ink">
                        {title}:
                      </strong>{" "}
                      <span className="text-muted">{desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exclusions */}
            <div className="flex flex-col rounded-2xl border border-border bg-canvas p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-danger/10 text-danger">
                    <XCircle className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-bold text-ink">
                    What we explicitly exclude
                  </h3>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-danger">
                  Excluded
                </span>
              </div>
              <ul className="mt-6 space-y-4">
                {exclusions.map(({ title, desc }) => (
                  <li key={title} className="flex items-start gap-3">
                    <XCircle
                      className="mt-1 size-4 shrink-0 text-danger"
                      aria-hidden="true"
                    />
                    <div className="text-sm leading-relaxed">
                      <strong className="font-semibold text-ink">
                        {title}:
                      </strong>{" "}
                      <span className="text-muted">{desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* The Team */}
      <section className="border-t border-border bg-canvas py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex items-center justify-center gap-3">
              <span className="h-0.5 w-6 bg-brand" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                The team
              </span>
              <span className="h-0.5 w-6 bg-brand" aria-hidden="true" />
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-ink sm:text-4xl">
              A small, remote team across West Africa
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
              We&apos;re builders, designers, and operators who have raised
              money, shipped products, and felt the friction firsthand.
              We&apos;re deliberately small, close to the people we serve, and
              biased towards proof.
            </p>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-canvas pb-20 sm:pb-24">
        <Container>
          <div className="rounded-[2rem] bg-contrast px-7 py-12 text-center text-white sm:px-12 sm:py-16">
            <div className="flex items-center justify-center gap-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
              <span
                className="size-1.5 rounded-full bg-brand"
                aria-hidden="true"
              />
              <span>Join us</span>
            </div>
            <h2 className="mx-auto mt-4 max-w-2xl text-balance text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              Back a builder, or become one
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              Good accountability starts before the first campaign opens. Talk
              to us or explore the guides.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <ButtonLink href="/contact" variant="light">
                Talk to the Inverge team
              </ButtonLink>
              <ButtonLink href="/guides" variant="outline-light">
                Explore our guides
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
