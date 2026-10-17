"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  MedalFirstPlaceIcon,
  MedalSecondPlaceIcon,
  MedalThirdPlaceIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useState } from "react";

import { Amount } from "@/components/ui/amount";
import { Avatar } from "@/components/ui/avatar";
import { Pill } from "@/components/ui/pill";
import { Select } from "@/components/ui/select";
import { IdeaCover } from "@/features/ideas/components/idea-cover";
import type { CompetitionCategoryBreakdown, StandingEntry } from "@/features/ideathon/types";
import { totalSupporters } from "@/features/ideathon/lib/standings";

const PAGE_SIZE = 10;

type SortKey = "official" | "supporters" | "newest";

const sortOptions = [
  { value: "official", label: "Official ranking" },
  { value: "supporters", label: "Most supporters" },
  { value: "newest", label: "Newest entries" },
] as const;

function sortFromValue(value: string): SortKey {
  return value === "supporters" || value === "newest" ? value : "official";
}

function formatUpdatedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(iso));
}

function RankMark({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center gap-1 font-bold tabular-nums text-amber-700">
        <HugeiconsIcon
          icon={MedalFirstPlaceIcon}
          size={18}
          strokeWidth={1.7}
          aria-hidden="true"
        />
        <span className="sr-only">Rank </span>1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center gap-1 font-bold tabular-nums text-slate-600">
        <HugeiconsIcon
          icon={MedalSecondPlaceIcon}
          size={18}
          strokeWidth={1.7}
          aria-hidden="true"
        />
        <span className="sr-only">Rank </span>2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center gap-1 font-bold tabular-nums text-orange-700">
        <HugeiconsIcon
          icon={MedalThirdPlaceIcon}
          size={18}
          strokeWidth={1.7}
          aria-hidden="true"
        />
        <span className="sr-only">Rank </span>3
      </span>
    );
  }

  return <span className="font-medium tabular-nums text-muted">{rank}</span>;
}

/**
 * Community standings.
 *
 * The default order is the official weighted-support ranking. The two other
 * orders are explicitly exploration orders: they never relabel a row's official
 * rank, and the column is always shown. Filtering by topic cannot change a
 * score, only which rows are visible.
 */
