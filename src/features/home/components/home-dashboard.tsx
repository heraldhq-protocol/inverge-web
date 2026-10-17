import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { SectionHeading } from "@/components/ui/section-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { ActivityPanel } from "@/features/home/components/activity-panel";
import { CreatorCallout } from "@/features/home/components/creator-callout";
import { FeaturedIdeaBanner } from "@/features/home/components/featured-idea-banner";
import { IdeathonRailCard } from "@/features/home/components/ideathon-rail-card";
import { QuickActionGrid } from "@/features/home/components/quick-actions";
import { RecommendedIdeas } from "@/features/home/components/recommended-ideas";
import type { DashboardModules } from "@/features/home/lib/dashboard-modules";
import type {
  ActivityItem,
  CreatorSnapshot,
  HomeIdeathon,
  QuickAction,
} from "@/features/home/types";
import { IdeaDiscoveryCard } from "@/features/ideas/components/idea-discovery-card";
import type { DiscoveryIdea } from "@/features/ideas/types";

const firstSteps = [
  {
    title: "Find an idea worth backing",
    body: "Discover what African builders are working on, then support, follow, or save what matters to you.",
  },
  {
    title: "Tell a creator what you think",
    body: "Structured feedback is the strongest validation signal. Answer the questions a creator asked.",
  },
  {
    title: "Grow your own idea",
    body: "Publish an idea, invite feedback, and track how support builds. Funding stays optional.",
  },
] as const;

function FirstSteps() {
  return (
    <section
      aria-labelledby="first-steps-heading"
      className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
    >
      <h2
        id="first-steps-heading"
        className="text-base font-bold tracking-[-0.02em] text-ink"
      >
        New here? Start with one of these
      </h2>
      <ol className="mt-4 grid gap-4 sm:grid-cols-3">
        {firstSteps.map((step, index) => (
          <li key={step.title}>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-brand-strong">
              <span className="grid size-6 place-items-center rounded-full bg-brand-soft text-[0.6875rem] tabular-nums">
                {index + 1}
              </span>
              Step {index + 1}
            </p>
            <p className="mt-2 text-sm font-semibold text-ink">{step.title}</p>
            <p className="mt-1 text-xs leading-5 text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function HomeDashboard({
  actions,
  activity,
  creatorSnapshot,
  featured,
  greeting,
  ideathon,
  isNewViewer,
  modules,
  recommended,
  trending,
  viewerName,
}: {
  actions: readonly QuickAction[];
  activity: readonly ActivityItem[];
  creatorSnapshot: CreatorSnapshot;
  featured: DiscoveryIdea | undefined;
  greeting: string;
  ideathon: HomeIdeathon | null;
  isNewViewer: boolean;
  modules: DashboardModules;
  recommended: readonly DiscoveryIdea[];
  trending: readonly DiscoveryIdea[];
  viewerName: string | null;
}) {
  const salutation = viewerName?.trim()
    ? `${greeting}, ${viewerName.trim().split(/\s+/)[0]}.`
    : `${greeting}.`;

  return (
    <div className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 xl:px-10">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem] xl:gap-7">
        <div className="min-w-0 space-y-5 sm:space-y-6">
          <header>
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
                Home
              </p>
              <span
                className="rounded-full border border-border bg-surface px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-muted"
                title="This dashboard renders preview content until account sessions are connected"
              >
                Preview data
              </span>
            </div>
            <h1 className="mt-2 text-balance text-[1.75rem] font-bold leading-tight tracking-[-0.045em] text-ink sm:text-4xl">
              {salutation}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted sm:text-[0.9375rem]">
              Great ideas grow with great people. Explore, support, and be part
              of what&apos;s next.
            </p>
          </header>

          {featured ? (
            <FeaturedIdeaBanner idea={featured} />
          ) : (
            <StatePanel
              variant="empty"
              eyebrow="Nothing featured yet"
              title="New ideas will appear here"
              description="Once creators publish ideas for validation, a featured idea will be selected from the public catalogue."
              action={
                <Link
                  href="/d/discover"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Browse ideas
                </Link>
              }
            />
          )}

          <QuickActionGrid actions={actions} />

          {isNewViewer ? <FirstSteps /> : null}

          <section aria-labelledby="momentum-heading">
            <SectionHeading
              title="Ideas gaining momentum"
              description="Public ideas attracting support and feedback from the community."
              actionHref="/d/discover"
              actionLabel="Explore all ideas"
            />

            {trending.length > 0 ? (
              <>
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {trending.map((idea) => (
                    <li key={idea.id} className="grid">
                      <IdeaDiscoveryCard idea={idea} />
                    </li>
                  ))}
                </ul>
                <Link
                  href="/d/discover"
                  className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-strong sm:hidden"
                >
                  Explore all ideas
                  <HugeiconsIcon
                    icon={ArrowRight02Icon}
                    size={16}
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                </Link>
              </>
            ) : (
              <StatePanel
                variant="empty"
                eyebrow="No public ideas yet"
                title="Be the first to publish"
                description="Published ideas appear here once they are listed for discovery."
                action={
                  <Link
                    href="/d/creator/ideas/new"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    Start an idea
                  </Link>
                }
              />
            )}
          </section>
        </div>

        <aside
          aria-label="Your activity and suggestions"
          className="min-w-0 space-y-4 xl:sticky xl:top-20 xl:self-start"
        >
          <ActivityPanel items={activity} />

          {modules.creatorCallout !== "hidden" ? (
            <CreatorCallout
              mode={modules.creatorCallout}
              snapshot={creatorSnapshot}
            />
          ) : null}

          <RecommendedIdeas ideas={recommended} />

          {ideathon && modules.ideathons !== "hidden" ? (
            <IdeathonRailCard ideathon={ideathon} />
          ) : null}

          {modules.organizerEntry ? (
            <section className="rounded-2xl border border-border bg-surface p-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-ink">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={16}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="text-brand-strong"
                />
                Programme administration
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Your account can run ideathons. Organiser tools are kept out of
                the community dashboard.
              </p>
              <Link
                href="/admin/programmes"
                className="mt-2 inline-flex min-h-10 items-center text-xs font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Open programme workspace
              </Link>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
