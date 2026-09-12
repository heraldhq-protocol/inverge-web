import { FileCheck2, Layers, Lightbulb, RotateCcw } from "lucide-react";

import { Container } from "@/features/marketing/components/container";

const steps = [
  {
    number: "01",
    title: "Validate the idea",
    body: "Builders publish the problem, solution, roadmap, and intended ask. Support, feedback, and non-binding pre-pledges show whether real demand exists before money moves.",
    shell: "bg-brand text-white shadow-md",
    icon: Lightbulb,
  },
  {
    number: "02",
    title: "Fund a clear plan",
    body: "Curated campaigns publish a target, rewards, milestones, tranche sizes, and the evidence required before contributions open.",
    shell: "border border-brand/20 bg-brand/10 text-brand-strong shadow-sm",
    icon: Layers,
  },
  {
    number: "03",
    title: "Review delivery",
    body: "Backers inspect milestone evidence and can object. Approved work releases the next tranche; an upheld objection makes remaining escrow refundable.",
    shell: "bg-contrast text-white shadow-md",
    icon: FileCheck2,
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 bg-canvas py-16 md:py-24"
    >
      <Container>
        <div className="mb-14 md:mb-20">
          <h2 className="text-3xl font-bold tracking-[-0.04em] text-ink sm:text-4xl lg:text-5xl">
            How it works
          </h2>
          <p className="mt-2 text-base text-muted sm:text-lg">
            Three clear stages. Accountability through the full journey.
          </p>
        </div>

        <div className="relative">
          <ol className="grid lg:grid-cols-3 lg:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;

              return (
                <li
                  key={step.number}
                  className="group relative flex gap-5 lg:flex-col lg:gap-0"
                >
                  <div className="relative shrink-0">
                    <div
                      className={`grid size-14 place-items-center rounded-2xl lg:size-16 ${step.shell}`}
                    >
                      <Icon className="size-6 lg:size-7" aria-hidden="true" />
                    </div>
                    {!isLast ? (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 left-1/2 top-[3.75rem] -translate-x-1/2 border-l-2 border-dashed border-brand/35 lg:hidden"
                      />
                    ) : null}
                  </div>

                  <div
                    className={
                      isLast ? "pb-4 lg:pb-0 lg:pt-6" : "pb-12 lg:pb-0 lg:pt-6"
                    }
                  >
                    <span className="font-mono text-xs font-semibold text-brand-strong">
                      {step.number}
                    </span>
                    <h3 className="mt-1.5 text-xl font-bold tracking-tight text-ink sm:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted sm:text-base">
                      {step.body}
                    </p>
                  </div>

                  {!isLast ? (
                    <span
                      aria-hidden="true"
                      className="absolute -right-6 left-[4.5rem] top-8 hidden border-t-2 border-dashed border-brand/35 lg:block"
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>

          <div className="relative mt-10 hidden h-16 lg:block">
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-8 right-[calc(33.333%-3.333rem)] rounded-b-3xl border-x-2 border-b-2 border-dashed border-brand/35"
            />
            <span
              aria-hidden="true"
              className="absolute left-8 top-0 -translate-x-1/2 border-x-[5px] border-b-[7px] border-x-transparent border-b-brand-strong"
            />
            <span className="absolute bottom-0 left-[calc(33.333%+2.667rem)] -translate-x-1/2 translate-y-1/2 inline-flex items-center gap-2 bg-canvas px-3 text-xs font-semibold uppercase tracking-[0.12em] text-brand-strong">
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Eligible remaining escrow returns to backers
            </span>
          </div>

          <div className="ml-[4.75rem] inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-brand-strong lg:hidden">
            <RotateCcw
              className="size-3.5 text-brand-strong"
              aria-hidden="true"
            />
            <span>Eligible remaining escrow returns</span>
          </div>

          <p className="mt-8 max-w-3xl text-sm leading-6 text-muted">
            A disclosed working-capital tranche releases when a campaign
            succeeds and is not refundable. Later refunds cover only eligible
            funds still in escrow.
          </p>
        </div>
      </Container>
    </section>
  );
}
