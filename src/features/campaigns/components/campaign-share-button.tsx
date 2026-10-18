"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Share08Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";

/**
 * Share a campaign.
 *
 * A real action with no backend: it hands the current URL to the platform share
 * sheet where one exists, otherwise copies it. If the clipboard is blocked (an
 * insecure context, or a denied permission) the button reveals the link instead
 * of claiming a copy that did not happen.
 */
export function CampaignShareButton({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  const url = typeof window === "undefined" ? "" : window.location.href;

  async function share() {
    const shareUrl = window.location.href;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch {
        // A cancelled share sheet is not a failure; fall through to copying.
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={share}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <HugeiconsIcon
          icon={Share08Icon}
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
        />
        Share campaign
      </button>

      <p role="status" aria-live="polite" className="mt-1.5 text-xs text-muted">
        {status === "copied" ? "Link copied to your clipboard." : null}
        {status === "failed"
          ? "Copying was blocked. Select the link below."
          : null}
      </p>

      {status === "failed" ? (
        <input
          readOnly
          value={url}
          aria-label="Campaign link"
          onFocus={(event) => event.target.select()}
          className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-canvas px-3 text-xs text-ink"
        />
      ) : null}
    </div>
  );
}
