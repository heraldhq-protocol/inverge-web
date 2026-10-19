import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Award01Icon,
  HeartHandshakeIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Amount } from "@/components/ui/amount";
import { MediaImage } from "@/features/campaigns/components/media-image";
import { RailCard } from "@/features/campaigns/components/campaign-rail-card";
import { RewardFulfilmentLine } from "@/features/campaigns/components/reward-fulfilment-line";
import { acceptsContributions } from "@/features/campaigns/lib/status";
import type { Campaign, SupportTier } from "@/features/campaigns/types";

/**
 * Optional rewards, as a catalogue.
 *
 * A tier changes what the creator promises to send; it never changes what is
 * charged, and no contribution is ever refused for being below a tier's minimum
 * (the tier is simply not selected). "Select reward" opens the contribution flow
 * with that tier chosen — it reserves nothing and charges nothing, and the flow
 * says so before a backer enters an amount.
 *
 * Rewards are kept well away from the milestone plan: a reward says what a
 * backer may receive, a milestone says what the creator must deliver and how the
 * money is released. Merging the two would make a project update look like a
 * delivery of a reward.
 *
 * A campaign with no tiers is donation-based, and the tab says so rather than
 * showing an empty catalogue or pressuring a creator to invent perks.
 */

const DONATION_NOTE =
  "This campaign is donation-based. A contribution is a contribution to the work, not a purchase: there is no reward tier to select, and the creator's obligation is the published milestone plan.";

const SHIPPING_NOTE =
  "Shipping destinations and terms are declared by the creator. Inverge quotes no postage, and this build collects no delivery address.";

