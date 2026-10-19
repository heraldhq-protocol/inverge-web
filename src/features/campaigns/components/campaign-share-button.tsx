"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Share08Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";

import {
  browserShareDependencies,
  shareCampaign,
  shareOutcomeMessage,
  shareOutcomeRevealsLink,
  type CampaignSharePayload,
  type ShareOutcome,
} from "@/features/campaigns/lib/share";

/**
 * Share a public campaign.
 *
 * The button does one thing and reports one of four honest outcomes. It never
 * announces a share the user cancelled, and it never claims a copy that the
 * clipboard refused. When both routes fail the link is revealed in a read-only
 * field so the campaign can still be shared by hand.
 */
export function CampaignShareButton({
  payload,
  className = "",
  label = "Share campaign",
}: {
  payload: CampaignSharePayload;
  className?: string;
  label?: string;
}) {
  const [outcome, setOutcome] = useState<ShareOutcome | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleShare() {
    if (busy) return;

    setBusy(true);
    setOutcome(null);

    try {
      setOutcome(await shareCampaign(payload, browserShareDependencies()));
    } finally {
      setBusy(false);
    }
  }

  const message = outcome === null ? null : shareOutcomeMessage(outcome);
  const revealLink = outcome !== null && shareOutcomeRevealsLink(outcome);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleShare}
        disabled={busy}
        aria-busy={busy || undefined}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
      >
        <HugeiconsIcon
          icon={Share08Icon}
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
        />
        {label}
      </button>

      <p role="status" aria-live="polite" className="mt-1.5 text-xs text-muted">
        {message}
      </p>

      {revealLink ? (
        <input
          readOnly
          value={payload.url}
          aria-label="Campaign link"
          onFocus={(event) => event.target.select()}
          className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-canvas px-3 text-xs text-ink"
        />
      ) : null}
    </div>
  );
}
