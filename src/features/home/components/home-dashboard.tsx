import { ArrowRight, Plus, Search } from "lucide-react";
import Link from "next/link";

import { StatePanel } from "@/components/ui/state-panel";
import { IdeaCard } from "@/features/home/components/idea-card";
import { PrePledgeList } from "@/features/home/components/pre-pledge-list";
import { SectionHeading } from "@/features/home/components/section-heading";
import type { HomeDashboardData, IdeaSummary } from "@/features/home/types";

const categories = [
  "Technology",
  "Agriculture",
  "Clean energy",
  "Creative",
  "Community",
  "Food & retail",
] as const;

function matchesQuery(idea: IdeaSummary, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery) return true;

  return [idea.title, idea.category, idea.creator, idea.description].some(
    (value) => value.toLocaleLowerCase().includes(normalizedQuery),
  );
}

export function HomeDashboard({
  data,
  query = "",
}: {
  data: HomeDashboardData;
  query?: string;
}) {
  const searchResults = [...data.featuredIdeas, ...data.discoverIdeas].filter(
    (idea) => matchesQuery(idea, query),
  );
  const hasSearch = query.trim().length > 0;
  const leadIdea = data.featuredIdeas[0];

  return (
    <div className="mx-auto w-full max-w-[90rem] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10">
      <form action="/home" role="search" className="flex max-w-2xl gap-2">
        <label htmlFor="product-search" className="sr-only">
          Search ideas, creators, and projects
        </label>
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="product-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search ideas, creators and projects"
            className="min-h-12 w-full rounded-xl border border-border bg-surface py-2 pl-12 pr-4 text-sm text-ink outline-none transition placeholder:text-muted/70 hover:border-muted/45 focus:border-brand focus:ring-3 focus:ring-brand/12 sm:min-h-13"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-contrast px-5 text-sm font-semibold text-white transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <span className="hidden sm:inline">Search</span>
          <Search className="size-5 sm:hidden" aria-hidden="true" />
        </button>
      </form>

      <header className="mt-8 border-b border-border pb-7 sm:mt-10">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-strong">
                Home
              </p>
              <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-brand-strong">
                Product preview
              </span>
            </div>
            <h1 className="mt-2 text-balance text-3xl font-bold tracking-[-0.045em] text-ink sm:text-4xl">
              Good to see you, {data.user.firstName}.
            </h1>
            <p className="mt-1.5 text-sm leading-6 text-muted sm:text-base">
              Discover what&apos;s gaining momentum and pick up where you left
              off.
            </p>
          </div>
          <Link
            href="/ideas"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:hidden"
          >
            <Plus className="size-4 text-brand-strong" aria-hidden="true" />
            Start an idea
          </Link>
        </div>

        <dl className="mt-7 grid max-w-2xl grid-cols-3 divide-x divide-border">
          {[
            [data.stats.ideasSupported, "Ideas supported"],
            [data.stats.activePrePledges, "Active pre-pledges"],
            [data.stats.feedbackResponses, "Feedback responses"],
          ].map(([value, label], index) => (
            <div
              key={label}
              className={`flex flex-col ${index === 0 ? "pr-4" : "px-4 sm:px-7"}`}
            >
              <dt className="order-2 mt-1 text-xs leading-4 text-muted sm:text-sm">
                {label}
              </dt>
              <dd className="order-1 font-mono text-xl font-semibold text-ink sm:text-2xl">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      {hasSearch ? (
        <section className="py-7 sm:py-9">
          <SectionHeading
            title={`Results for “${query.trim()}”`}
            description={`${searchResults.length} matching ${searchResults.length === 1 ? "idea" : "ideas"}`}
            actionHref="/ideas"
            actionLabel="Browse all ideas"
          />
          {searchResults.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {searchResults.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          ) : (
            <StatePanel
              variant="empty"
              eyebrow="No matches"
              title="Try a broader search"
              description="Search by an idea name, creator, category, or the problem being solved."
              action={
                <Link
                  href="/home"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Clear search
                </Link>
              }
            />
          )}
        </section>
      ) : (
        <>
          <section className="py-7 sm:py-9">
            <SectionHeading
              title="Ideas gaining momentum"
              description="Early ideas attracting meaningful support from the community."
              actionHref="/ideas"
              actionLabel="Explore all ideas"
            />

            {leadIdea ? (
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="xl:row-span-2">
                  <IdeaCard idea={leadIdea} variant="featured" />
                </div>
                <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 xl:mx-0 xl:grid xl:grid-cols-2 xl:overflow-visible xl:px-0 xl:pb-0">
                  {data.featuredIdeas.slice(1).map((idea) => (
                    <div
                      key={idea.id}
                      className="w-[82vw] max-w-sm shrink-0 snap-start xl:w-auto xl:max-w-none"
                    >
                      <IdeaCard idea={idea} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <StatePanel
                variant="empty"
                eyebrow="Nothing featured yet"
                title="New ideas will appear here"
                description="Once creators publish ideas for validation, the strongest early signals will be highlighted here."
              />
            )}
          </section>

          <section className="pb-8">
            <SectionHeading
              title="Your pre-pledges"
              description="Amounts you may back if these ideas become campaigns. No money has moved yet."
              actionHref="/pre-pledges"
              actionLabel="View all"
            />
            {data.prePledges.length > 0 ? (
              <PrePledgeList items={data.prePledges} />
            ) : (
              <StatePanel
                variant="empty"
                eyebrow="No pre-pledges yet"
                title="Save your backing intent for later"
                description="Explore ideas and record what you may contribute if a validated idea becomes a campaign. No funds move at this stage."
              />
            )}
          </section>

          <section className="border-t border-border pt-7 sm:pt-8">
            <SectionHeading
              title="Continue discovering"
              actionHref="/ideas"
              actionLabel="Browse all categories"
            />
            <ul
              aria-label="Popular idea categories"
              className="-mx-4 mb-5 flex gap-5 overflow-x-auto border-b border-border px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
            >
              {categories.map((category, index) => (
                <li
                  key={category}
                  className={`shrink-0 border-b-2 px-1 pb-3 text-sm ${
                    index === 0
                      ? "border-brand font-semibold text-brand-strong"
                      : "border-transparent text-muted"
                  }`}
                >
                  {category}
                </li>
              ))}
            </ul>
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {data.discoverIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} variant="compact" />
              ))}
            </div>
            <Link
              href="/ideas"
              className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-strong sm:hidden"
            >
              Browse all ideas
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
