import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileCheck2,
  Globe,
  Milestone,
  Smartphone,
  Users2,
  X,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { ButtonLink } from "@/features/marketing/components/button-link";
import { CallToAction } from "@/features/marketing/components/call-to-action";
import { Container } from "@/features/marketing/components/container";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  description:
    "Why Inverge is building a validation-first, milestone-accountable crowdfunding platform for African builders.",
  og: { eyebrow: "About", template: "marketing" },
  path: "/about",
  title: "About",
});

/* ── Static data ────────────────────────────────────────────── */

const values = [
  {
    step: "01",
    title: "Accountability by design",
    body: "Clear rules, visible evidence, public receipts.",
    icon: CheckCircle2,
  },
  {
    step: "02",
    title: "Proof over promises",
    body: "Real milestones, real review, real outcomes.",
    icon: FileCheck2,
  },
  {
    step: "03",
    title: "Access not gatekeeping",
    body: "Open to builders across Nigeria and West Africa.",
    icon: Globe,
  },
  {
    step: "04",
    title: "Built for African reality",
    body: "Local context. Local talent. Global support.",
    icon: Smartphone,
  },
] as const;

const flowSteps = [
  { num: 1, label: "Funded", icon: Users2 },
  { num: 2, label: "Working-capital tranche released", icon: Users2 },
  { num: 3, label: "Milestone claim with proof", icon: ClipboardCheck },
  { num: 4, label: "Objection window", icon: Eye },
  {
    num: 5,
    label: "Approved and released or failed and remaining escrow claimable",
    icon: CheckCircle2,
  },
] as const;

const notItems = [
  "Not an investment platform.",
  "No profit or returns promised.",
  "No platform token.",
  "Escrowed funds are never lent out or used to earn yield.",
  "Open listing is not available yet because campaigns are curated.",
] as const;

const roadmapSteps = [
  { label: "Idea validation", status: "Live" as const },
  { label: "Curated pilot", status: "Live" as const },
  { label: "On-chain escrow launch", status: "In progress" as const },
  { label: "Wider rollout", status: "Next" as const },
] as const;

