import type { Metadata } from "next";
import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Analytics01Icon,
  ArrowRight02Icon,
  Idea01Icon,
} from "@hugeicons/core-free-icons";

import { Pill } from "@/components/ui/pill";
import { StatePanel } from "@/components/ui/state-panel";
import {
  AnalyticsServiceUnavailable,
  AnalyticsSignedOut,
} from "@/features/analytics/components/analytics-state";
import { PremiumAccessPanel } from "@/features/analytics/components/premium-access-panel";
import { accessNotice } from "@/features/analytics/lib/access";
import type { CreatorAnalyticsIdea } from "@/features/analytics/lib/types";
import { getAnalyticsAccess } from "@/features/analytics/server/access";
import { getCreatorAnalyticsIndex } from "@/features/analytics/server/workspace";
import { IdeaCover } from "@/features/ideas/components/idea-cover";
import {
  ideaStatusLabel,
  ideaStatusTone,
} from "@/features/ideas/lib/creator-rows";
import { formatCompactMoney } from "@/lib/money";

export const metadata: Metadata = {
  title: "Idea analytics",
  description:
    "Private analytics for your ideas: support, estimated interest, feedback, and next steps.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function statusFor(idea: CreatorAnalyticsIdea): string {
  if (idea.status) return ideaStatusLabel[idea.status];
  return idea.visibility === "public" ? "Published" : "Unlisted";
}

function statusTone(idea: CreatorAnalyticsIdea) {
  if (idea.status) return ideaStatusTone(idea.status);
  return idea.visibility === "public" ? "accent" : "neutral";
}

function AnalyticsIdeaCard({ idea }: { idea: CreatorAnalyticsIdea }) {
  return (
    <li>
      <Link
        href={`/d/creator/ideas/${idea.id}/insights`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,box-shadow] hover:border-brand/30 hover:shadow-lg hover:shadow-ink/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <div className="relative aspect-[16/9] bg-surface-muted">
          <IdeaCover
            artwork={idea.artwork}
            cover={idea.cover}
            alt=""
            sizes="(min-width: 768px) 480px, 100vw"
          />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Pill size="xs">{idea.category}</Pill>
            <Pill tone={statusTone(idea)} size="xs">
              {statusFor(idea)}
            </Pill>
          </div>
          <h3 className="mt-2 text-lg font-bold tracking-[-0.03em] text-ink">
            {idea.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted">
            {idea.description}
          </p>

          <dl className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-canvas p-2.5">
            <div>
              <dt className="text-[0.625rem] text-muted">Supporters</dt>
              <dd className="mt-0.5 text-sm font-bold tabular-nums text-ink">
                {idea.supporters.toLocaleString("en-US")}
              </dd>
            </div>
            <div>
              <dt className="text-[0.625rem] text-muted">Est. interest</dt>
              <dd className="mt-0.5 text-sm font-bold tabular-nums text-ink">
                {formatCompactMoney(idea.prePledged)}
              </dd>
            </div>
            <div>
              <dt className="text-[0.625rem] text-muted">Feedback</dt>
              <dd className="mt-0.5 text-sm font-bold tabular-nums text-ink">
                {idea.feedbackResponses.toLocaleString("en-US")}
              </dd>
            </div>
          </dl>

          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-strong">
            <HugeiconsIcon
              icon={Analytics01Icon}
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            Open analytics
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              size={15}
              strokeWidth={1.9}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
            />
          </span>
        </div>
      </Link>
    </li>
  );
}

export default async function IdeaAnalyticsIndexPage({
  searchParams,
}: PageProps) {
  const [access, params, index] = await Promise.all([
    getAnalyticsAccess(),
    searchParams,
    getCreatorAnalyticsIndex(),
  ]);

  const header = (
    <>
      <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
        Creator workspace
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
        Idea analytics
      </h1>
      <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
        Understand how an idea is performing, what the community is telling you,
        and which next step is available. Basic analytics stay available without
        premium access.
      </p>
    </>
  );

  if (index.status === "signed_out") {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
        {header}
        <div className="mt-6">
          <AnalyticsSignedOut next="/d/creator/analytics" />
        </div>
      </div>
    );
  }

  if (index.status === "unavailable") {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
        {header}
        <div className="mt-6">
          <AnalyticsServiceUnavailable
            description={index.reason}
            retryHref="/d/creator/analytics"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      {header}

      <section aria-labelledby="analytics-ideas" className="mt-6">
        <h2 id="analytics-ideas" className="sr-only">
          Ideas with analytics
        </h2>
        {index.ideas.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-2">
            {index.ideas.map((idea) => (
              <AnalyticsIdeaCard key={idea.id} idea={idea} />
            ))}
          </ul>
        ) : (
          <StatePanel
            variant="empty"
            eyebrow="No ideas yet"
            title="Analytics starts with an idea"
            description="Create an idea to see supporter growth, estimated interest, and feedback here. Nothing is measured until an idea exists."
            action={
              <Link
                href="/d/creator/ideas/new"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <HugeiconsIcon
                  icon={Idea01Icon}
                  size={16}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="mr-1.5"
                />
                Create an idea
              </Link>
            }
          />
        )}
      </section>

      <PremiumAccessPanel
        access={access}
        notice={accessNotice(params.access)}
      />

      <p className="mt-5 max-w-3xl text-xs leading-5 text-muted">
        {index.status === "live"
          ? "This list reads the signed-in creator's own ideas from the API. Analytics is created per idea and remains private to its creator."
          : "This list uses the preview fixture because preview auth is enabled or the analytics API is not configured. Premium access is not checked in this environment."}
        {index.truncated
          ? " Showing the newest 100 ideas; older ideas are not listed."
          : ""}
      </p>
    </div>
  );
}
