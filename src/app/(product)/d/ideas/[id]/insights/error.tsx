"use client";

import { Container } from "@/components/ui/container";
import { StatePanel } from "@/components/ui/state-panel";

export default function AnalyticsError({ reset }: { reset: () => void }) {
  return (
    <Container className="py-8">
      <StatePanel
        variant="error"
        eyebrow="Analytics unavailable"
        title="We couldn't load this workspace"
        description="Your idea data is safe. Try loading the analytics again."
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
    </Container>
  );
}