export function StandingsTable({
  categories,
  entries,
  updatedAt,
}: {
  categories: readonly CompetitionCategoryBreakdown[];
  entries: readonly StandingEntry[];
  updatedAt: string;
}) {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortKey>("official");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = entries.filter(
    (entry) =>
      category === "all" || entry.idea.discoveryCategory === category,
  );
  const ordered = (() => {
    if (sort === "supporters") {
      return filtered.toSorted(
        (left, right) =>
          totalSupporters(right.signals.supporters) -
            totalSupporters(left.signals.supporters) ||
          left.rank - right.rank,
      );
    }
    if (sort === "newest") {
      return filtered.toSorted(
        (left, right) =>
          right.idea.publishedOrder - left.idea.publishedOrder ||
          left.rank - right.rank,
      );
    }
    return filtered;
  })();
  const visible = ordered.slice(0, visibleCount);

  function chooseCategory(value: string) {
    setCategory(value);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <section aria-labelledby="community-standings">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2
            id="community-standings"
            className="text-xl font-bold tracking-[-0.03em] text-ink sm:text-2xl"
          >
            Community standings
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            Ranked by weighted support. Money never affects rank.{" "}
            <Link
              href="/ideathon/rules"
              className="font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              How ranking works
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="standings-sort" className="text-xs font-medium text-muted">
            Sort by
          </label>
          <div className="w-44">
            <Select
              id="standings-sort"
              aria-label="Sort standings"
              options={sortOptions}
              value={sort}
              onValueChange={(value) => {
                setSort(sortFromValue(value));
                setVisibleCount(PAGE_SIZE);
              }}
            />
          </div>
        </div>
      </div>

      <div
        role="group"
        aria-label="Filter standings by topic"
        className="-mx-5 mt-4 flex gap-1.5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0"
      >
        <button
          type="button"
          aria-pressed={category === "all"}
          onClick={() => chooseCategory("all")}
          className={`inline-flex min-h-9 shrink-0 items-center rounded-full border px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
            category === "all"
              ? "border-brand bg-brand text-white"
              : "border-border bg-surface text-ink-soft hover:border-brand/35 hover:text-ink"
          }`}
        >
          All ideas
          <span className="ml-1.5 tabular-nums opacity-70">
            {entries.length}
          </span>
        </button>
        {categories.map((item) => (
          <button
            key={item.categoryValue}
            type="button"
            aria-pressed={category === item.categoryValue}
            onClick={() => chooseCategory(item.categoryValue)}
            className={`inline-flex min-h-9 shrink-0 items-center rounded-full border px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              category === item.categoryValue
                ? "border-brand bg-brand text-white"
                : "border-border bg-surface text-ink-soft hover:border-brand/35 hover:text-ink"
            }`}
          >
            {item.category}
            <span className="ml-1.5 tabular-nums opacity-70">
              {item.count}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-3 text-[0.6875rem] text-muted">
        Updated {formatUpdatedAt(updatedAt)} UTC. Preview standings, not official
        results.
      </p>

      {visible.length > 0 ? (
        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface">
          <table className="w-full table-fixed border-collapse text-left">
            <caption className="sr-only">
              Community standings for the monthly ideathon, ranked by weighted
              support. Columns show rank, idea, creator, topic, supporters,
              estimated interest, and a link to the idea.
            </caption>
            <thead className="hidden border-b border-border bg-surface-muted/60 sm:table-header-group">
              <tr className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-muted">
                <th scope="col" className="w-14 px-3 py-2.5">
                  Rank
                </th>
                <th scope="col" className="px-3 py-2.5">
                  Ideas
                </th>
                <th scope="col" className="hidden w-40 px-3 py-2.5 lg:table-cell">
                  Creator
                </th>
                <th scope="col" className="hidden w-28 px-3 py-2.5 xl:table-cell">
                  Topic
                </th>
                <th scope="col" className="w-24 px-3 py-2.5 text-right">
                  Supporters
                </th>
                <th
                  scope="col"
                  className="hidden w-28 px-3 py-2.5 text-right md:table-cell"
                >
                  Est. interest
                </th>
                <th scope="col" className="w-16 px-3 py-2.5 text-right">
                  <span className="sr-only">View idea</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.map((entry) => (
                <tr
                  key={entry.idea.id}
                  className={entry.rank === 1 ? "bg-brand-tint/45" : undefined}
                >
                  <td className="px-3 py-3 align-middle">
                    <RankMark rank={entry.rank} />
                  </td>
                  <td className="min-w-0 px-3 py-3 align-middle">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="relative hidden h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-muted sm:block">
                        <IdeaCover
                          artwork={entry.idea.artwork}
                          cover={entry.idea.cover}
                          alt=""
                          sizes="56px"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">
                          {entry.idea.title}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-[0.6875rem] leading-4 text-muted">
                          {entry.idea.description}
                        </p>
                        <p className="mt-1 text-[0.6875rem] tabular-nums text-muted sm:hidden">
                          {totalSupporters(entry.signals.supporters).toLocaleString(
                            "en-US",
                          )}{" "}
                          supporters · <Amount value={entry.idea.prePledged} compact />
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-3 py-3 align-middle lg:table-cell">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar name={entry.idea.creator} size={32} />
                      <span className="truncate text-xs font-medium text-ink">
                        {entry.idea.creator}
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-3 py-3 align-middle xl:table-cell">
                    <Pill size="xs">{entry.idea.category}</Pill>
                  </td>
                  <td className="hidden px-3 py-3 text-right align-middle text-sm font-semibold tabular-nums text-ink sm:table-cell">
                    {totalSupporters(entry.signals.supporters).toLocaleString(
                      "en-US",
                    )}
                  </td>
                  <td className="hidden px-3 py-3 text-right align-middle text-sm font-semibold tabular-nums text-ink md:table-cell">
                    <Amount value={entry.idea.prePledged} compact />
                  </td>
                  <td className="px-3 py-3 text-right align-middle">
                    <Link
                      href={`/ideas/${entry.idea.id}`}
                      className="inline-flex min-h-9 items-center justify-center rounded-lg border border-border bg-surface px-2.5 text-xs font-semibold text-ink transition-colors hover:border-brand/35 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      View
                      <span className="sr-only"> {entry.idea.title}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-3 rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="text-sm font-semibold text-ink">No ideas in this topic</p>
          <p className="mt-1 text-xs text-muted">
            Choose another topic to see the entries.
          </p>
        </div>
      )}

      {ordered.length > visible.length ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-brand/35 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={15}
              strokeWidth={1.9}
              aria-hidden="true"
            />
            Load more ideas
          </button>
        </div>
      ) : null}
    </section>
  );
}
