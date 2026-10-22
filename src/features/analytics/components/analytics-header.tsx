import { HugeiconsIcon } from "@hugeicons/react";
import {
  Comment01Icon,
  Coins01Icon,
  LinkSquare02Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Amount } from "@/components/ui/amount";
import { Avatar } from "@/components/ui/avatar";
import { Pill } from "@/components/ui/pill";
import { StatusBadge } from "@/components/ui/status-badge";
import { IdeaCover } from "@/features/ideas/components/idea-cover";
import type { IdeaDetail } from "@/features/ideas/types";
import { formatSeriesDate } from "@/features/analytics/lib/analytics";

function SnapshotItem({
  icon,
  label,
  value,
}: {
  icon: typeof Coins01Icon;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand-strong">
        <HugeiconsIcon
          icon={icon}
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </span>
      <p className="mt-2 truncate text-base font-bold tabular-nums text-ink">
        {value}
      </p>
      <p className="mt-0.5 text-[0.6875rem] leading-4 text-muted">{label}</p>
    </div>
  );
}

/**
 * The analytics workspace header: where the creator is, which idea is being
 * measured, and the three public validation signals the page is built from.
 * The snapshot deliberately matches the public idea page so a creator never has
 * to reconcile two versions of the same number.
 */
export function AnalyticsHeader({ idea }: { idea: IdeaDetail }) {
  const published = idea.visibility === "public";

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link
              href="/d"
              className="rounded font-medium hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Dashboard
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/d/creator/ideas"
              className="rounded font-medium hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              My ideas
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="max-w-56 truncate text-ink-soft">{idea.title}</li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">Analytics</li>
        </ol>
      </nav>

      <section
        aria-labelledby="analytics-idea-title"
        className="mt-4 rounded-2xl border border-border bg-surface p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge variant={published ? "success" : "neutral"}>
              {published ? "Published" : "Unlisted"}
            </StatusBadge>
            <span className="text-[0.6875rem] text-muted">
              Published {formatSeriesDate(idea.publishedAt, true)}
            </span>
            <span
              className="rounded-full bg-warning/10 px-2 py-0.5 text-[0.625rem] font-semibold text-warning-strong"
              title="This workspace reads preview data until the analytics API is connected"
            >
              Preview data
            </span>
          </div>
          <Link
            href={`/ideas/${idea.id}`}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:border-brand/35 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            View idea page
            <HugeiconsIcon
              icon={LinkSquare02Icon}
              size={14}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </Link>
          <Link
            href={`/d/creator/ideas/${idea.id}/feedback`}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-brand-strong transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Feedback settings
          </Link>
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-7">
          <div className="flex min-w-0 gap-4">
            <div className="relative hidden h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-surface-muted sm:block">
              <IdeaCover
                artwork={idea.artwork}
                cover={idea.cover}
                alt={`${idea.title} cover`}
                sizes="128px"
              />
            </div>
            <div className="min-w-0">
              <Pill size="xs">{idea.category}</Pill>
              <h1
                id="analytics-idea-title"
                className="mt-1.5 text-balance text-xl font-bold leading-snug tracking-[-0.035em] text-ink sm:text-2xl"
              >
                {idea.title}
              </h1>
              <p className="mt-1 line-clamp-2 max-w-xl text-sm leading-6 text-muted">
                {idea.description}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <Avatar name={idea.creator} size={20} />
                  <span className="font-medium text-ink-soft">
                    {idea.creator}
                  </span>
                </span>
                <span className="text-muted">{idea.location}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-canvas p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted">
                Validation snapshot
              </p>
              <Link
                href="/ideathon/rules"
                className="rounded text-[0.6875rem] font-medium text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
              >
                What counts
              </Link>
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-3">
              <SnapshotItem
                icon={UserMultiple02Icon}
                label="Supporters"
                value={idea.supporters.toLocaleString("en-US")}
              />
              <SnapshotItem
                icon={Coins01Icon}
                label="Est. interest"
                value={<Amount value={idea.prePledged} compact />}
              />
              <SnapshotItem
                icon={Comment01Icon}
                label="Feedback"
                value={idea.feedbackResponses.toLocaleString("en-US")}
              />
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
