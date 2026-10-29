import { HugeiconsIcon } from "@hugeicons/react";
import {
  FileViewIcon,
  Idea01Icon,
  UsersRoundIcon,
} from "@hugeicons/core-free-icons";
import Image from "next/image";
import Link from "next/link";

import { authHref } from "@/features/auth/lib/auth-routes";
import { Container } from "@/features/marketing/components/container";
import { SectionBackground } from "@/features/marketing/components/section-background";

const heroStages = [
  { step: "01", label: "Validate", icon: Idea01Icon },
  { step: "02", label: "Fund", icon: UsersRoundIcon },
  { step: "03", label: "Review", icon: FileViewIcon },
] as const;

export function HomeHero() {
  return (
    <section
      data-hero
      data-parallax-scope
      className="relative isolate overflow-hidden bg-canvas py-12 md:py-20 lg:py-24"
    >
      <SectionBackground tone="canvas" priority className="-z-10 opacity-50" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-canvas/55 via-canvas/80 to-canvas"
      />
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left column: messaging and direct CTAs */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            <p
              data-hero-item
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted"
            >
              Crowdfunding for African builders
            </p>

            <h1
              data-hero-item
              className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-ink sm:text-5xl lg:text-6xl"
            >
              Back bold ideas.{" "}
              <span className="block text-brand sm:inline">
                Keep delivery accountable.
              </span>
            </h1>

            <p
              data-hero-item
              className="max-w-xl text-base leading-relaxed text-muted sm:text-lg"
            >
              Validate first, fund in milestones, and get refunds if a milestone
              fails review. Terms are published upfront.
            </p>

            {/* Primary: Explore ideas. Secondary: Start an idea */}
            <div
              data-hero-item
              className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4"
            >
              <Link
                href="/ideas"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-7 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Explore ideas
              </Link>
              <Link
                href={authHref(undefined, "creator")}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-ink/80 bg-transparent px-7 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Start an idea
              </Link>
            </div>

            <p data-hero-item className="text-sm leading-6 text-muted">
              Not ready to publish?{" "}
              <Link
                href="/waitlist"
                className="font-semibold text-brand-strong underline decoration-brand/40 underline-offset-4 transition-colors hover:decoration-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Join the launch list
              </Link>
              .
            </p>
          </div>

          {/* Right column: authentic photo with integrated campaign protection card */}
          <div data-hero-item className="relative mt-2 lg:col-span-5 lg:mt-0">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              <div className="relative aspect-4/3 overflow-hidden rounded-3xl border border-border/80 shadow-xl shadow-contrast/8 sm:aspect-[16/12] lg:aspect-[4/5]">
                <Image
                  data-parallax
                  src="/images/hero/collaborative-crowdfunding-community-illustration.png"
                  alt="African hardware and technology builders collaborating in a Lagos workshop studio with protected campaign framework"
                  fill
                  priority
                  // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 560px"
                  className="object-cover object-left"
                />

                {/* Campaign lifecycle summary, overlaid on the hero image */}
                <div className="absolute inset-x-3 bottom-3 isolate overflow-hidden rounded-2xl border border-white/15 bg-contrast/85 p-3 text-white shadow-lg backdrop-blur-md sm:inset-x-4 sm:bottom-4 sm:p-4">
                  <SectionBackground
                    tone="pattern"
                    sizes="360px"
                    className="-z-10 opacity-10"
                  />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
                    How a campaign is protected
                  </p>
                  <ol className="mt-3 grid grid-cols-3">
                    {heroStages.map(({ step, label, icon }, index) => (
                      <li
                        key={step}
                        className={`flex flex-col items-center gap-1.5 px-1 text-center ${
                          index > 0 ? "border-l border-white/15" : ""
                        }`}
                      >
                        <span className="grid size-8 place-items-center rounded-full bg-brand/20 text-brand">
                          <HugeiconsIcon
                            icon={icon}
                            size={16}
                            strokeWidth={1.6}
                            aria-hidden="true"
                          />
                        </span>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                          {step}
                        </span>
                        <span className="text-xs font-semibold">{label}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
