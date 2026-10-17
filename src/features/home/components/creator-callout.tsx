import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import type { CreatorSnapshot } from "@/features/home/types";

/**
 * The creator callout.
 *
 * Two honest variants: a viewer with no ideas is invited to start one, and a
 * creator is sent back to work with a count they can verify. Numbers come from
 * the fixture's own ideas, and the block never promises funding.
 */
export function CreatorCallout({
  mode,
  snapshot,
}: {
  mode: "start" | "continue";
  snapshot: CreatorSnapshot;
}) {
  const isContinuing = mode === "continue";
  const pending = snapshot.draftCount;

  return (
    <section
      aria-labelledby="creator-callout-heading"
      className="relative isolate overflow-hidden rounded-3xl bg-contrast px-5 py-6 text-white sm:px-7 sm:py-7"
    >
      <p className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-brand">
        {isContinuing ? "Creator Studio" : "For creators"}
      </p>
      <h2
        id="creator-callout-heading"
        className="mt-2 max-w-md text-balance text-xl font-bold leading-tight tracking-[-0.03em] sm:text-2xl"
      >
        {isContinuing
          ? "Keep building what you started."
          : "Turn your idea into real impact."}
      </h2>
      <p className="mt-1.5 max-w-md text-sm leading-6 text-white/72">
        {isContinuing
          ? pending > 0
            ? `${snapshot.ownedIdeaCount} ideas are in your workspace, ${pending} still in draft. Review feedback, publish when ready, and track how support grows.`
            : `${snapshot.ownedIdeaCount} ideas are in your workspace. Review feedback and track how support grows — no funding is implied at this stage.`
          : "Get feedback, build your community, and explore the next steps. Publishing an idea does not open a raise."}
      </p>

      <Link
        href={isContinuing ? "/d/creator" : "/d/creator/ideas/new"}
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-contrast transition-colors hover:bg-brand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
      >
        {isContinuing ? "Open Creator Studio" : "Start an idea"}
        <HugeiconsIcon
          icon={ArrowRight02Icon}
          size={16}
          strokeWidth={2}
          aria-hidden="true"
        />
      </Link>
    </section>
  );
}
