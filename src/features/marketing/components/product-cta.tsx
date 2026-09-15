import { ButtonLink } from "@/features/marketing/components/button-link";
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
              Create your account to discover promising ideas and follow
              builders from early validation through delivery.
            </p>
          </div>
          <div
            className="mx-auto flex w-full max-w-sm flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row sm:gap-4"
            aria-label="Account and product actions"
          >
            <ButtonLink href="/sign-up" className="sm:w-auto">
              Create account
            </ButtonLink>
            <span
              aria-disabled="true"
              className="inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white/75 sm:w-auto"
            >
              Explore ideas
            </span>
          </div>
          <p className="text-xs text-white/48">
            Idea discovery will open when the product screens are ready.
          </p>
        </div>
      </Container>
    </section>
  );
}
