import { MapPin } from "lucide-react";

import { IdeaArtwork } from "@/features/home/components/idea-artwork";
import { formatCompactNaira } from "@/features/home/lib/format-money";
import type { DiscoveryIdea } from "@/features/ideas/types";

function ValidationProgress({ value }: { value: number }) {
  return (
    <div>
      <p className="text-xs font-semibold tabular-nums text-ink">
        {value}% validated
      </p>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-label="Idea validation progress"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={value}
      >
        <span
          className="block h-full rounded-full bg-brand"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Creator({ idea }: { idea: DiscoveryIdea }) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-xs text-ink">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-contrast text-[0.625rem] font-bold text-white">
        {idea.creatorInitials}
      </span>
      <span className="truncate font-medium">{idea.creator}</span>
    </div>
  );
}

function Location({ location }: { location: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted">
      <MapPin
        className="size-3.5 shrink-0"
        strokeWidth={1.8}
        aria-hidden="true"
      />
      <span className="truncate">{location}</span>
    </span>
  );
}

function IdeaMetrics({ idea }: { idea: DiscoveryIdea }) {
  return (
    <dl className="grid grid-cols-2 divide-x divide-border border-t border-border">
      <div className="px-4 py-3 sm:px-5">
        <dt className="text-[0.6875rem] text-muted">Supporters</dt>
        <dd className="mt-0.5 whitespace-nowrap text-sm font-semibold tabular-nums text-ink">
          {idea.supporters.toLocaleString("en-NG")}
        </dd>
      </div>
      <div className="px-4 py-3 sm:px-5">
        <dt className="text-[0.6875rem] text-muted">Pre-pledged intent</dt>
        <dd className="mt-0.5 whitespace-nowrap text-sm font-semibold tabular-nums text-ink">
          {formatCompactNaira(idea.prePledged)}
        </dd>
      </div>
    </dl>
  );
}

function PromotedBadge() {
  return (
    <span
      className="rounded-full border border-warning/20 bg-amber-50 px-2.5 py-1 text-[0.6875rem] font-semibold text-warning-strong shadow-sm"
      title="Paid placement affects visibility only, never validation metrics"
    >
      Promoted
    </span>
  );
}

export function IdeaDiscoveryCard({
  idea,
  variant = "compact",
}: {
  idea: DiscoveryIdea;
  variant?: "compact" | "featured" | "lead";
}) {
  if (variant === "compact") {
    return (
      <article className="grid min-h-44 grid-cols-[7.5rem_minmax(0,1fr)] overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,box-shadow] hover:border-brand/25 hover:shadow-md sm:grid-cols-[8.75rem_minmax(0,1fr)]">
        <IdeaArtwork compact variant={idea.artwork} />
        <div className="flex min-w-0 flex-col p-4">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <p className="truncate text-[0.6875rem] font-semibold text-brand-strong">
              {idea.category}
            </p>
            {idea.promoted ? <PromotedBadge /> : null}
          </div>
          <h3 className="mt-1 line-clamp-2 text-base font-bold leading-tight tracking-[-0.025em] text-ink">
            {idea.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-4 text-muted">
            {idea.description}
          </p>
          <div className="mt-auto pt-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[0.6875rem] text-muted">
                {idea.supporters.toLocaleString("en-NG")} supporters
              </span>
              <Location location={idea.location} />
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="shrink-0 text-[0.6875rem] font-semibold tabular-nums text-ink">
                {idea.validationPercent}%
              </span>
              <div
                className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-border"
                role="progressbar"
                aria-label="Idea validation progress"
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={idea.validationPercent}
              >
                <span
                  className="block h-full rounded-full bg-brand"
                  style={{ width: `${idea.validationPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  const isLead = variant === "lead";

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,box-shadow] hover:border-brand/25 hover:shadow-md ${
        isLead
          ? "md:grid md:grid-cols-[minmax(0,1.08fr)_minmax(16rem,0.92fr)]"
          : "flex flex-col"
      }`}
    >
      <div className="relative min-h-0 md:row-span-2 md:[&>div]:h-full">
        <IdeaArtwork featured={isLead} variant={idea.artwork} />
        {idea.promoted ? (
          <div className="absolute right-3 top-3">
            <PromotedBadge />
          </div>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-brand-strong">
            {idea.category}
          </p>
          <Location location={idea.location} />
        </div>
        <h3
          className={`mt-1 font-bold tracking-[-0.035em] text-ink ${
            isLead ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
          }`}
        >
          {idea.title}
        </h3>
        <p className="mt-1.5 line-clamp-3 text-sm leading-5 text-muted">
          {idea.description}
        </p>

        <div className="mt-4">
          <Creator idea={idea} />
        </div>
        <div className="mt-4">
          <ValidationProgress value={idea.validationPercent} />
        </div>
      </div>
      <div className={isLead ? "md:col-start-2" : ""}>
        <IdeaMetrics idea={idea} />
      </div>
    </article>
  );
}
