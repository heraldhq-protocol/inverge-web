"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type ErrorReferenceBadgeProps = {
  referenceCode: string;
};

export function ErrorReferenceBadge({
  referenceCode,
}: ErrorReferenceBadgeProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referenceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is not permitted
      setCopied(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2 font-mono text-xs text-muted">
      <span>Reference: {referenceCode}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="group relative inline-flex size-7 items-center justify-center rounded-md border border-border bg-surface text-muted transition-colors hover:border-brand/40 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        aria-label={copied ? "Copied reference code" : "Copy reference code"}
        title={copied ? "Copied!" : "Copy reference"}
      >
        {copied ? (
          <Check className="size-3.5 text-brand" aria-hidden="true" />
        ) : (
          <Copy
            className="size-3.5 transition-transform group-hover:scale-110"
            aria-hidden="true"
          />
        )}
        <span className="sr-only">
          {copied ? "Copied reference code" : "Copy reference code"}
        </span>
      </button>
      {copied && (
        <span
          role="status"
          className="rounded bg-contrast px-1.5 py-0.5 text-[10px] font-sans font-semibold text-white animate-fade-in"
        >
          Copied
        </span>
      )}
    </div>
  );
}
