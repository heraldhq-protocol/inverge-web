import Link from "next/link";

import { StatePanel } from "@/components/ui/state-panel";

const actionClass =
  "inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export function AnalyticsSignedOut({ next }: { next: string }) {
  return (
    <StatePanel
      variant="unavailable"
      eyebrow="Private analytics"
      title="Sign in to see this workspace"
      description="Creator analytics are private. Sign in to load the reports for ideas you own."
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

export function AnalyticsServiceUnavailable({
  description,
  retryHref = "/d/creator/analytics",
}: {
  description: string;
  retryHref?: string;
}) {
  return (
    <StatePanel
      variant="error"
      eyebrow="Analytics unavailable"
      title="We couldn't load this workspace"
      description={description}
      action={
        <Link href={retryHref} className={actionClass}>
          Try again
        </Link>
      }
    />
  );
}
