import Link from "next/link";

import { StatePanel } from "@/components/ui/state-panel";
import { CreatorStudioTabs } from "@/features/ideas/components/creator-studio-tabs";

const actionClass =
  "inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export function CreatorStudioSignedOut({ next }: { next: string }) {
  return (
    <StatePanel
      variant="unavailable"
      eyebrow="Private workspace"
      title="Sign in to open Creator Studio"
      description="Creator Studio is private. Sign in to load the ideas you own and their analytics."
      action={
        <Link
          href={`/auth?next=${encodeURIComponent(next)}`}
          className={actionClass}
        >
          Sign in
        </Link>
      }
    />
  );
}

export function CreatorStudioUnavailable({
  description,
  retryHref,
}: {
  description: string;
  retryHref: string;
}) {
  return (
    <StatePanel
      variant="error"
      eyebrow="Creator Studio unavailable"
      title="We couldn't load your workspace"
      description={description}
      action={
        <Link href={retryHref} className={actionClass}>
          Try again
        </Link>
      }
    />
  );
}

/**
 * The shared frame for a creator page that could not load live data. It keeps
 * the studio heading and tabs so a signed-out or failed request does not look
 * like a different product.
 */
export function CreatorStudioStatePage({
  active,
  next,
  result,
  retryHref,
}: {
  active: "ideas" | "overview";
  next: string;
  result: { status: "signed_out" } | { status: "unavailable"; reason: string };
  retryHref: string;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
      <div>
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
          Workspace
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
          {active === "overview" ? "Creator Studio" : "My ideas"}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
          Build. Validate. Grow.
        </p>
      </div>

      <div className="mt-5">
        <CreatorStudioTabs active={active} />
      </div>

      <div className="mt-6">
        {result.status === "signed_out" ? (
          <CreatorStudioSignedOut next={next} />
        ) : (
          <CreatorStudioUnavailable
            description={result.reason}
            retryHref={retryHref}
          />
        )}
      </div>
    </div>
  );
}
