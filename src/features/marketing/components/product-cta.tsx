import { Container } from "@/features/marketing/components/container";

export function ProductCta({ compact = false }: { compact?: boolean }) {
  return (
    <section className="bg-canvas py-12 md:py-16">
      <Container>
        <div className="flex flex-col items-center gap-6 overflow-hidden rounded-2xl bg-contrast p-8 text-center text-white md:rounded-3xl md:p-16">
          <div>
            <h2 className="text-balance text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              {compact
                ? "Put it into practice"
                : "Ready to put it into practice?"}
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-white/72">
              Explore live ideas or publish your own and start validating it
              today.
            </p>
          </div>
          <div
            className="flex flex-wrap items-center justify-center gap-4"
            aria-label="Product actions coming soon"
          >
            <span
              aria-disabled="true"
              className="inline-flex min-h-12 cursor-not-allowed items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white opacity-75"
            >
              Explore ideas
            </span>
            <span
              aria-disabled="true"
              className="inline-flex min-h-12 cursor-not-allowed items-center justify-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white/75"
            >
              Publish an idea
            </span>
          </div>
          <p className="text-xs text-white/48">
            These actions will open when the product screens are ready.
          </p>
        </div>
      </Container>
    </section>
  );
}
