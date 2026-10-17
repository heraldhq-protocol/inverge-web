"use client";

import { Container } from "@/components/ui/container";
import { StatePanel } from "@/components/ui/state-panel";

export default function IdeaDetailError({ reset }: { reset: () => void }) {
  return (
    <Container className="py-10">
      <StatePanel
        variant="error"
        eyebrow="Idea unavailable"
        title="We couldn't load this idea"
        description="Try loading the idea again, or head back to discovery."
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
