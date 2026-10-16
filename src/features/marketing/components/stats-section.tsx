"use client";

import { Container } from "@/features/marketing/components/container";
import { SectionBackground } from "@/features/marketing/components/section-background";

export interface MarketingStats {
  publishedIdeas: string;
  totalEscrowed: string;
  activeCampaigns: string;
}

interface StatsSectionProps {
  metrics?: MarketingStats | null;
}

export function StatsSection({ metrics }: StatsSectionProps) {
  return (
    <section id="stats" className="bg-canvas py-8 sm:py-12">
      <Container>
        <div className="relative isolate overflow-hidden rounded-3xl bg-[#0f1b15] p-7 text-white shadow-sm sm:p-9">
          <SectionBackground
            tone="forest"
            className="-z-10 object-[50%_70%] opacity-40"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0f1b15]/70 via-[#0f1b15]/55 to-[#0f1b15]/30"
          />
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-8">
            {/* Left title and subtitle */}
            <div data-reveal className="lg:col-span-4">
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Inverge activity
              </h2>
              <p className="mt-1 text-xs text-white/60 sm:text-sm">
                Figures come from indexed chain data.
              </p>
            </div>

            {/* Right side: 3 metrics */}
            <div
              data-reveal-stagger="0.1"
              className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:col-span-8 lg:gap-8"
            >
              {/* Metric 1 */}
              <div className="flex flex-col items-start gap-1.5 border-t border-white/10 pt-4 sm:border-t-0 sm:pt-0">
                <div className="flex items-center gap-2 text-white/80">
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span className="text-sm font-medium text-white">
                    Ideas published
                  </span>
                </div>
                <span className="font-semibold text-xs text-brand">
                  {metrics?.publishedIdeas ?? "Preview data"}
                </span>
              </div>

              {/* Metric 2 */}
              <div className="flex flex-col items-start gap-1.5 border-t border-white/10 pt-4 sm:border-t-0 sm:pt-0">
                <div className="flex items-center gap-2 text-white/80">
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 9v1" />
                    <path d="M12 14v1" />
                    <path d="M9 12h1" />
                    <path d="M14 12h1" />
                  </svg>
                  <span className="text-sm font-medium text-white">
                    Total escrowed
                  </span>
                </div>
                <span className="font-semibold text-xs text-brand">
                  {metrics?.totalEscrowed ?? "Preview data"}
                </span>
              </div>

              {/* Metric 3 */}
              <div className="flex flex-col items-start gap-1.5 border-t border-white/10 pt-4 sm:border-t-0 sm:pt-0">
                <div className="flex items-center gap-2 text-white/80">
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                    <path d="M9 12H4s.55-3.03 2-4.5c1.62-1.63 5-2 5-2" />
                    <path d="M12 15v5s3.03-.55 4.5-2c1.63-1.62 2-5 2-5" />
                  </svg>
                  <span className="text-sm font-medium text-white">
                    Active campaigns
                  </span>
                </div>
                <span className="font-semibold text-xs text-brand">
                  {metrics?.activeCampaigns ?? "Preview data"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
