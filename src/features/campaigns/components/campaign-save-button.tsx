"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Bookmark01Icon,
  BookmarkCheck02Icon,
} from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";

import {
  SAVED_CAMPAIGNS_EVENT,
  SAVED_CAMPAIGNS_SCOPE,
  isCampaignSaved,
  savedCampaignRecord,
  savedCampaignsStore,
  saveCampaign,
  unsaveCampaign,
} from "@/features/campaigns/lib/saved-campaigns";

/**
 * Save a campaign for later.
 *
 * Three things this control refuses to do, because it is on a page about money:
 *
 * - It does not flip the label before the write resolves. The saved state is set
 *   from the store's result, so a blocked or full browser reports a failure
 *   instead of a saved campaign that will vanish on reload.
 * - It does not present itself as account-synchronised. The store is this
 *   browser, and `SAVED_CAMPAIGNS_SCOPE` is the sentence that says so.
 * - It does not offer the control while the current state is unknown: until the
 *   first read resolves the button is busy, so a double-click cannot race the
 *   initial state.
 */
export function CampaignSaveButton({
  campaign,
  className = "",
  variant = "default",
}: {
  campaign: { id: string; slug: string; title?: string };
  className?: string;
  /** `icon` is for cards: same control, compact and independently focusable. */
  variant?: "default" | "icon";
}) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    savedCampaignsStore()
      .read()
      .then((records) => {
        if (!active) return;
        setSaved(isCampaignSaved(records, campaign.id));
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [campaign.id]);

  async function toggle() {
    if (busy || loading) return;

    setBusy(true);
    setMessage(null);

    const wasSaved = saved;

    try {
      const store = savedCampaignsStore();
      const records = await store.read();
      const next = wasSaved
        ? unsaveCampaign(records, campaign.id)
        : saveCampaign(
            records,
            savedCampaignRecord(
              { campaignId: campaign.id, slug: campaign.slug },
              new Date().toISOString(),
            ),
          );

      await store.write(next);

      setSaved(!wasSaved);
      setMessage(
        wasSaved
          ? "Removed from your saved campaigns."
          : "Saved in this browser.",
      );
      window.dispatchEvent(new Event(SAVED_CAMPAIGNS_EVENT));
    } catch {
      setMessage(
        "This device would not store the change, so nothing was saved.",
      );
    } finally {
      setBusy(false);
    }
  }

  const disabled = loading || busy;
  const isIcon = variant === "icon";
  const title = campaign.title ?? "this campaign";
  const accessibleName = saved
    ? `Remove ${title} from saved campaigns`
    : `Save ${title} for later`;

  return (
    <div className={className}>
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-busy={disabled || undefined}
        aria-label={isIcon ? accessibleName : undefined}
        aria-pressed={loading ? undefined : saved}
        title={isIcon ? accessibleName : SAVED_CAMPAIGNS_SCOPE}
        className={
          isIcon
            ? "pointer-events-auto grid size-9 place-items-center rounded-full border border-border bg-surface/95 text-ink shadow-sm backdrop-blur transition-colors hover:border-brand/45 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
            : "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
        }
      >
        <HugeiconsIcon
          icon={saved ? BookmarkCheck02Icon : Bookmark01Icon}
          size={isIcon ? 17 : 16}
          strokeWidth={saved ? 2 : 1.8}
          aria-hidden="true"
          className={saved ? "text-brand-strong" : undefined}
        />
        {isIcon ? null : saved ? "Saved" : "Save for later"}
      </button>

      <p
        role="status"
        aria-live="polite"
        className={isIcon ? "sr-only" : "mt-1.5 text-xs text-muted"}
      >
        {message}
      </p>
    </div>
  );
}
