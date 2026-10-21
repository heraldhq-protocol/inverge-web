"use client";

import { useEffect, useState } from "react";

import {
  SAVED_CAMPAIGNS_EVENT,
  SAVED_CAMPAIGNS_STORAGE_KEY,
  savedCampaignsStore,
} from "@/features/campaigns/lib/saved-campaigns";

/**
 * The browser-local saved campaign ids, kept current across cards and tabs.
 *
 * Discovery uses this for the "Saved projects" view. The read is async because
 * the store boundary is async by design (a future account-backed store will be
 * remote), so the initial value is an empty set and a save event refreshes it.
 */
export function useSavedCampaignIds(): ReadonlySet<string> {
  const [ids, setIds] = useState<ReadonlySet<string>>(() => new Set<string>());

  useEffect(() => {
    let active = true;

    function load() {
      savedCampaignsStore()
        .read()
        .then((records) => {
          if (!active) return;
          setIds(new Set(records.map((record) => record.campaignId)));
        })
        .catch(() => {
          if (!active) return;
          setIds(new Set<string>());
        });
    }

    load();

    function handleStorage(event: StorageEvent) {
      if (event.key === SAVED_CAMPAIGNS_STORAGE_KEY) load();
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(SAVED_CAMPAIGNS_EVENT, load);

    return () => {
      active = false;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(SAVED_CAMPAIGNS_EVENT, load);
    };
  }, []);

  return ids;
}
