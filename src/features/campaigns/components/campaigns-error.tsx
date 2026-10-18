"use client";

import { Container } from "@/components/ui/container";
import { StatePanel } from "@/components/ui/state-panel";

export function CampaignsError({ reset }: { reset: () => void }) {
  return (
    <Container className="py-10">
      <StatePanel
        variant="error"
        eyebrow="Campaigns unavailable"
        title="We couldn't load the campaigns"
        description="Your filters are safe. Try loading the campaigns again."
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
