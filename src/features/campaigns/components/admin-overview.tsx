"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  CheckListIcon,
  Clock01Icon,
  Note01Icon,
  SecurityCheckIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import { Amount } from "@/components/ui/amount";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MetricCard } from "@/components/ui/metric-card";
import { Pill } from "@/components/ui/pill";
import {
  applyCampaignReviewOverride,
  campaignReviewPastLabels,
  type CampaignReviewAuditEntry,
} from "@/features/campaigns/lib/admin-review";
import {
  getCampaignReviewStoreSnapshot,
  getServerCampaignReviewStoreSnapshot,
  subscribeCampaignReviewStore,
} from "@/features/campaigns/lib/admin-review-store";
import { formatShortDate } from "@/features/campaigns/lib/dates";
import { campaignCategoryText } from "@/features/campaigns/lib/filters";
import type { Campaign } from "@/features/campaigns/types";
import type { AdminActor } from "@/features/admin/permissions";

/**
 * Admin overview.
 *
 * Every count is derived from the preview campaign records or from decisions
 * recorded in this browser. Nothing here is presented as a production
 * operational metric, and the integration panel names the data the platform
 * cannot read yet.
 */
export function AdminOverview({
  actor,
  initialCampaigns,
}: {
  actor: AdminActor;
  initialCampaigns: readonly Campaign[];
}) {
  const store = useSyncExternalStore(
    subscribeCampaignReviewStore,
    getCampaignReviewStoreSnapshot,
    getServerCampaignReviewStoreSnapshot,
  );
  const campaigns = useMemo(
    () =>
      initialCampaigns.map((campaign) =>
        applyCampaignReviewOverride(campaign, store.overrides[campaign.id]),
      ),
    [initialCampaigns, store.overrides],
  );

  const awaiting = campaigns.filter(
    (campaign) => campaign.review.status === "in-review",
  );
  const changes = campaigns.filter(
    (campaign) => campaign.review.status === "changes-requested",
  );
  const publicCampaigns = campaigns.filter(
    (campaign) =>
      campaign.phase === "funding" ||
      campaign.phase === "delivering" ||
      campaign.phase === "completed",
  );
  const recentEvents = store.events.slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Admin</Eyebrow>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
            Operating overview
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
            Review what is waiting, record a decision with a reason, and move to
            the next operational queue. This workspace runs as{" "}
            <span className="font-semibold text-ink">{actor.name}</span>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/campaigns"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <HugeiconsIcon
              icon={CheckListIcon}
              size={16}
              strokeWidth={1.9}
              aria-hidden="true"
            />
            Open review queue
          </Link>
          <Link
            href="/admin/audit"
            className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/35 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Audit log
          </Link>
        </div>
      </header>

      <section
        aria-label="Preview boundary"
        className="mt-4 rounded-2xl border border-warning/30 bg-warning/[0.07] px-4 py-3.5"
      >
        <p className="text-sm font-semibold text-ink">
          Preview operations, not production authority
        </p>
        <p className="mt-1 text-sm leading-6 text-muted">
          Campaign records are fixtures. Review decisions are stored in this
          browser and are not sent to the API. KYC, application-fee payment, and
          escrow state are not connected, so no decision here verifies any of
          them.
        </p>
      </section>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Clock01Icon}
          label="Awaiting review"
          value={String(awaiting.length)}
          hint="Campaigns that can receive a decision now."
        />
        <MetricCard
          icon={Note01Icon}
          label="Changes requested"
          value={String(changes.length)}
          hint="Waiting on the creator, not on an admin."
        />
        <MetricCard
          icon={CheckListIcon}
          label="Decisions in this browser"
          value={String(store.events.length)}
          hint="Local preview records. Not an authoritative audit trail."
        />
        <MetricCard
          icon={SecurityCheckIcon}
          label="Public preview campaigns"
          value={String(publicCampaigns.length)}
          hint="Funding, delivery, or completed in the fixture set."
        />
      </dl>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section
          aria-labelledby="overview-review-queue"
          className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="overview-review-queue"
                className="text-base font-bold tracking-[-0.02em] text-ink"
              >
                Review queue
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Submitted campaigns, oldest submission first.
              </p>
            </div>
            <Link
              href="/admin/campaigns"
              className="inline-flex min-h-10 items-center gap-1 text-xs font-semibold text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              View all
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={13}
                strokeWidth={2}
                aria-hidden="true"
              />
            </Link>
          </div>

          {awaiting.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-border-strong px-4 py-6 text-center text-sm text-muted">
              Nothing is waiting for review in this preview.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {awaiting
                .toSorted((left, right) =>
                  submittedAt(left).localeCompare(submittedAt(right)),
                )
                .slice(0, 5)
                .map((campaign) => (
                  <li key={campaign.id}>
                    <Link
                      href={`/admin/campaigns/${campaign.id}`}
                      className="flex flex-wrap items-start justify-between gap-3 py-3 transition-colors hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">
                          {campaign.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {campaign.creator.name} ·{" "}
                          {campaignCategoryText(campaign)} · submitted{" "}
                          {formatShortDate(submittedAt(campaign))}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums text-ink">
                          <Amount value={campaign.funding.target} compact />
                        </p>
                        <p className="text-[0.625rem] text-muted">
                          {campaign.milestones.length} milestones
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </section>

        <aside className="space-y-3">
          <section className="rounded-2xl border border-border bg-surface p-4">
            <h2 className="text-sm font-bold text-ink">
              Recent preview decisions
            </h2>
            {recentEvents.length === 0 ? (
              <p className="mt-2 text-xs leading-5 text-muted">
                No decisions have been recorded in this browser.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {recentEvents.map((event) => (
                  <li key={event.id}>
                    <p className="text-xs font-semibold text-ink">
                      {campaignReviewPastLabels[event.action]}
                    </p>
                    <p className="text-[0.6875rem] leading-4 text-muted">
                      {event.campaignTitle} · {formatShortDate(event.at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4">
            <h2 className="text-sm font-bold text-ink">Not connected</h2>
            <ul className="mt-2 space-y-2">
              {[
                "Authenticated admin session",
                "Campaign review API",
                "Advertising inventory API",
                "KYC provider status",
                "Application-fee confirmation",
                "Escrow indexer",
              ].map((label) => (
                <li
                  key={label}
                  className="flex items-center justify-between gap-2 text-xs text-muted"
                >
                  <span>{label}</span>
                  <Pill size="xs" tone="warning">
                    Missing
                  </Pill>
                </li>
              ))}
            </ul>
            <p className="mt-2 border-t border-border pt-2 text-[0.625rem] leading-4 text-muted">
              These surfaces stay unavailable rather than displaying invented
              provider or chain data.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-brand-tint p-4">
            <h2 className="text-sm font-bold text-ink">Not authoritative</h2>
            <p className="mt-1 text-[0.6875rem] leading-4 text-muted">
              The API must repeat the state and permission checks, append the
              audit record, and enforce FR-103 and FR-311 before review happens.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function submittedAt(campaign: Campaign): string {
  return campaign.review.status === "in-review"
    ? campaign.review.submittedAt
    : (campaign.publishedAt ?? "");
}

/** Exported for the audit surface, which shares the event label vocabulary. */
export function reviewAuditLabel(event: CampaignReviewAuditEntry): string {
  return campaignReviewPastLabels[event.action];
}
