"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { StatePanel } from "@/components/ui/state-panel";
import { PreviewDataChip } from "@/features/campaigns/components/prototype-notice";
import {
  SavedCampaignRow,
  SavedCampaignUnavailableRow,
} from "@/features/campaigns/components/saved-campaign-row";
import {
  SAVED_CAMPAIGNS_SCOPE,
  savedCampaignsStore,
  unsaveCampaign,
  type SavedCampaignRecord,
} from "@/features/campaigns/lib/saved-campaigns";
import type { Campaign } from "@/features/campaigns/types";

/**
 * The saved-campaigns collection.
 *
 * It lists this browser's saved campaigns, resolved against the public campaign
 * set the server passed in. Three states are kept apart: reading the store,
 * failing to read it, and having nothing saved. A saved id that no longer
 * resolves to a public campaign is shown as unavailable rather than dropped, so
 * a row never disappears without the user being told why.
 */
export function SavedCampaignsDashboard({
  candidates,
  nowIso,
}: {
  candidates: readonly Campaign[];
  nowIso: string;
}) {
  /** `null` while the store is being read, so an empty list is not assumed. */
  const [records, setRecords] = useState<readonly SavedCampaignRecord[] | null>(
    null,
  );
  const [readFailed, setReadFailed] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeMessage, setRemoveMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    savedCampaignsStore()
      .read()
      .then((saved) => {
        if (!active) return;
        setRecords(saved);
      })
      .catch(() => {
        if (!active) return;
        setReadFailed(true);
      });

    return () => {
      active = false;
    };
  }, []);

  async function remove(campaignId: string) {
    if (removingId !== null) return;

    setRemovingId(campaignId);
    setRemoveMessage(null);

    try {
      const store = savedCampaignsStore();
      const current = await store.read();
      const next = unsaveCampaign(current, campaignId);
      await store.write(next);
      setRecords(next);
      setRemoveMessage("Removed from your saved campaigns.");
    } catch {
      setRemoveMessage(
        "This device would not store the change, so nothing was removed.",
      );
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header>
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
            Your space
          </p>
          <PreviewDataChip title="The saved list lives in this browser until account sessions are connected" />
        </div>
        <h1 className="mt-2 text-balance text-[1.75rem] font-bold leading-tight tracking-[-0.045em] text-ink sm:text-4xl">
          Saved campaigns
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted sm:text-[0.9375rem]">
          Campaigns you kept to decide on later, with their live funding state.
          {` ${SAVED_CAMPAIGNS_SCOPE}`}
        </p>
      </header>

      <p
        role="status"
        aria-live="polite"
        className="mt-4 min-h-5 text-sm text-muted"
      >
        {removeMessage}
      </p>

      <div className="mt-2">
        {readFailed ? (
          <StatePanel
            variant="error"
            eyebrow="Saved campaigns unavailable"
            title="Your saved list could not be read"
            description="This browser refused access to the store the saved list lives in, so nothing can be shown here. Saved campaigns are a device-local convenience in this build; account sync opens when sign-in is connected."
            action={
              <Link
                href="/campaigns"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Explore campaigns
              </Link>
            }
          />
        ) : records === null ? (
          <LoadingRegion label="Loading saved campaigns">
            <ul className="space-y-4">
              {[0, 1].map((index) => (
                <li
                  key={index}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:gap-5 sm:p-5"
                >
                  <Skeleton className="h-28 w-full rounded-xl sm:w-48" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-2/3 rounded" />
                    <Skeleton className="h-4 w-1/3 rounded" />
                    <Skeleton className="h-9 w-full max-w-sm rounded" />
                  </div>
                </li>
              ))}
            </ul>
          </LoadingRegion>
        ) : records.length === 0 ? (
          <StatePanel
            variant="empty"
            eyebrow="Nothing saved yet"
            title="Save a campaign to come back to it"
            description="Saving keeps a campaign here while you weigh the plan, the use of funds, and the milestone evidence. It is not a contribution, and nothing is charged."
            action={
              <Link
                href="/campaigns"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Explore campaigns
              </Link>
            }
          />
        ) : (
          <>
            <p className="mb-3 text-sm text-muted">
              {records.length === 1
                ? "1 saved campaign"
                : `${records.length} saved campaigns`}
            </p>
            <ul className="space-y-4">
              {records.map((record) => {
                const campaign = candidates.find(
                  (candidate) => candidate.id === record.campaignId,
                );

                return campaign ? (
                  <SavedCampaignRow
                    key={record.campaignId}
                    campaign={campaign}
                    nowIso={nowIso}
                    removing={removingId === record.campaignId}
                    onRemove={() => void remove(record.campaignId)}
                  />
                ) : (
                  <SavedCampaignUnavailableRow
                    key={record.campaignId}
                    campaignId={record.campaignId}
                    removing={removingId === record.campaignId}
                    onRemove={() => void remove(record.campaignId)}
                  />
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
