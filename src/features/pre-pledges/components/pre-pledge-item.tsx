import Link from "next/link";

import { IdeaArtwork } from "@/features/home/components/idea-artwork";
import { formatNaira } from "@/features/home/lib/format-money";
import { PrePledgeStatusLabel } from "@/features/pre-pledges/components/pre-pledge-status";
import type { PrePledgeRecord } from "@/features/pre-pledges/types";

function Creator({ item }: { item: PrePledgeRecord }) {
  return (
    <div className="mt-2 flex min-w-0 items-center gap-2 text-xs text-muted">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-contrast text-[0.5625rem] font-bold text-white">
        {item.idea.creatorInitials}
      </span>
      <span className="truncate">{item.idea.creator}</span>
    </div>
  );
}

function ActivePrePledgeCard({ item }: { item: PrePledgeRecord }) {
  return (
    <li className="h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-md">
        <IdeaArtwork variant={item.idea.artwork} />

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <p className="text-xs font-semibold text-brand-strong">
            {item.idea.category}
          </p>
          <h3 className="mt-1 line-clamp-2 text-lg font-bold leading-tight tracking-[-0.025em] text-ink">
            {item.idea.title}
          </h3>
          <Creator item={item} />

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-ink">
                {item.idea.validationPercent}% validated
              </span>
              <span className="text-xs text-muted">Validation signal</span>
            </div>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-border"
              role="progressbar"
              aria-label={`${item.idea.title} validation progress`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={item.idea.validationPercent}
            >
              <span
                className="block h-full rounded-full bg-brand"
                style={{ width: `${item.idea.validationPercent}%` }}
              />
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 divide-x divide-border border-y border-border py-4">
            <div className="pr-4">
              <dt className="text-xs text-muted">Supporters</dt>
              <dd className="mt-1 font-mono text-lg font-semibold text-ink">
                {item.idea.supporters.toLocaleString("en-NG")}
              </dd>
            </div>
            <div className="pl-4">
              <dt className="text-xs text-muted">Your intent</dt>
              <dd className="mt-1 whitespace-nowrap text-lg font-semibold tabular-nums text-ink">
                {formatNaira(item.intent)}
              </dd>
            </div>
          </dl>

          <div className="mt-auto flex items-end justify-between gap-4 pt-4">
            <div className="min-w-0">
              <PrePledgeStatusLabel status={item.status} />
              <p className="mt-1 text-xs text-muted">
                Updated {item.updatedLabel}
              </p>
            </div>
            <Link
              href="/ideas"
              aria-label={`Edit pre-pledge intent for ${item.idea.title}`}
              className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-1 text-sm font-semibold text-brand-strong transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Edit intent
            </Link>
          </div>
        </div>
      </article>
    </li>
  );
}

function PastPrePledgeCard({ item }: { item: PrePledgeRecord }) {
  return (
    <li>
      <article className="grid min-h-44 grid-cols-[7.5rem_minmax(0,1fr)] overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-md sm:grid-cols-[9rem_minmax(0,1fr)]">
        <IdeaArtwork compact variant={item.idea.artwork} />
        <div className="flex min-w-0 flex-col p-4">
          <p className="text-xs font-semibold text-brand-strong">
            {item.idea.category}
          </p>
          <h3 className="mt-1 line-clamp-2 text-base font-bold leading-tight tracking-[-0.02em] text-ink">
            {item.idea.title}
          </h3>
          <Creator item={item} />

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-muted">Previous intent</p>
              <p className="mt-1 whitespace-nowrap text-sm font-semibold tabular-nums text-ink">
                {formatNaira(item.intent)}
              </p>
            </div>
            <div>
              <p className="text-muted">Updated</p>
              <p className="mt-1 text-sm font-medium text-ink">
                {item.updatedLabel}
              </p>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-4">
            <PrePledgeStatusLabel status={item.status} />
            <Link
              href="/ideas"
              aria-label={`View ${item.idea.title}`}
              className="inline-flex min-h-10 items-center text-sm font-semibold text-brand-strong transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              View idea
            </Link>
          </div>
        </div>
      </article>
    </li>
  );
}

export function PrePledgeItem({ item }: { item: PrePledgeRecord }) {
  return item.stage === "active" ? (
    <ActivePrePledgeCard item={item} />
  ) : (
    <PastPrePledgeCard item={item} />
  );
}
