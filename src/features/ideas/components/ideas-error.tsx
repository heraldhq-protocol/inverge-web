"use client";

import { StatePanel } from "@/components/ui/state-panel";

export function IdeasError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8 xl:px-10">
      <StatePanel
        variant="error"
        eyebrow="Ideas unavailable"
        title="We couldn't load the catalogue"
        description="Your filters are safe. Try loading the ideas again."
        action={
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Try again
          </button>
        }
      />
    </div>
  );
}
