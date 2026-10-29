"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  AlertCircleIcon,
  ArrowRight02Icon,
  Coins01Icon,
  Idea01Icon,
  Refresh01Icon,
  UserMultiple02Icon,
} from "@/components/ui/hugeicons";
import { authHref } from "@/features/auth/lib/auth-routes";
import { IdeaCover } from "@/features/ideas/components/idea-cover";
import { Container } from "@/features/marketing/components/container";
import { SectionBackground } from "@/features/marketing/components/section-background";
import type {
  HomeIdeaCard,
  HomeIdeasSection,
} from "@/features/marketing/types";
import { formatMoney } from "@/lib/money";

type IdeasStatus = "ready" | "loading" | "empty" | "error";

const isDevelopment = process.env.NODE_ENV !== "production";

const supporterFormat = new Intl.NumberFormat("en-US");

function PromotedBadge() {
  return (
    <span
      className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-contrast/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm"
      title="Paid placement affects visibility only, never validation metrics"
    >
      Promoted
    </span>
  );
}

/**
 * The public signals a card may show.
 *
 * `estimatedInterest` is the API's weighted pre-pledge figure — the approved
 * public label (FR-207). The raw pre-pledge sum is never displayed.
 */
function IdeaStats({ idea }: { idea: HomeIdeaCard }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink">
      <span className="inline-flex items-center gap-1.5 font-medium">
        <UserMultiple02Icon
          size={16}
          className="text-muted"
          aria-hidden="true"
        />
        {supporterFormat.format(idea.supporters)} supporters
      </span>
      <span className="inline-flex items-center gap-1.5 font-mono font-bold text-ink">
        <Coins01Icon size={16} className="text-muted" aria-hidden="true" />
        {formatMoney(idea.estimatedInterest)} est. interest
      </span>
    </div>
  );
}

/**
 * The editorial lead.
 *
 * One idea is given the room a magazine gives a feature: a full-height image
 * beside a headline at reading size. The record is whatever the section holds;
 * a live card opens the idea page, a preview card has nowhere to go and is
 * rendered as plain text rather than as a link that would 404.
 */
function LeadIdeaCard({ idea }: { idea: HomeIdeaCard }) {
  return (
    <article className="group relative grid h-full overflow-hidden rounded-3xl border border-border/80 bg-surface shadow-sm transition-shadow hover:shadow-md md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="relative aspect-16/10 w-full overflow-hidden bg-border/20 md:aspect-auto md:min-h-[23rem]">
        <IdeaCover
          alt={idea.title}
          artwork={idea.artwork}
          className="transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transform-none"
          cover={idea.cover}
          sizes="(max-width: 768px) 100vw, 55vw"
        />
        {idea.promoted ? <PromotedBadge /> : null}
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-strong">
          {idea.category}
        </p>
        <h3 className="mt-3 text-balance text-2xl font-bold tracking-[-0.035em] text-ink sm:text-3xl">
          {idea.href ? (
            <Link
              href={idea.href}
              className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {idea.title}
            </Link>
          ) : (
            idea.title
          )}
        </h3>
        <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
          {idea.pitch}
        </p>
        <div className="mt-6 border-t border-border/60 pt-4">
          <IdeaStats idea={idea} />
          <p className="mt-3 text-[11px] text-muted">
            No money moves at this stage.
          </p>
        </div>
      </div>
    </article>
  );
}

