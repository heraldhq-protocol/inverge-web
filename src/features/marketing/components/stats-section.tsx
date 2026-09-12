import { Container } from "@/features/marketing/components/container";

export type MarketingStats = {
  publishedIdeas: string;
  totalEscrowed: string;
  activeCampaigns: string;
};

const statDefinitions = [
  ["publishedIdeas", "Ideas published"],
  ["totalEscrowed", "Total escrowed"],
  ["activeCampaigns", "Active campaigns"],
] as const;

export function StatsSection({ stats }: { stats?: MarketingStats }) {
  return (
    <section id="stats" className="bg-contrast py-16 text-white md:py-24">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
            <span className="size-2 rounded-full bg-brand" aria-hidden="true" />
            Inverge activity
          </p>
          {!stats ? (
            <p className="text-xs text-white/48">
              Live figures connect with backend integration.
            </p>
          ) : null}
        </div>

        <dl className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.6fr_1fr] lg:gap-0 lg:divide-x lg:divide-white/10">
          {statDefinitions.map(([key, label], index) => (
            <div
              key={key}
              className={
                index === 0 ? "lg:pr-8" : index === 1 ? "lg:px-8" : "lg:pl-8"
              }
            >
              <dt className="text-sm font-medium text-white/55">{label}</dt>
              <dd className="mt-3 min-h-[1em] font-mono text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                {stats?.[key] ?? "—"}
              </dd>
              <p className="mt-3 text-xs text-white/42">
                {stats
                  ? "Verified platform total"
                  : "Awaiting verified platform data"}
              </p>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
