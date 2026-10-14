import { HugeiconsIcon } from "@hugeicons/react";
import {
  FileViewIcon,
  Idea01Icon,
  UsersRoundIcon,
} from "@hugeicons/core-free-icons";
import { RotateCcw } from "lucide-react";

import { Container } from "@/features/marketing/components/container";

const steps = [
  {
    number: "01",
    title: "Validate the idea",
    body: "Builders publish the problem, solution, roadmap, and intended ask. Support, feedback, and non-binding pre-pledges show whether real demand exists before money moves.",
    icon: Idea01Icon,
  },
  {
    number: "02",
    title: "Fund a clear plan",
    body: "Curated campaigns publish a target, rewards, milestones, tranche sizes, and the evidence required before contributions open.",
    icon: UsersRoundIcon,
  },
  {
    number: "03",
    title: "Review delivery",
    body: "Backers inspect milestone evidence and can object. Approved work releases the next tranche; an upheld objection makes remaining escrow refundable.",
    icon: FileViewIcon,
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="marketing-pattern scroll-mt-20 py-16 md:py-24"
    >
      <Container>
        <div data-reveal className="mb-14 md:mb-20">
          <h2 className="text-3xl font-bold tracking-[-0.04em] text-ink sm:text-4xl lg:text-5xl">
            How it works
          </h2>
          <p className="mt-2 text-base text-muted sm:text-lg">
            Three clear stages. Accountability through the full journey.
          </p>
        </div>

        <div className="relative">
          <ol
            data-reveal-stagger="0.12"
            className="grid lg:grid-cols-3 lg:gap-8"
          >
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;

              return (
                <li
                  key={step.number}
                  className="group relative flex gap-5 lg:flex-col lg:gap-0"
                >
                  <div className="relative shrink-0">
                    <div className="grid size-12 place-items-center rounded-full bg-brand/25 text-brand-strong shadow-md lg:size-16">
                      <HugeiconsIcon
                        icon={step.icon}
                        size={24}
                        color="currentColor"
                        strokeWidth={1.5}
                        className="size-6 lg:size-7"
                        aria-hidden="true"
                      />
                    </div>
                    {!isLast ? (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 left-1/2 top-15 -translate-x-1/2 border-l-2 border-dashed border-brand/35 lg:hidden"
                      />
                    ) : null}
                  </div>

                  <div
                    className={`${isLast ? "pb-4" : "pb-12"} lg:pb-0 lg:pt-6`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-brand/10 px-2 py-2 font-mono text-[10px] font-semibold text-brand-strong">
                        {step.number}
                      </span>
                      <h3 className="mt-1.5 text-lg font-bold tracking-tight text-ink sm:text-xl">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-xs leading-7 text-muted">
                      {step.body}
                    </p>
                  </div>

                  {!isLast ? (
                    <span
                      aria-hidden="true"
                      className="absolute -right-6 left-18 top-8 hidden border-t-2 border-dashed border-brand/35 lg:block"
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>

          {/* Return-flow: desktop bracket illustration */}
          <div data-reveal className="relative mt-10 hidden h-16 lg:block">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-8 right-[calc(33.333%-3.333rem)] rounded-b-3xl border-x-2 border-b-2 border-dashed border-brand/35"
            />
            <span
              aria-hidden="true"
              className="absolute left-8 top-0 -translate-x-1/2 border-x-[5px] border-b-[7px] border-x-transparent border-b-brand-strong"
            />
            <span className="absolute bottom-0 left-[calc(33.333%+2.667rem)] inline-flex -translate-x-1/2 translate-y-1/2 items-center gap-2 bg-canvas px-3 text-xs font-semibold uppercase tracking-[0.12em] text-brand-strong">
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Eligible remaining escrow returns to backers
            </span>
          </div>

          {/* Return-flow: mobile label */}
          <div
            data-reveal
            className="ml-[4.75rem] inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-brand-strong lg:hidden"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            <span>Eligible remaining escrow returns</span>
          </div>

          <p
            data-reveal
            className="mt-8 max-w-3xl text-sm leading-6 text-muted"
          >
            A disclosed working-capital tranche releases when a campaign
            succeeds and is not refundable. Later refunds cover only eligible
            funds still in escrow.
          </p>
        </div>
      </Container>
    </section>
  );
}
