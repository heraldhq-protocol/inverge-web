import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Calendar03Icon,
  Idea01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Pill } from "@/components/ui/pill";
import { previewNextCompetition } from "@/features/ideathon/content/preview-competition";

function formatOpenDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(iso));
}

/**
 * The next round, as a forward-looking banner. It is deliberately not a
 * "featured winner": no results exist, so presenting an entry here would invent
 * one.
 */
export function NextIdeathonBanner() {
  return (
    <section
      aria-labelledby="next-ideathon"
      className="relative isolate overflow-hidden rounded-2xl bg-contrast px-6 py-6 text-white sm:px-8 sm:py-7"
    >
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-20 -z-10 size-64 rounded-full border-[36px] border-brand/20"
      />
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <Pill tone="accent" size="xs" className="bg-brand/20 text-white">
            Next month
          </Pill>
          <h2
            id="next-ideathon"
            className="mt-2 text-xl font-bold tracking-[-0.03em] sm:text-2xl"
          >
            {previewNextCompetition.theme}
          </h2>
          <p className="mt-1.5 text-sm leading-6 text-white/70">
            {previewNextCompetition.summary}
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/60">
            <HugeiconsIcon
              icon={Calendar03Icon}
              size={14}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            Entries open {formatOpenDate(previewNextCompetition.opensAt)}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/ideathon/rules"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/25 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
          >
            Read the rules
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-contrast focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
          >
            <HugeiconsIcon
              icon={Idea01Icon}
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            Start an idea
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              size={15}
              strokeWidth={1.9}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