/* ── Component ──────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <main>
      {/* ─── 1. Hero ─── */}
      <section
        data-parallax-scope
        className="border-b border-border bg-canvas py-14 sm:py-20"
      >
        <Container>
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left */}
            <div data-reveal className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
                About Inverge
              </p>
              <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.05] tracking-[-0.05em] text-ink sm:text-5xl lg:text-[3.25rem]">
                Backing ideas.{" "}
                <span className="block">Built on accountability.</span>
              </h1>
              <p className="mt-6 max-w-lg text-pretty text-base leading-7 text-muted sm:text-lg">
                Inverge is a milestone-escrowed crowdfunding platform for
                early-stage builders in Nigeria and West Africa.
              </p>
            </div>

            {/* Right – hero photo */}
            <div
              data-reveal="right"
              className="relative aspect-[16/10] overflow-hidden rounded-2xl lg:aspect-[4/3]"
            >
              <Image
                data-parallax
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=900&fit=crop"
                alt="African builders collaborating in a workshop"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 560px"
                className="object-cover object-center"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* ─── 2. Why we exist ─── */}
      <section className="bg-surface py-16 sm:py-24">
        <Container>
          <div
            data-reveal-stagger="0.12"
            className="grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16"
          >
            <div>
              <div className="flex items-center gap-3">
                <span
                  data-reveal-rule
                  className="h-0.5 w-6 bg-brand"
                  aria-hidden="true"
                />
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
                Builders cannot raise a first few thousand dollars. Backers hold
                back because they cannot see where money goes. Both lose.
              </p>
              <p className="font-semibold text-brand-strong">
                Accountability stops being a slogan and becomes how the money
                moves.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── 3. Two ways to fund ─── */}
      <section className="marketing-pattern border-y border-border py-16 sm:py-24">
        <Container>
          <div data-reveal className="mb-3 flex items-center gap-3">
            <span
              data-reveal-rule
              className="h-0.5 w-6 bg-brand"
              aria-hidden="true"
            />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
              Two ways to fund
            </span>
          </div>
          <p data-reveal className="text-base text-muted">
            Same goal. Different paths.
          </p>

          <div
            data-reveal-stagger="0.12"
            className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-10"
          >
            {/* Lump-sum */}
            <div className="relative rounded-2xl border border-border bg-white p-6 sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-ink/8">
                  <Users2 className="size-4 text-ink/60" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-bold text-ink">
                  Lump-sum crowdfunding
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted">
                Money is handed over on day one. Accountability becomes
                voluntary.
              </p>
              <p className="mt-4 text-xs font-medium text-muted/80">
                Less control
              </p>
            </div>

            {/* Inverge */}
            <div className="relative rounded-2xl border-2 border-brand/30 bg-brand/5 p-6 sm:p-8">
              <span className="absolute -top-3 right-6 rounded-full bg-white px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted shadow-sm sm:right-8">
                Illustrative
              </span>
              <div className="mb-5 flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-brand/15">
                  <CheckCircle2
                    className="size-4 text-brand"
                    aria-hidden="true"
                  />
                </span>
                <h3 className="text-lg font-bold text-ink">Inverge</h3>
              </div>
              <ul className="space-y-2.5">
                {[
                  "Money is held in escrow.",
                  "Released stage by stage.",
                  "Remaining escrow claimable if a milestone fails.",
                ].map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2 text-sm leading-relaxed text-muted"
                  >
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-brand"
                      aria-hidden="true"
                    />
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <ButtonLink
                  href="/guides/milestones-objections-and-refunds"
                  variant="primary"
                  className="text-white"
                >
                  More accountability
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── 4. What we stand for ─── */}
      <section className="bg-surface py-16 sm:py-24">
        <Container>
          <div data-reveal className="flex items-center gap-3">
            <span
              data-reveal-rule
              className="h-0.5 w-6 bg-brand"
              aria-hidden="true"
            />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
              What we stand for
            </span>
          </div>

          <ol
            data-reveal-stagger="0.08"
            className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10"
          >
            {values.map(({ step, title, body, icon: Icon }) => (
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
                <h3 className="mt-4 text-lg font-bold tracking-tight text-ink transition-colors group-hover:text-brand-strong">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ─── 5. How accountability works ─── */}
      <section className="marketing-pattern border-y border-border py-16 sm:py-24">
        <Container>
          <div data-reveal className="flex items-center gap-3">
            <span
              data-reveal-rule
              className="h-0.5 w-6 bg-brand"
              aria-hidden="true"
            />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
              How accountability works
            </span>
          </div>

          {/* Desktop horizontal flow */}
          <div
            data-reveal
            className="mt-12 hidden items-start justify-between gap-4 lg:flex"
          >
            {flowSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="flex items-start gap-3">
                  <div
                    className="flex flex-col items-center text-center"
                    style={{ minWidth: 140 }}
                  >
                    <span className="grid size-12 place-items-center rounded-full bg-brand/10 text-brand">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="mt-2 text-xs font-bold text-brand">
                      {step.num}
                    </span>
                    <p className="mt-1 max-w-[140px] text-xs leading-snug text-muted">
                      {step.label}
                    </p>
                  </div>
                  {i < flowSteps.length - 1 && (
                    <ArrowRight
                      className="mt-3 size-4 shrink-0 text-border"
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile vertical flow */}
          <ol data-reveal-stagger="0.08" className="mt-10 space-y-6 lg:hidden">
            {flowSteps.map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.num} className="flex items-start gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <span className="text-sm font-bold text-brand">
                      {step.num}
                    </span>
                    <p className="text-sm leading-snug text-muted">
                      {step.label}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <p data-reveal className="mt-8 text-center text-xs text-muted">
            Released stages are never clawed back.
          </p>
        </Container>
      </section>

      {/* ─── 6. What Inverge is NOT + Where we are ─── */}
      <section className="bg-surface py-16 sm:py-24">
        <Container>
          <div
            data-reveal-stagger="0.12"
            className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16"
          >
            {/* Left: What Inverge is not */}
            <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
              <h3 className="flex items-center gap-2 text-lg font-bold text-ink">
                <span className="grid size-8 place-items-center rounded-full bg-ink/8">
                  <X className="size-4 text-ink/60" aria-hidden="true" />
                </span>
                What Inverge is not
              </h3>
              <ul className="mt-5 space-y-3">
                {notItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-muted"
                  >
                    <X
                      className="mt-0.5 size-4 shrink-0 text-danger"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 flex items-center gap-2 text-xs font-medium text-warning-strong">
                <AlertTriangle className="size-3.5" aria-hidden="true" />
                This section is for legal review.
              </p>
            </div>

            {/* Right: Where we are */}
            <div>
              <h3 className="text-lg font-bold text-ink">Where we are</h3>
              <p className="mt-1 text-sm text-muted">
                A build-in-the-open journey.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {roadmapSteps.map((step) => (
                  <div
                    key={step.label}
                    className="flex flex-col items-center rounded-xl border border-border bg-white p-4 text-center"
                  >
                    <span className="grid size-10 place-items-center rounded-full bg-brand/10 text-brand">
                      <Milestone className="size-4" aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-xs font-semibold text-ink">
                      {step.label}
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        step.status === "Live"
                          ? "bg-brand/10 text-brand"
                          : step.status === "In progress"
                            ? "bg-warning/10 text-warning-strong"
                            : "bg-ink/5 text-muted"
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── 7. Team ─── */}
      {/* <section className="border-y border-border bg-canvas py-16 sm:py-24">
        <Container>
          <div className="flex items-center gap-3">
            <span className="h-0.5 w-6 bg-brand" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
              Team
            </span>
          </div>
          <p className="mt-2 text-sm text-muted">
            A small, remote team across West Africa.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="group flex flex-col items-center rounded-2xl border border-border bg-white p-6 text-center transition-shadow duration-200 hover:shadow-md"
              >
                <span className="grid size-16 place-items-center rounded-full bg-brand/10 text-brand">
                  <Users2 className="size-6" aria-hidden="true" />
                </span>
                <h4 className="mt-4 text-base font-bold text-ink">
                  {member.name}
                </h4>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-muted">
                  {member.role}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section> */}

      {/* ─── 8. CTA ─── */}
      <div data-reveal>
        <CallToAction
          title="Back a builder, or become one."
          body="Explore ideas, support great builders, or start your own idea."
          className="py-16 sm:py-20"
        >
          <ButtonLink href="/ideas" variant="light">
            Explore ideas
          </ButtonLink>
          <ButtonLink href="/sign-up" variant="light">
            Start an idea
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline-light">
            Talk to the Inverge team
            <ArrowRight className="ml-2 size-4" aria-hidden="true" />
          </ButtonLink>
        </CallToAction>
      </div>
    </main>
  );
}
