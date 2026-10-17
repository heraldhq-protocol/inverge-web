import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Analytics01Icon,
  ArrowUpRight01Icon,
  Idea01Icon,
  MessageMultiple01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Pill } from "@/components/ui/pill";
import { IdeaCover } from "@/features/ideas/components/idea-cover";
import {
  ideaStatusLabel,
  ideaVisibilityLabel,
  type CreatorIdeaRow,
} from "@/features/ideas/lib/creator-rows";
import { formatCompactMoney } from "@/lib/money";

function statusTone(
  status: CreatorIdeaRow["status"],
): "accent" | "neutral" | "warning" {
  if (status === "threshold-met") return "accent";
  if (status === "draft") return "neutral";
  if (status === "archived") return "neutral";
  return "warning";
}

function updatedLabel(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function IdeaTitle({ row }: { row: CreatorIdeaRow }) {
  if (!row.detailHref) {
    return <span className="text-base font-bold text-ink">{row.title}</span>;
  }

  return (
    <Link
      href={row.detailHref}
      className="text-base font-bold text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {row.title}
    </Link>
  );
}

function RowActions({ row }: { row: CreatorIdeaRow }) {
  const links: { href: string; icon: IconSvgElement; label: string }[] = [];

  if (row.detailHref) {
    links.push({
      href: row.detailHref,
      icon: ArrowUpRight01Icon,
      label: "View idea",
    });
  }
  if (row.feedbackHref) {
    links.push({
      href: row.feedbackHref,
      icon: MessageMultiple01Icon,
      label: "Feedback",
    });
  }
  if (row.analyticsHref) {
    links.push({
      href: row.analyticsHref,
      icon: Analytics01Icon,
      label: "Analytics",
    });
  }

  if (links.length === 0) {
    return (
      <p className="text-xs leading-5 text-muted">
        This draft has no public page yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-1.5">
      {links.map(({ href, icon, label }) => (
        <li key={href}>
          <Link
            href={href}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <HugeiconsIcon
              icon={icon}
              size={14}
              strokeWidth={1.8}
              aria-hidden="true"
              className="text-muted"
            />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function CreatorIdeaCard({ row }: { row: CreatorIdeaRow }) {
  const updated = updatedLabel(row.updatedAt);

  return (
    <li className="rounded-2xl border border-border bg-surface p-3 transition-colors hover:border-brand/25 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-surface-muted sm:aspect-square sm:w-24">
          <IdeaCover
            artwork={row.artwork}
            cover={row.cover}
            alt=""
            sizes="(min-width: 640px) 96px, 100vw"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={statusTone(row.status)} size="xs">
              {ideaStatusLabel[row.status]}
            </Pill>
            <span className="text-xs text-muted">
              {ideaVisibilityLabel(row)}
            </span>
          </div>

          <div className="mt-1.5">
            <IdeaTitle row={row} />
          </div>
          <p className="mt-0.5 text-xs text-muted">
            {row.category}
            {updated ? ` · Updated ${updated}` : ""}
          </p>

          <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-2.5">
            <div className="min-w-0">
              <dd className="truncate text-sm font-semibold tabular-nums text-ink">
                {row.supporters.toLocaleString("en-US")}
              </dd>
              <dt className="mt-0.5 text-[0.6875rem] leading-4 text-muted">
                Supporters
              </dt>
            </div>
            <div className="min-w-0">
              <dd className="truncate text-sm font-semibold tabular-nums text-ink">
                {row.feedbackResponses.toLocaleString("en-US")}
              </dd>
              <dt className="mt-0.5 text-[0.6875rem] leading-4 text-muted">
                Feedback
              </dt>
            </div>
            <div className="min-w-0">
              <dd className="truncate text-sm font-semibold tabular-nums text-ink">
                {formatCompactMoney(row.prePledged)}
              </dd>
              <dt className="mt-0.5 text-[0.6875rem] leading-4 text-muted">
                Intent
              </dt>
            </div>
          </dl>
        </div>

        <div className="sm:self-center">
          <RowActions row={row} />
        </div>
      </div>
    </li>
  );
}

export function CreatorIdeaList({
  rows,
  emptyAction,
}: {
  rows: readonly CreatorIdeaRow[];
  emptyAction: React.ReactNode;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border-strong bg-surface px-5 py-10 text-center">
        <span className="mx-auto grid size-11 place-items-center rounded-full bg-brand-soft text-brand-strong">
          <HugeiconsIcon
            icon={Idea01Icon}
            size={20}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
        <p className="mt-3 text-base font-bold text-ink">No ideas yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted">
          Publish an idea to start collecting support and structured feedback.
          Funding stays optional.
        </p>
        <div className="mt-4 flex justify-center">{emptyAction}</div>
      </div>
    );
  }

  return (
    <ul className="grid gap-3">
      {rows.map((row) => (
        <CreatorIdeaCard key={row.id} row={row} />
      ))}
    </ul>
  );
}