/** A supporting idea: the same record at a smaller scale, stacked under the lead. */
function SupportingIdeaCard({ idea }: { idea: HomeIdeaCard }) {
  return (
    <article className="group relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-sm transition-shadow hover:shadow-md sm:flex-row">
      <div className="relative aspect-16/10 w-full shrink-0 overflow-hidden bg-border/20 sm:aspect-auto sm:w-44 lg:w-40">
        <IdeaCover
          alt={idea.title}
          artwork={idea.artwork}
          cover={idea.cover}
          sizes="(max-width: 640px) 100vw, 190px"
        />
        {idea.promoted ? <PromotedBadge /> : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-strong">
          {idea.category}
        </p>
        <h3 className="mt-1.5 text-lg font-bold tracking-[-0.03em] text-ink">
          {idea.href ? (
            <Link
              href={idea.href}
              className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {idea.title}
            </Link>
          ) : (
            idea.title
          )}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">
          {idea.pitch}
        </p>
        <div className="mt-auto border-t border-border/60 pt-3">
          <IdeaStats idea={idea} />
          <p className="mt-2 text-[10px] text-muted">
            No money moves at this stage.
          </p>
        </div>
      </div>
    </article>
  );
}

function LeadSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-sm md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="aspect-16/10 w-full bg-border/50 motion-safe:animate-pulse md:aspect-auto md:min-h-[23rem]" />
      <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
        <div className="h-3 w-1/4 rounded bg-border/60" />
        <div className="h-7 w-3/4 rounded bg-border/80" />
        <div className="h-4 w-full rounded bg-border/50" />
        <div className="mt-4 border-t border-border/60 pt-4">
          <div className="flex justify-between">
            <div className="h-3 w-1/3 rounded bg-border/60" />
            <div className="h-3 w-1/3 rounded bg-border/60" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SupportingSkeleton() {
  return (
    <div className="flex flex-1 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm sm:flex-row">
      <div className="aspect-16/10 w-full shrink-0 bg-border/50 motion-safe:animate-pulse sm:aspect-auto sm:w-44 lg:w-40" />
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="h-3 w-1/4 rounded bg-border/60" />
        <div className="h-5 w-3/4 rounded bg-border/80" />
        <div className="h-3 w-full rounded bg-border/50" />
        <div className="mt-auto border-t border-border/60 pt-3">
          <div className="h-3 w-1/2 rounded bg-border/60" />
        </div>
      </div>
    </div>
  );
}

export function IdeaCardsSection({ section }: { section: HomeIdeasSection }) {
  const router = useRouter();
  const [previewStatus, setPreviewStatus] = useState<IdeasStatus | null>(null);

  const baseStatus: IdeasStatus =
    section.state === "unavailable"
      ? "error"
      : section.ideas.length > 0
        ? "ready"
        : "empty";
  // The dev switcher is a design aid only; production always derives the state
  // from the server section.
  const status = (isDevelopment ? previewStatus : null) ?? baseStatus;

  const ideas = section.state === "unavailable" ? [] : section.ideas;
  const lead = ideas[0];
  const supporting = ideas.slice(1);
  const hasSupporting = supporting.length > 0;

  const sourceLabel =
    section.state === "live"
      ? "Live data"
      : section.state === "preview"
        ? "Preview data"
        : null;

  return (
    <section
      id="ideas"
      className="border-t border-border/80 bg-canvas py-16 md:py-24"
    >
      <Container>
        <div
          data-reveal
          className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-end sm:justify-between sm:pb-12"
        >
          <div>
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full bg-brand"
                aria-hidden="true"
              />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-strong">
                Discover
              </p>
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-ink sm:text-4xl">
              Ideas
            </h2>
            <p className="mt-2 text-sm text-muted sm:text-base">
              Early ideas testing demand with community feedback before opening
              capital.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {sourceLabel ? (
              <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted">
                {sourceLabel}
              </span>
            ) : null}

            {isDevelopment ? (
              <div className="hidden items-center gap-1 rounded-full border border-border bg-surface p-1 text-xs font-medium text-muted md:flex">
                {(["ready", "loading", "empty", "error"] as const).map(
                  (state) => (
                    <button
                      key={state}
                      type="button"
                      onClick={() => setPreviewStatus(state)}
                      className={`rounded-full px-2.5 py-1 capitalize transition-colors ${
                        status === state
                          ? "bg-contrast font-semibold text-white"
                          : "hover:text-ink"
                      }`}
                    >
                      {state === "ready" ? "Cards" : state}
                    </button>
                  ),
                )}
              </div>
            ) : null}
          </div>
        </div>

        {status === "ready" && lead ? (
          <div
            aria-label="Featured ideas"
            className="grid gap-6 lg:grid-cols-12 lg:gap-7"
          >
            <div
              data-reveal
              className={
                hasSupporting
                  ? "min-w-0 lg:col-span-7"
                  : "min-w-0 lg:col-span-12"
              }
            >
              <LeadIdeaCard idea={lead} />
            </div>

            {hasSupporting ? (
              <div
                data-reveal-stagger="0.08"
                className="flex min-w-0 flex-col gap-5 lg:col-span-5"
              >
                {supporting.map((idea) => (
                  <SupportingIdeaCard key={idea.id} idea={idea} />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {status === "loading" ? (
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-7">
            <div className="lg:col-span-7">
              <LeadSkeleton />
            </div>
            <div className="flex flex-col gap-5 lg:col-span-5">
              <SupportingSkeleton />
              <SupportingSkeleton />
            </div>
          </div>
        ) : null}

        {status === "empty" ? (
          <div className="relative isolate flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
            <SectionBackground
              tone="pattern"
              sizes="(max-width: 640px) 100vw, 900px"
              className="-z-10 opacity-[0.08]"
            />
            <div className="grid size-14 place-items-center rounded-full border border-border bg-canvas text-brand-strong">
              <Idea01Icon size={26} aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-xl font-bold tracking-tight text-ink">
              No ideas yet
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
              Be the first to bring an idea to life or back a campaign.
            </p>
            <div className="mt-6">
              <Link
                href={authHref(undefined, "creator")}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-ink transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Start an idea
              </Link>
            </div>
          </div>
        ) : null}

        {status === "error" ? (
          <div
            role="alert"
            className="relative isolate flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-danger/20 bg-surface px-6 py-16 text-center"
          >
            <SectionBackground
              tone="pattern"
              sizes="(max-width: 640px) 100vw, 900px"
              className="-z-10 opacity-[0.06]"
            />
            <div className="grid size-14 place-items-center rounded-full bg-danger/10 text-danger">
              <AlertCircleIcon size={26} aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-xl font-bold tracking-tight text-ink">
              Ideas are unavailable right now
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
              We couldn&apos;t load ideas right now. Please try again later.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setPreviewStatus(null);
                  router.refresh();
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-5 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <Refresh01Icon size={16} />
                Try again
              </button>
            </div>
          </div>
        ) : null}

        <div data-reveal className="mt-9 flex justify-center">
          <Link
            href="/ideas"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-ink/80 bg-transparent px-7 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            See all ideas
            <ArrowRight02Icon size={16} aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
