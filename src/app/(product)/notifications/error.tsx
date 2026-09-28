"use client";

import { RotateCcw } from "lucide-react";

import { StatePanel } from "@/components/ui/state-panel";

export default function NotificationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const reference = error.digest
    ? ` Reference ${error.digest.slice(0, 6).toUpperCase()}.`
    : "";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <StatePanel
        variant="error"
        eyebrow="Notifications unavailable"
        title="We couldn't load your updates"
        description={`Nothing was marked as read. Try loading this screen again.${reference}`}
        action={
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Try again
          </button>
        }
      />
    </div>
  );
}
