import { SparklesIcon } from "@/components/ui/hugeicons";
import { Container } from "@/features/marketing/components/container";
import { SectionBackground } from "@/features/marketing/components/section-background";

export function BuildingInTheOpenSlot() {
  return (
    <section className="border-t border-border/80 bg-canvas py-12 sm:py-16">
      <Container>
        <div className="relative isolate overflow-hidden rounded-3xl border border-dashed border-border/90 bg-surface/60 p-8 text-center sm:p-10">
          <SectionBackground
            tone="pattern"
            sizes="(max-width: 640px) 100vw, 1100px"
            className="-z-10 opacity-[0.08]"
          />
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand">
            <SparklesIcon size={20} />
          </div>
          <h3 className="mt-4 text-base font-bold text-ink sm:text-lg">
            Building in the open
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-muted sm:text-sm">
            We do not show fabricated testimonials or invented partner logos.
            Verified builder stories, backer feedback, and institutional partner
            marks will appear here as pilot programs complete.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-border bg-canvas px-3 py-1 text-xs font-medium text-muted">
              Pilot Cohort 01 in review
            </span>
            <span className="rounded-full border border-border bg-canvas px-3 py-1 text-xs font-medium text-muted">
              Open feedback loop
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
