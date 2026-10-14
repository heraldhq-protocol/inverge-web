"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
  AlertCircleIcon,
  Coins01Icon,
  Idea01Icon,
  Refresh01Icon,
  UserMultiple02Icon,
} from "@/components/ui/hugeicons";
import { Container } from "@/features/marketing/components/container";
import { SectionBackground } from "@/features/marketing/components/section-background";
import {
  previewIdeas,
  type PreviewIdea,
} from "@/features/marketing/content/preview-ideas";

type IdeasStatus = "ready" | "loading" | "empty" | "error";

const isDevelopment = process.env.NODE_ENV !== "production";

function IdeaCard({ idea }: { idea: PreviewIdea }) {
  return (
    <article className="group relative flex min-w-[17rem] max-w-[20rem] snap-start flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-sm transition-shadow hover:shadow-md sm:min-w-0 sm:max-w-none">
      <div className="relative aspect-16/10 w-full overflow-hidden bg-border/20">
        <Image
          src={idea.image}
          alt={idea.title}
          fill
          sizes="(max-width: 640px) 272px, (max-width: 1024px) 50vw, 400px"
          className="object-cover"
        />
        {idea.promoted ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-contrast/90 px-2.5 py-1 text-[11px] font-semibold text-white">
            Promoted
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-strong">
          {idea.category}
        </p>
        <h3 className="mt-1.5 font-bold tracking-tight text-ink">
          {idea.title}
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted">
          {idea.pitch}
        </p>

        <div className="mt-2 border-t border-border/60 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 text-xs text-ink">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <UserMultiple02Icon
                size={16}
                className="text-muted"
                aria-hidden="true"
              />
              {idea.supporters} supporters
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono font-bold text-ink">
              <Coins01Icon
                size={16}
                className="text-muted"
                aria-hidden="true"
              />
              {idea.prePledgeTotal} pre-pledges
            </span>
          </div>
          <p className="mt-3 text-[10px] font-medium text-muted">
            No money moves at this stage.
          </p>
        </div>
      </div>
    </article>
  );
}

function IdeaCardSkeleton() {
  return (
    <div className="flex min-w-[17rem] max-w-[20rem] snap-start flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm sm:min-w-0 sm:max-w-none">
      <div className="aspect-16/10 w-full bg-border/50 motion-safe:animate-pulse" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/4 rounded bg-border/60" />
        <div className="h-5 w-3/4 rounded bg-border/80" />
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

export function IdeaCardsSection() {
  const [status, setStatus] = useState<IdeasStatus>("ready");

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
            <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted">
              Preview data
            </span>

            {isDevelopment ? (
              <div className="hidden items-center gap-1 rounded-full border border-border bg-surface p-1 text-xs font-medium text-muted md:flex">
                {(["ready", "loading", "empty", "error"] as const).map(
                  (state) => (
                    <button
                      key={state}
                      type="button"
                      onClick={() => setStatus(state)}
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

        {status === "ready" ? (
          <>
            <div
              aria-label="Preview ideas"
              data-reveal-stagger="0.08"
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 md:grid-cols-3 lg:grid-cols-4"
            >
              {previewIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
            <p className="mt-3 text-xs text-muted sm:hidden">
              Swipe to see more ideas.
            </p>
          </>
        ) : null}

        {status === "loading" ? (
          <div className="flex gap-5 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <IdeaCardSkeleton key={n} />
            ))}
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
                href="/sign-up"
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
                onClick={() => setStatus("ready")}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-5 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <Refresh01Icon size={16} aria-hidden="true" />
                Try again
              </button>
            </div>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