function RewardCard({
  accepting,
  campaign,
  tier,
}: {
  accepting: boolean;
  campaign: Campaign;
  tier: SupportTier;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="relative aspect-[16/9] w-full bg-brand/[0.06]">
        {tier.image ? (
          <MediaImage
            alt={`${tier.title} reward`}
            className="object-cover"
            sizes="(min-width: 768px) 18rem, 100vw"
            src={tier.image}
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-brand-strong/55">
            <HugeiconsIcon
              icon={Award01Icon}
              size={32}
              strokeWidth={1.4}
              aria-hidden="true"
            />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-base font-bold tracking-[-0.02em] text-ink">
            {tier.title}
          </h3>
          <span className="shrink-0 text-lg font-bold text-ink">
            <Amount value={tier.minimum} />
          </span>
        </div>

        <p className="mt-2 flex-1 text-sm leading-6 text-muted">
          {tier.description}
        </p>

        <RewardFulfilmentLine className="mt-3" tier={tier} />

        {accepting ? (
          <Link
            aria-label={`Select the ${tier.title} reward when backing ${campaign.title}`}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-brand/40 bg-surface px-4 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            href={`/campaigns/${campaign.slug}/back?tier=${encodeURIComponent(tier.id)}`}
          >
            Select reward
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={15}
              strokeWidth={1.9}
              aria-hidden="true"
            />
          </Link>
        ) : (
          <p className="mt-4 rounded-xl border border-border bg-canvas px-3 py-2 text-xs leading-5 text-muted">
            This campaign is not accepting contributions right now, so no reward
            can be selected.
          </p>
        )}
      </div>
    </article>
  );
}

/**
 * The rail layout of one reward: a thumbnail, the title and amount on one line,
 * the creator's own description, then the fulfilment facts and the action. It is
 * deliberately narrow, so the description is never truncated - a backer reading
 * the rail is deciding, and a clipped promise is not a promise.
 */
function RewardRailItem({
  accepting,
  campaign,
  tier,
}: {
  accepting: boolean;
  campaign: Campaign;
  tier: SupportTier;
}) {
  return (
    <li className="rounded-xl border border-border bg-canvas p-2.5">
      <div className="flex gap-2.5">
        <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-brand/[0.08]">
          {tier.image ? (
            <MediaImage
              alt={`${tier.title} reward`}
              className="object-cover"
              sizes="56px"
              src={tier.image}
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-brand-strong/55">
              <HugeiconsIcon
                icon={Award01Icon}
                size={20}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </span>
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="min-w-0 text-sm font-bold tracking-[-0.015em] text-ink">
              {tier.title}
            </h3>
            <span className="shrink-0 text-sm font-bold text-ink">
              <Amount value={tier.minimum} />
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted">
            {tier.description}
          </p>
        </div>
      </div>

      <RewardFulfilmentLine className="mt-2 pl-[4.125rem]" tier={tier} />

      {accepting ? (
        <Link
          aria-label={`Select the ${tier.title} reward when backing ${campaign.title}`}
          className="mt-2.5 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-brand/40 bg-surface px-3 text-xs font-semibold text-brand-strong transition-colors hover:bg-brand/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          href={`/campaigns/${campaign.slug}/back?tier=${encodeURIComponent(tier.id)}`}
        >
          Select reward
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={14}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </Link>
      ) : (
        <p className="mt-2.5 text-xs leading-5 text-muted">
          Not accepting contributions right now, so no reward can be selected.
        </p>
      )}
    </li>
  );
}

/** The way out of the catalogue for someone who does not want a reward. */
function SupportWithoutReward({
  campaign,
  className = "",
}: {
  campaign: Campaign;
  className?: string;
}) {
  return (
    <Link
      className={`flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3.5 py-3 transition-colors hover:border-brand/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${className}`}
      href={`/campaigns/${campaign.slug}/back`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink">
          Support without a reward
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-muted">
          Contribute any amount and skip the reward.
        </span>
      </span>
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        size={16}
        strokeWidth={1.9}
        aria-hidden="true"
        className="shrink-0 text-brand-strong"
      />
    </Link>
  );
}

export function CampaignSupportTiers({
  campaign,
  variant = "catalogue",
}: {
  campaign: Campaign;
  /** `rail` is the supporting column beside the story; `catalogue` is the tab. */
  variant?: "catalogue" | "rail";
}) {
  const accepting = acceptsContributions(campaign.phase);
  const hasTiers = campaign.supportTiers.length > 0;
  const ships = campaign.supportTiers.some((tier) => tier.shipping !== null);

  if (variant === "rail") {
    return (
      <RailCard
        icon={hasTiers ? Award01Icon : HeartHandshakeIcon}
        id="rewards"
        title={hasTiers ? "Optional rewards" : "Donation-based"}
      >
        <p className="text-xs leading-5 text-muted">
          {hasTiers
            ? "Acknowledgements or project-related items. Optional: a contribution is valid at any amount with or without one."
            : "Contributions fund the work itself. There is no reward to select; the obligation is the published milestone plan."}
        </p>

        {hasTiers ? (
          <ul className="mt-3 space-y-2.5">
            {campaign.supportTiers.map((tier) => (
              <RewardRailItem
                accepting={accepting}
                campaign={campaign}
                key={tier.id}
                tier={tier}
              />
            ))}
          </ul>
        ) : null}

        {accepting ? (
          hasTiers ? (
            <SupportWithoutReward campaign={campaign} className="mt-2.5" />
          ) : (
            <Link
              className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-brand px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              href={`/campaigns/${campaign.slug}/back`}
            >
              Back this campaign
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={14}
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </Link>
          )
        ) : null}

        <p className="mt-2.5 text-xs leading-5 text-muted">
          Selecting a reward opens the contribution preview. This build has no
          wallet and no payment provider, so nothing is reserved and nothing is
          charged.
        </p>
      </RailCard>
    );
  }

  return (
    <section aria-labelledby="rewards-heading">
      <div className="flex items-center gap-1.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand-strong">
          <HugeiconsIcon
            icon={hasTiers ? Award01Icon : HeartHandshakeIcon}
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
        <h2
          className="text-xl font-bold tracking-[-0.03em] text-ink sm:text-2xl"
          id="rewards-heading"
        >
          {hasTiers ? "Optional rewards" : "Donation-based"}
        </h2>
      </div>

      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
        {hasTiers ? (
          <>
            Rewards are acknowledgements or project-related items. They do not
            change the All-or-Nothing funding model, and a contribution is valid
            at any amount with or without one.
          </>
        ) : (
          DONATION_NOTE
        )}
      </p>

      {hasTiers ? (
        <>
          <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {campaign.supportTiers.map((tier) => (
              <li key={tier.id} className="flex">
                <RewardCard
                  accepting={accepting}
                  campaign={campaign}
                  tier={tier}
                />
              </li>
            ))}
          </ul>

          {accepting ? (
            <SupportWithoutReward
              campaign={campaign}
              className="mt-4 px-4 py-3.5"
            />
          ) : null}
        </>
      ) : accepting ? (
        <Link
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          href={`/campaigns/${campaign.slug}/back`}
        >
          Back this campaign
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={16}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </Link>
      ) : null}

      <p className="mt-4 flex items-start gap-1.5 text-xs leading-5 text-muted">
        <HugeiconsIcon
          icon={InformationCircleIcon}
          size={13}
          strokeWidth={1.9}
          aria-hidden="true"
          className="mt-0.5 shrink-0"
        />
        <span>
          {hasTiers
            ? `Selecting a reward opens the contribution preview. This build has no wallet and no payment provider, so nothing is reserved and nothing is charged.${ships ? ` ${SHIPPING_NOTE}` : ""}`
            : "Contributions run through the same preview flow: amount, payment route, and terms, stopping before money moves."}
        </span>
      </p>
    </section>
  );
}
