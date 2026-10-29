import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";

import { Container } from "@/features/marketing/components/container";
import { WaitlistLanePanel } from "@/features/marketing/components/waitlist/waitlist-lane-panel";
import { WaitlistLaneProvider } from "@/features/marketing/components/waitlist/waitlist-lane-context";
import { WaitlistForm } from "@/features/marketing/components/waitlist/waitlist-form";
import {
  type WaitlistLaneId,
  waitlistFaq,
  waitlistSteps,
} from "@/features/marketing/content/waitlist";

export function WaitlistView({ initialLane }: { initialLane: WaitlistLaneId }) {
  return (
    <main>
      <section className="bg-canvas pb-16 pt-12 sm:pt-16 lg:pb-24 lg:pt-20">
        <Container>
          <WaitlistLaneProvider key={initialLane} initialLane={initialLane}>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-7">
                <h1 className="max-w-2xl text-4xl font-bold leading-[1.04] tracking-[-0.045em] text-ink sm:text-5xl lg:text-6xl">
                  Back a build in stages.{" "}
                  <span className="mt-1 block text-brand">Or start one.</span>
                </h1>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
                  Campaign money stays in milestone escrow and moves only when
                  delivery is reviewed. Join the launch list to back a vetted
                  build, or to bring your own.
                </p>

                <div id="join" className="mt-8 max-w-xl scroll-mt-28">
                  <WaitlistForm />
                </div>
              </div>

              <div className="lg:col-span-5">
                <WaitlistLanePanel />
              </div>
            </div>
          </WaitlistLaneProvider>
        </Container>
      </section>

      <section className="bg-canvas py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <h2 className="text-2xl font-bold tracking-[-0.035em] text-ink sm:text-3xl">
                What happens after you join
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
                No account, no payment details, no wallet. Just a heads-up when
                your lane opens.
              </p>
            </div>

            <ol className="grid gap-6 sm:grid-cols-3 lg:col-span-8">
              {waitlistSteps.map((step, index) => (
                <li key={step.title} className="border-t border-ink/15 pt-4">
                  <span className="font-mono text-xs font-semibold text-brand-strong">
                    0{index + 1}
                  </span>
                  <h3 className="mt-2 text-base font-semibold leading-6 text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="border-t border-border/80 bg-surface py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-bold tracking-[-0.035em] text-ink sm:text-3xl">
              Questions
            </h2>

            <div className="mt-8 divide-y divide-border border-y border-border/80 text-left">
              {waitlistFaq.map((item) => (
                <details key={item.question} className="group">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-base font-semibold text-ink transition-colors hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
                    />
                  </summary>
                  <p className="max-w-2xl pb-5 pr-8 text-sm leading-6 text-muted">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-canvas py-12 sm:py-14">
        <Container>
          <div className="flex flex-col gap-4 border-t border-ink/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              Want to see the product before you join?
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link
                href="/ideas"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-ink underline decoration-border underline-offset-4 transition-colors hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Browse ideas
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/campaigns"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-ink underline decoration-border underline-offset-4 transition-colors hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Browse campaigns
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
