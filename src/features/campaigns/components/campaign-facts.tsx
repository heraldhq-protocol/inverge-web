import { HugeiconsIcon } from "@hugeicons/react";
import { Note02Icon, BadgeCheckIcon } from "@hugeicons/core-free-icons";

import { CampaignDisclosures } from "@/features/campaigns/components/campaign-disclosures";
import { CampaignEscrowSection } from "@/features/campaigns/components/campaign-escrow-section";
import { RailCard } from "@/features/campaigns/components/campaign-rail-card";
import { CampaignUseOfFunds } from "@/features/campaigns/components/campaign-story";
import type { Campaign } from "@/features/campaigns/types";

/**
 * Campaign facts.
 *
 * Short, non-numeric claims a reader checks at a glance. Anything with a figure
 * (target, tranches, deadline) is rendered from the record elsewhere, so a fact
 * cannot drift from the data it describes.
 *
 * The creator row is rendered from the campaign's own `creator` record rather
 * than from the fact list, so the identity badge is the same one the hero shows
 * and cannot disagree with it. A "last updated" row is only rendered when the
 * record actually carries one: this build has no such field, and borrowing the
 * newest update's timestamp would state something the data does not say.
 */
export function CampaignFacts({
  campaign,
  variant = "rail",
}: {
  campaign: Campaign;
  /** `rail` is the supporting column beside the story; `page` is the facts tab. */
  variant?: "page" | "rail";
}) {
  if (campaign.facts.length === 0) return null;

  const rows = (
    <dl className="divide-y divide-border text-sm">
      {campaign.facts.map((fact) => (
        <div
          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2 first:pt-0 last:pb-0"
          key={fact.label}
        >
          <dt className="text-muted">{fact.label}</dt>
          <dd className="font-medium text-ink">{fact.value}</dd>
        </div>
      ))}

      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2 last:pb-0">
        <dt className="text-muted">Creator</dt>
        <dd className="flex items-center gap-1.5 font-medium text-ink">
          {campaign.creator.name}
          {campaign.creator.identityVerified ? (
            <HugeiconsIcon
              icon={BadgeCheckIcon}
              size={14}
              strokeWidth={2}
              aria-hidden="true"
            />
          ) : null}
        </dd>
      </div>
    </dl>
  );

  if (variant === "rail") {
    return (
      <RailCard icon={Note02Icon} id="facts" title="Campaign facts">
        {rows}
      </RailCard>
    );
  }

  return (
    <section
      aria-labelledby="facts-heading"
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <h2
        className="text-lg font-bold tracking-tight text-ink"
        id="facts-heading"
      >
        Campaign facts
      </h2>
      <div className="mt-3">{rows}</div>
    </section>
  );
}

/**
 * The Campaign facts tab.
 *
 * This is where the structured information lives: the facts a reader scans, the
 * published budget, the escrow rules, and the disclosures. Separating it from
 * the story is the point — a backer reading about the project should not have to
 * scroll past a metered objection window to get back to the narrative, and a
 * backer checking the rules should not have to scroll past the narrative.
 */
export function CampaignFactsTab({ campaign }: { campaign: Campaign }) {
  return (
    <div className="space-y-10">
      <CampaignFacts campaign={campaign} variant="page" />

      <section
        aria-labelledby="use-of-funds-heading"
        className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
      >
        <h2
          className="text-lg font-bold tracking-tight text-ink"
          id="use-of-funds-heading"
        >
          How your contribution is used
        </h2>
        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted">
          The creator&apos;s own published allocation of the funding target, and
          the proportion each line takes.
        </p>
        <div className="mt-4">
          <CampaignUseOfFunds campaign={campaign} />
        </div>
      </section>

      <section aria-labelledby="escrow-heading">
        <h2
          className="text-xl font-bold tracking-[-0.03em] text-ink sm:text-2xl"
          id="escrow-heading"
        >
          Escrow and release terms
        </h2>
        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted">
          The rules this campaign publishes, and where each tranche sits right
          now.
        </p>
        <div className="mt-5">
          <CampaignEscrowSection campaign={campaign} />
        </div>
      </section>

      <section aria-labelledby="disclosures-heading">
        <h2
          className="text-xl font-bold tracking-[-0.03em] text-ink sm:text-2xl"
          id="disclosures-heading"
        >
          Before you contribute
        </h2>
        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted">
          Who can contribute, what could go wrong, and what happens if the
          target is not reached.
        </p>
        <div className="mt-5">
          <CampaignDisclosures campaign={campaign} />
        </div>
      </section>
    </div>
  );
}
