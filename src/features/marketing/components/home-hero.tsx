import { ArrowRight } from "lucide-react";
import Image from "next/image";

import { ButtonLink } from "@/features/marketing/components/button-link";
import { Container } from "@/features/marketing/components/container";

export function HomeHero() {
  return (
    <section className="overflow-hidden bg-canvas py-12 md:py-20 lg:py-24">
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-8 lg:col-span-7">
            <h1 className="max-w-4xl text-balance text-[clamp(2.5rem,4.6vw+0.75rem,4.75rem)] font-bold leading-[1.05] tracking-[-0.055em] text-ink">
              Back bold ideas.{" "}
              <span className="mt-1 block text-brand sm:mt-0 sm:inline">
                Keep delivery accountable.
              </span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg lg:text-xl">
              Inverge is building a path from early validation to
              milestone-based crowdfunding—so builders can prove demand before
              raising and backers can see what happens after funding.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <ButtonLink href="#how-it-works">
                <span>See how it works</span>
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink
                href="/guides/publish-and-validate-an-idea"
                variant="secondary"
              >
                Read the builder guide
              </ButtonLink>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2.5" aria-hidden="true">
                {[
                  ["V", "bg-brand-strong"],
                  ["M", "bg-brand"],
                  ["R", "bg-contrast"],
                ].map(([label, color]) => (
                  <span
                    key={label}
                    className={`grid size-9 place-items-center rounded-full text-xs font-bold text-white ring-2 ring-canvas ${color}`}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <p className="max-w-md text-xs font-medium leading-snug text-muted sm:text-sm">
                Validate first. Fund in milestones. Put refund rules upfront.
              </p>
            </div>
          </div>

          <div className="relative mt-4 lg:col-span-5 lg:mt-0">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              <div className="hero-photo-fade relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/5 shadow-2xl shadow-contrast/15 sm:aspect-[16/11] lg:aspect-[4/5] lg:rounded-none lg:border-0 lg:shadow-none">
                <Image
                  src="/images/hero-lagos-sunset.png"
                  alt="A Lagos street with yellow buses and the city skyline"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  className="object-cover object-center"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent"
                />
              </div>

              <div className="relative z-20 -mt-16 mx-4 sm:-mt-20 sm:mx-6 lg:absolute lg:-bottom-8 lg:-left-12 lg:right-4 lg:mx-0 lg:mt-0">
                <div className="rounded-2xl border border-brand/20 bg-surface p-5 shadow-2xl shadow-contrast/15 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-strong">
                    Why Inverge
                  </p>
                  <div className="mt-3 flex items-start justify-between gap-5">
                    <div>
                      <p className="text-lg font-bold tracking-tight text-ink sm:text-xl">
                        Funding that follows delivery
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">
                        Milestones and proof requirements are published before
                        backing opens.
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-brand-strong">
                      <span
                        className="size-2 rounded-full bg-brand"
                        aria-hidden="true"
                      />
                      Clear terms
                    </span>
                  </div>
                  <div
                    className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-brand/12"
                    aria-hidden="true"
                  >
                    <span className="w-1/3 bg-brand" />
                    <span className="w-1/3 border-l-2 border-surface bg-brand/65" />
                    <span className="w-1/3 border-l-2 border-surface bg-brand/30" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
