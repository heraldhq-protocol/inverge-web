import Image from "next/image";
import Link from "next/link";

import { Container } from "@/features/marketing/components/container";

export function TwoDoorsSection() {
  return (
    <section className="bg-canvas py-12 md:py-16">
      <Container>
        <div
          data-reveal-stagger="0.12"
          className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8"
        >
          {/* Card 1: For builders */}
          <div className="flex flex-col gap-6 rounded-3xl border border-border/80 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-7">
            <div className="relative h-44 w-36 shrink-0 overflow-hidden rounded-2xl border border-border/60 sm:h-48 sm:w-40">
              <Image
                src="/images/showcase/two_doors_builder.png"
                alt="African builder planning project milestone delivery"
                fill
                priority
                sizes="160px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                For builders
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">
                Validate your idea. Publish your plan.
                <br />
                Get curated. Get paid in stages.
              </p>
              <div className="mt-5 flex flex-col items-start gap-2.5">
                <Link
                  href="/sign-up"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  Start an idea
                </Link>
                <Link
                  href="/guides/publish-and-validate-an-idea"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand transition-colors hover:text-brand-strong hover:underline"
                >
                  <span>Read the builder guide</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: For backers */}
          <div className="flex flex-col gap-6 rounded-3xl border border-border/80 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-7">
            <div className="relative h-44 w-36 shrink-0 overflow-hidden rounded-2xl border border-border/60 sm:h-48 sm:w-40">
              <Image
                src="/images/showcase/two_doors_backer.png"
                alt="African supporter reviewing community milestones"
                fill
                priority
                sizes="160px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                For backers
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">
                Browse ideas. Inspect evidence.
                <br />
                Back campaigns. Object or claim a refund.
              </p>
              <div className="mt-5 flex flex-col items-start gap-2.5">
                <Link
                  href="/discover"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  Explore ideas
                </Link>
                <Link
                  href="/guides/how-milestone-escrow-works"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand transition-colors hover:text-brand-strong hover:underline"
                >
                  <span>Read the backer guide</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
