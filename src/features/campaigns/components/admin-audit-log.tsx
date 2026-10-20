"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Note01Icon, Shield01Icon } from "@hugeicons/core-free-icons";
import { useSyncExternalStore } from "react";

import { Eyebrow } from "@/components/ui/eyebrow";
import { Pill } from "@/components/ui/pill";
import {
  campaignReviewPastLabels,
  campaignReviewStatusLabels,
} from "@/features/campaigns/lib/admin-review";
import {
  getCampaignReviewStoreSnapshot,
  getServerCampaignReviewStoreSnapshot,
  subscribeCampaignReviewStore,
} from "@/features/campaigns/lib/admin-review-store";
import { formatShortDate } from "@/features/campaigns/lib/dates";
import { formatProgrammeDate } from "@/features/programmes/lib/programme";
import type { AuditEntry } from "@/features/programmes/types";

/**
 * Audit history.
 *
 * Two sources are shown side by side and never merged: review decisions this
 * browser recorded, and sampled programme audit entries from the fixtures. The
 * first is real but local and disposable; the second is illustrative. Neither is
 * the server audit trail, and the page says so rather than filling the gap with
 * plausible-looking rows.
 */
export function AdminAuditLog({
  previewEntries,
}: {
  previewEntries: readonly AuditEntry[];
}) {
  const store = useSyncExternalStore(
    subscribeCampaignReviewStore,
    getCampaignReviewStoreSnapshot,
    getServerCampaignReviewStoreSnapshot,
  );

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header>
        <Eyebrow>Audit</Eyebrow>
        <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
          Audit history
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted">
          Sensitive changes record the actor, time, action, target, and
          before/after state. The API must append these records; a client-side
          toggle is not an audit trail.
        </p>
      </header>

      <section className="mt-4 rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-brand-strong">
              <HugeiconsIcon
                icon={Note01Icon}
                size={17}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </span>
            <div>
              <h2 className="text-sm font-bold text-ink">
                Review decisions in this browser
              </h2>
              <p className="text-[0.6875rem] text-muted">
                Recorded by this preview. Clearing browser storage removes them.
              </p>
            </div>
          </div>
          <Pill size="xs" tone="warning">
            Not authoritative
          </Pill>
        </div>

        {store.events.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-border-strong px-4 py-6 text-center text-sm text-muted">
            No review decision has been recorded in this browser.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {store.events.map((event) => (
              <li key={event.id} className="py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">
                    {campaignReviewPastLabels[event.action]} ·{" "}
                    {event.campaignTitle}
                  </p>
                  <time
                    className="text-[0.625rem] tabular-nums text-muted"
                    dateTime={event.at}
                  >
                    {formatShortDate(event.at)}
                  </time>
                </div>
                <p className="mt-0.5 text-[0.6875rem] text-muted">
                  {event.actor.name} · {event.actor.role.replace("_", " ")} ·{" "}
                  {event.campaignId}
                </p>
                <p className="mt-1 rounded-lg bg-canvas px-2.5 py-1.5 text-[0.625rem] text-muted">
                  {campaignReviewStatusLabels[event.from]} →{" "}
                  {campaignReviewStatusLabels[event.to]}
                  {event.reason ? ` · ${event.reason}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-canvas text-muted">
              <HugeiconsIcon
                icon={Shield01Icon}
                size={17}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </span>
            <div>
              <h2 className="text-sm font-bold text-ink">
                Sample programme audit entries
              </h2>
              <p className="text-[0.6875rem] text-muted">
                Illustrative fixture data, not produced by any action here.
              </p>
            </div>
          </div>
          <Pill size="xs" tone="neutral">
            Sample data
          </Pill>
        </div>

        <ul className="mt-3 divide-y divide-border">
          {previewEntries.map((entry) => (
            <li key={entry.id} className="py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{entry.action}</p>
                <time
                  className="text-[0.625rem] tabular-nums text-muted"
                  dateTime={entry.at}
                >
                  {formatProgrammeDate(entry.at, true)}
                </time>
              </div>
              <p className="mt-0.5 text-[0.6875rem] text-muted">
                {entry.actor} · {entry.actorRole.replace("_", " ")} ·{" "}
                {entry.target}
              </p>
              {entry.before || entry.after ? (
                <p className="mt-1 rounded-lg bg-canvas px-2.5 py-1.5 text-[0.625rem] text-muted">
                  {entry.before ?? "—"} → {entry.after ?? "—"}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-4 text-[0.6875rem] leading-5 text-muted">
        The authoritative trail will be written by the API on every privileged
        action. Until then this page shows what it actually has rather than a
        reconstructed history.
      </p>
    </div>
  );
}
