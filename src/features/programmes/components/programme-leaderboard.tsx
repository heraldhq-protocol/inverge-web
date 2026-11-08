"use client";

import { useId, useMemo, useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

import type {
  ProgrammeStanding,
  PublicProgramme,
  PublicProgrammeEntry,
} from "@/features/programmes/api/types";
import { formatDateTime } from "@/features/programmes/lib/public-programme";

const PAGE_SIZE = 10;

function score(value: number | null): string {
  return value === null ? "-" : value.toFixed(2);
}

function rankLabel(rank: number | null): string {
  return rank === null ? "Not ranked" : String(rank).padStart(2, "0");
}

function methodColumns(method: PublicProgramme["judging"]["method"]): {
  official: boolean;
  judge: boolean;
  community: boolean;
} {
  if (method === "COMMUNITY") {
    return { official: true, judge: false, community: true };
  }
  if (method === "JUDGES") {
    return { official: true, judge: true, community: false };
  }
  if (method === "HYBRID") {
    return { official: true, judge: true, community: true };
  }
  return { official: true, judge: false, community: false };
}

/**
 * The official standings.
 *
 * This component does not score anything. It renders the order the API
 * published, including ties, unranked entries and their reasons. Filtering and
 * paging are presentation-only, so the rank beside an entry is always the rank
 * the server computed.
 */
export function ProgrammeLeaderboard({
  entries,
  programme,
  standings,
}: {
  entries: PublicProgrammeEntry[];
  programme: PublicProgramme;
  standings: ProgrammeStanding[];
}) {
  const searchId = useId();
  const categoryId = useId();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(0);

  const categoryByEntry = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of entries) map.set(entry.id, entry.category);
    return map;
  }, [entries]);

  const categories = useMemo(() => {
    const values = new Set<string>();
    for (const entry of entries) {
      if (entry.category.trim()) values.add(entry.category);
    }
    return [...values].sort((left, right) => left.localeCompare(right));
  }, [entries]);

  const ranked = useMemo(
    () =>
      standings.filter(
        (standing) => standing.rank !== null && !standing.disqualified,
      ),
    [standings],
  );
  const unranked = useMemo(
    () =>
      standings.filter(
        (standing) => standing.rank === null || standing.disqualified,
      ),
    [standings],
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    return ranked.filter((standing) => {
      if (
        needle &&
        !standing.title.toLocaleLowerCase().includes(needle) &&
        !(categoryByEntry.get(standing.entryId) ?? "")
          .toLocaleLowerCase()
          .includes(needle)
      ) {
        return false;
      }
      if (
        category !== "all" &&
        categoryByEntry.get(standing.entryId) !== category
      ) {
        return false;
      }
      return true;
    });
  }, [category, categoryByEntry, ranked, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  const columns = methodColumns(programme.judging.method);

  if (ranked.length === 0) {
    return (
      <div className="border-t border-border py-8">
        <p className="text-sm font-semibold text-ink">
          No eligible entries were ranked.
        </p>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
          {unranked.length > 0
            ? `${unranked.length} ${
                unranked.length === 1 ? "entry was" : "entries were"
              } excluded by the published rules. The reasons are listed below.`
            : "The published results contain no ranked entries."}
        </p>
        {unranked.length > 0 ? <UnrankedList standings={unranked} /> : null}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 border-y border-border py-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid w-full gap-3 sm:max-w-2xl sm:grid-cols-[minmax(0,1fr)_11rem]">
          <div>
            <label
              htmlFor={searchId}
              className="mb-1.5 block text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-muted"
            >
              Search entries
            </label>
            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                size={16}
                strokeWidth={1.9}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id={searchId}
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
                placeholder="Title or category"
                className="min-h-11 w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={categoryId}
              className="mb-1.5 block text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-muted"
            >
              Category
            </label>
            <select
              id={categoryId}
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(0);
              }}
              className="min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <option value="all">All categories</option>
              {categories.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs tabular-nums text-muted" aria-live="polite">
          {filtered.length} of {ranked.length} ranked
        </p>
      </div>

      <div className="hidden items-center gap-3 border-b border-border py-2.5 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-muted sm:flex">
        <span className="w-9 shrink-0">Rank</span>
        <span className="min-w-0 flex-1">Entry</span>
        {columns.judge ? <span className="w-20 text-right">Judge</span> : null}
        {columns.community ? (
          <span className="w-24 text-right">Community</span>
        ) : null}
        <span className="w-20 text-right">Official</span>
      </div>

      {visible.length === 0 ? (
        <div className="border-b border-border py-10 text-center">
          <p className="text-sm font-semibold text-ink">
            No entries match this search.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("all");
              setPage(0);
            }}
            className="mt-2 min-h-11 text-sm font-semibold text-brand-strong underline decoration-brand/30 underline-offset-4 hover:decoration-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ol aria-label="Official leaderboard">
          {visible.map((standing) => {
            const entry = entries.find((item) => item.id === standing.entryId);
            const entryCategory =
              categoryByEntry.get(standing.entryId) ?? "Uncategorised";
            return (
              <li
                key={standing.entryId}
                className="border-b border-border first:border-t-0"
              >
                <article className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-start gap-3 py-4 sm:flex sm:items-center">
                  <span
                    className={`flex h-8 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold tabular-nums ${
                      standing.rank !== null && standing.rank <= 3
                        ? "bg-brand-soft text-brand-strong"
                        : "bg-ink/[0.04] text-muted"
                    }`}
                    aria-label={`Rank ${standing.rank}`}
                  >
                    {rankLabel(standing.rank)}
                  </span>

                  <div className="min-w-0 flex-1">
                    {entry ? (
                      <a
                        href={`/ideas/${entry.idea.slug || entry.idea.id}`}
                        className="text-sm font-bold leading-5 text-ink underline decoration-transparent underline-offset-4 transition-colors hover:decoration-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        {standing.title}
                      </a>
                    ) : (
                      <p className="text-sm font-bold leading-5 text-ink">
                        {standing.title}
                      </p>
                    )}
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                      <span>{entryCategory}</span>
                      <span>
                        {standing.communitySupporters}{" "}
                        {standing.communitySupporters === 1
                          ? "supporter"
                          : "supporters"}
                      </span>
                      {standing.completedEvaluations > 0 ? (
                        <span>
                          {standing.completedEvaluations}{" "}
                          {standing.completedEvaluations === 1
                            ? "evaluation"
                            : "evaluations"}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs text-muted sm:hidden">
                      <span className="font-semibold text-ink">
                        Official {score(standing.officialScore)}
                      </span>
                      {columns.judge ? (
                        <> · Judge {score(standing.judgeScore)}</>
                      ) : null}
                      {columns.community ? (
                        <> · Community {score(standing.communityScore)}</>
                      ) : null}
                    </p>
                  </div>

                  {columns.judge ? (
                    <span className="hidden w-20 text-right text-sm tabular-nums text-ink-soft sm:block">
                      {score(standing.judgeScore)}
                    </span>
                  ) : null}
                  {columns.community ? (
                    <span className="hidden w-24 text-right text-sm tabular-nums text-ink-soft sm:block">
                      {score(standing.communityScore)}
                    </span>
                  ) : null}
                  <span className="w-14 text-right text-sm font-bold tabular-nums text-ink sm:w-20">
                    {programme.judging.method === "CURATED" &&
                    standing.officialScore === null
                      ? "Curated"
                      : score(standing.officialScore)}
                  </span>
                </article>
              </li>
            );
          })}
        </ol>
      )}

      {filtered.length > PAGE_SIZE ? (
        <nav
          aria-label="Leaderboard pages"
          className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-4"
        >
          <p className="text-xs text-muted" aria-live="polite">
            Page {safePage + 1} of {pageCount}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage(Math.max(0, safePage - 1))}
              disabled={safePage === 0}
              className="min-h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-ink transition-colors hover:border-brand/45 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))}
              disabled={safePage >= pageCount - 1}
              className="min-h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-ink transition-colors hover:border-brand/45 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Next
            </button>
          </div>
        </nav>
      ) : null}

      {unranked.length > 0 ? <UnrankedList standings={unranked} /> : null}

      <p className="mt-4 text-xs leading-5 text-muted">
        Published {formatDateTime(programme.results?.publishedAt)} · revision{" "}
        {programme.results?.revision} · checksum{" "}
        <span className="break-all font-mono text-[0.6875rem]">
          {programme.results?.checksum.slice(0, 16)}...
        </span>
      </p>
    </div>
  );
}

function UnrankedList({ standings }: { standings: ProgrammeStanding[] }) {
  return (
    <section aria-labelledby="unranked" className="mt-6">
      <h3
        id="unranked"
        className="text-sm font-bold tracking-[-0.02em] text-ink"
      >
        Not ranked ({standings.length})
      </h3>
      <ul className="mt-2 divide-y divide-border border-y border-border">
        {standings.map((standing) => (
          <li key={standing.entryId} className="py-3">
            <p className="text-sm font-semibold text-ink">{standing.title}</p>
            <p className="mt-0.5 text-xs leading-5 text-muted">
              {standing.disqualified
                ? "Disqualified by the organiser."
                : (standing.incompleteReason ??
                  "This entry could not be scored under the published rules.")}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
