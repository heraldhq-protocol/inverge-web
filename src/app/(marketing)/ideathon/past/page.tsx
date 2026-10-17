import type { Metadata } from "next";
import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Archive02Icon,
} from "@hugeicons/core-free-icons";

import { StatePanel } from "@/components/ui/state-panel";

export const metadata: Metadata = {
  title: "Past ideathons | Inverge",
  description:
    "The archive of completed Inverge monthly ideathons and their published results.",
};

export default function PastIdeathonsPage() {
  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
        Past ideathons
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Published results from completed rounds. Nothing is archived until a
        round has closed and its standings are frozen.
      </p>

      <div className="mt-6">
        <StatePanel
          variant="empty"
          eyebrow="Archive"
          title="No completed rounds yet"
          description="The first round is still open. Once it closes, its frozen standings and results will appear here rather than being rewritten after the fact."
          action={
            <Link
              href="/ideathon"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              View current standings
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={16}
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </Link>
          }
        />
      </div>

      <section
        aria-labelledby="archive-policy"
        className="mt-7 rounded-2xl border border-border bg-surface p-5"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-strong">
            <HugeiconsIcon
              icon={Archive02Icon}
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>
          <div>
            <h3
              id="archive-policy"
              className="text-sm font-bold text-ink"
            >
              How the archive will work
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-muted">
              A closed round keeps the standings it closed with. Later support
              on the same ideas does not change that result, and a correction is
              published as a note beside the frozen order.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
