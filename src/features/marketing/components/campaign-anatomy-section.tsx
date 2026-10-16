import Image from "next/image";
import Link from "next/link";

import { Container } from "@/features/marketing/components/container";

export function CampaignAnatomySection() {
  return (
    <section className="marketing-pattern py-16 md:py-24">
      <Container>
        {/* Header */}
        <div
          data-reveal
          className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-center sm:justify-between sm:pb-10"
        >
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
            Anatomy of a protected campaign
          </h2>
          <span className="inline-flex self-start items-center rounded-full border border-border bg-white px-3.5 py-1 text-xs font-medium text-muted sm:self-auto">
            Illustrative example
          </span>
        </div>

        {/* Schematic Canvas Container */}
        <div className="rounded-3xl border border-border/80 bg-[#f9f8f5] p-5 shadow-sm sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-0">
            {/* Left Column: The Campaign Card */}
            <div
              data-reveal="left"
              className="rounded-2xl border border-border/80 bg-white p-6 shadow-sm sm:p-7 lg:col-span-7"
            >
              {/* 1. Target & Project Info */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="relative aspect-square size-20 shrink-0 overflow-hidden rounded-xl border border-border/70 sm:size-24">
                  <Image
                    src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&h=800&fit=crop"
                    alt="Solar cold storage hardware installation"
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold tracking-tight text-ink sm:text-xl">
                    Solar cold storage for farmers
                  </h3>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Clean energy
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Affordable, off-grid cooling for rural communities.
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-bold text-ink sm:text-base">
                      $25,000 target (USDC)
                    </span>
                    <span className="size-2 rounded-full bg-brand" />
                  </div>
                </div>
              </div>

              {/* Connector line 1 on desktop */}
              <div className="my-5 border-t border-border/60" />

              {/* 2. Working Capital Tranche */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-brand">
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                      <path d="M16 16h5v5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">
                      Working-capital tranche
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      $5,000 (Released at funding close, not refundable)
                    </p>
                  </div>
                </div>
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" />
              </div>

              {/* Divider */}
              <div className="my-5 border-t border-border/60" />

              {/* 3. Milestone Under Review */}
              <div className="flex items-start justify-between gap-3">
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        className="size-4 text-ink"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M3 9h18" />
                        <path d="M9 21V9" />
                      </svg>
                      <span className="text-sm font-bold text-ink">
                        Milestone 2 of 4
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                      <span>⚠</span> Under review
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-muted">
                    Equipment installation
                  </p>

                  <div className="mt-3">
                    <div className="font-mono text-base font-bold tracking-tight">
                      <span className="text-ink">2d</span>{" "}
                      <span className="text-rose-600">14h</span>{" "}
                      <span className="text-rose-600">32m</span>
                    </div>
                    <span className="text-[11px] text-muted">
                      Objection window
                    </span>
                  </div>
                </div>
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" />
              </div>

              {/* Divider */}
              <div className="my-5 border-t border-border/60" />

              {/* 4. Receipt Link */}
              <div className="flex items-center justify-between">
                <Link
                  href="/guides/milestones-objections-and-refunds"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand transition-colors hover:text-brand-strong hover:underline"
                >
                  <span>View receipt</span>
                  <span>→</span>
                </Link>
                <span className="size-2 rounded-full bg-brand" />
              </div>
            </div>

            {/* Dotted Bridge & Right Callouts Column on desktop */}
            <div
              data-reveal-stagger="0.1"
              className="flex flex-col justify-between py-2 lg:col-span-5 lg:pl-10"
            >
              {/* Callout 1 */}
              <div className="relative flex items-center gap-3">
                <span className="hidden h-px flex-1 border-t-2 border-dashed border-brand/40 lg:block" />
                <div className="flex items-start gap-2.5 lg:w-72">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-brand" />
                  <div>
                    <h4 className="text-sm font-bold text-ink">
                      Target in USDC
                    </h4>
                    <p className="mt-0.5 text-xs text-muted">
                      Shows the funding goal for the campaign.
                    </p>
                  </div>
                </div>
              </div>

              {/* Callout 2 */}
              <div className="relative flex items-center gap-3">
                <span className="hidden h-px flex-1 border-t-2 border-dashed border-brand/40 lg:block" />
                <div className="flex items-start gap-2.5 lg:w-72">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-brand" />
                  <div>
                    <h4 className="text-sm font-bold text-ink">
                      Working-capital tranche
                    </h4>
                    <p className="mt-0.5 text-xs text-muted">
                      Disclosed before you back. Not refundable.
                    </p>
                  </div>
                </div>
              </div>

              {/* Callout 3 */}
              <div className="relative flex items-center gap-3">
                <span className="hidden h-px flex-1 border-t-2 border-dashed border-brand/40 lg:block" />
                <div className="flex items-start gap-2.5 lg:w-72">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-brand" />
                  <div>
                    <h4 className="text-sm font-bold text-ink">
                      Milestone under review
                    </h4>
                    <p className="mt-0.5 text-xs text-muted">
                      Shows the current milestone and objection window.
                    </p>
                  </div>
                </div>
              </div>

              {/* Callout 4 */}
              <div className="relative flex items-center gap-3">
                <span className="hidden h-px flex-1 border-t-2 border-dashed border-brand/40 lg:block" />
                <div className="flex items-start gap-2.5 lg:w-72">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-brand" />
                  <div>
                    <h4 className="text-sm font-bold text-ink">Receipt link</h4>
                    <p className="mt-0.5 text-xs text-muted">
                      View the public receipt for this campaign.
                    </p>
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
