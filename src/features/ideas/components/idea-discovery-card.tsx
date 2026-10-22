import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon, MapPinIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Pill } from "@/components/ui/pill";
import { IdeaCover } from "@/features/ideas/components/idea-cover";
import { ideaTaxonomyText } from "@/features/ideas/lib/filter-ideas";
import type { DiscoveryIdea } from "@/features/ideas/types";
import { formatCompactMoney } from "@/lib/money";

type Stage = "early" | "growing" | "near";

function stageFor(validationPercent: number): Stage {
  if (validationPercent >= 70) return "near";
  if (validationPercent >= 50) return "growing";
  return "early";
}

const stageCopy: Record<Stage, string> = {
  early: "Early signal",
  growing: "Growing support",
  near: "Near validation",
};

/**
 * The single status a card shows.
 *
 * Paid placement takes precedence because FR-206a requires it to be visible,
 * and promotion never sits inside the validation figures. Otherwise the label
 * describes observed progress toward the FR-204 threshold, not a lifecycle
 * state the card cannot verify.
 */
function CardStatus({ idea }: { idea: DiscoveryIdea }) {
  if (idea.promoted) {
    return (
      <Pill
        tone="promoted"
        size="xs"
        className="bg-surface/95 shadow-sm backdrop-blur"
        title="Paid placement affects visibility only, never validation metrics"
      >
        Promoted
      </Pill>
    );
  }

  const stage = stageFor(idea.validationPercent);

  return (
    <Pill
      tone={stage === "near" ? "accent" : "neutral"}
      size="xs"
      className="bg-surface/95 shadow-sm backdrop-blur"
    >
      {stageCopy[stage]}
    </Pill>
  );
}

function CreatorLine({ idea }: { idea: DiscoveryIdea }) {
  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-center gap-2">
        <Avatar name={idea.creator} size={32} />
        <span className="truncate text-sm font-medium text-ink">
          {idea.creator}
        </span>
      </div>
      <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted">
        <HugeiconsIcon
          icon={MapPinIcon}
          size={14}
          strokeWidth={1.8}
          aria-hidden="true"
          className="shrink-0"
        />
        <span className="truncate">{idea.location}</span>
      </p>
    </div>
  );
}

function CardMetrics({ idea }: { idea: DiscoveryIdea }) {
  return (
    <dl className="grid grid-cols-3 gap-2 border-t border-border pt-3">
      <div className="min-w-0">
        <dd className="truncate text-sm font-semibold tabular-nums text-ink">
          {idea.supporters.toLocaleString("en-US")}
        </dd>
        <dt className="mt-0.5 text-[0.6875rem] leading-4 text-muted">
          Supporters
        </dt>
      </div>
      <div className="min-w-0">
        <dd className="truncate text-sm font-semibold tabular-nums text-ink">
          {formatCompactMoney(idea.prePledged)}
        </dd>
        <dt className="mt-0.5 text-[0.6875rem] leading-4 text-muted">
          Est. interest
        </dt>
      </div>
      <div className="min-w-0">
        <dd className="truncate text-sm font-semibold tabular-nums text-ink">
          {idea.feedbackResponses.toLocaleString("en-US")}
        </dd>
        <dt className="mt-0.5 text-[0.6875rem] leading-4 text-muted">
          Feedback
        </dt>
      </div>
    </dl>
  );
}

export function IdeaDiscoveryCard({
  idea,
  variant = "grid",
  priority = false,
}: {
  idea: DiscoveryIdea;
  /** `featured` and `lead` are legacy aliases for the standard grid card. */
  variant?: "grid" | "list" | "featured" | "lead";
  priority?: boolean;
}) {
  const isList = variant === "list";
  const categoryText = ideaTaxonomyText(idea);

  return (
    <Link
      href={`/ideas/${idea.id}`}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg hover:shadow-ink/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:hover:translate-y-0 ${
        isList ? "sm:grid sm:grid-cols-[12rem_minmax(0,1fr)] sm:flex-row" : ""
      }`}
    >
      <div
        className={`relative shrink-0 overflow-hidden bg-surface-muted ${
          isList
            ? "aspect-[16/10] sm:aspect-auto sm:h-full sm:min-h-44"
            : "aspect-[16/10]"
        }`}
      >
        <IdeaCover
          artwork={idea.artwork}
          cover={idea.cover}
          alt={`${idea.title}, ${categoryText}`}
          priority={priority}
          sizes={
            isList
              ? "(min-width: 640px) 192px, 100vw"
              : "(min-width: 1280px) 360px, (min-width: 768px) 45vw, 100vw"
          }
          className="transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
        />
        <div className="absolute left-3 top-3">
          <CardStatus idea={idea} />
        </div>
        <span
          aria-hidden="true"
          className="absolute bottom-3 right-3 grid size-8 place-items-center rounded-full bg-surface/95 text-ink shadow-sm transition-colors group-hover:bg-brand group-hover:text-white"
        >
          <HugeiconsIcon
            icon={ArrowUpRight01Icon}
            size={14}
            strokeWidth={1.9}
          />
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <p className="truncate text-xs font-medium text-muted">
          {categoryText}
        </p>
        <h3 className="mt-1 line-clamp-2 text-lg font-bold leading-snug tracking-[-0.03em] text-ink">
          {idea.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-muted">
          {idea.description}
        </p>

        <div className="mt-4">
          <CreatorLine idea={idea} />
        </div>

        <div className="mt-auto pt-4">
          <CardMetrics idea={idea} />
        </div>
      </div>
    </Link>
  );
}
