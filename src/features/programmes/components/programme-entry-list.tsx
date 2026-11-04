import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";

import type { PublicProgrammeEntry } from "@/features/programmes/api/types";
import { formatDateTime } from "@/features/programmes/lib/public-programme";
import { isSafeLogoUrl } from "@/features/programmes/lib/programme";

function initials(title: string): string {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Public entries, exactly as the API exposes them.
 *
 * A cover appears only when its URL is safe to render; otherwise the entry gets
 * a typographic fallback. The snapshot is not re-rendered here because the public
 * projection intentionally exposes only the fields a visitor may read.
 */
export function ProgrammeEntryList({
  entries,
  unavailable = false,
}: {
  entries: PublicProgrammeEntry[];
  unavailable?: boolean;
}) {
  if (unavailable) {
    return (
      <div className="border-t border-border pt-5">
        <p className="text-sm font-semibold text-ink">
          The entry list is temporarily unavailable.
        </p>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
          The programme itself loaded, but its public entries did not. Reload
          the page to try again; this is not an empty entry list.
        </p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="border-t border-border pt-5">
        <p className="text-sm font-semibold text-ink">No public entries yet.</p>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
          Entries become public only when the organiser publishes a shortlist or
          the final results. Drafts and withdrawn entries are never listed.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-x-8 border-t border-border sm:grid-cols-2">
      {entries.map((entry) => {
        const cover = isSafeLogoUrl(entry.idea.coverImageUrl ?? undefined)
          ? entry.idea.coverImageUrl
          : null;

        return (
          <li key={entry.id} className="border-b border-border">
            <Link
              href={`/ideas/${entry.idea.slug || entry.idea.id}`}
              className="group flex gap-3.5 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="size-14 shrink-0 rounded-lg border border-border object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="grid size-14 shrink-0 place-items-center rounded-lg border border-border bg-ink/[0.04] text-xs font-bold tracking-[0.04em] text-muted"
                >
                  {initials(entry.title)}
                </span>
              )}

              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold leading-5 text-ink transition-colors group-hover:text-brand-strong">
                    {entry.title}
                  </span>
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    size={14}
                    strokeWidth={1.9}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
                  />
                </span>
                <span className="mt-1 block text-xs text-muted">
                  {entry.category || "Uncategorised"}
                  {entry.submittedAt
                    ? ` · submitted ${formatDateTime(entry.submittedAt)}`
                    : ""}
                </span>
                {entry.team.length > 0 ? (
                  <span className="mt-1 flex items-center gap-1 text-xs text-muted">
                    <HugeiconsIcon
                      icon={UserGroupIcon}
                      size={13}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    {entry.team.map((member) => member.name).join(", ")}
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
