"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  LinkSquare02Icon,
  Share01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useState } from "react";

import { ideaViewHref } from "@/features/ideas/lib/idea-link";

/**
 * Quick actions. Each performs its own function: the copy button writes the
 * public idea URL, share opens a real share target, and the two links point at
 * existing routes and an in-page section.
 */
export function AnalyticsQuickActions({ ideaId }: { ideaId: string }) {
  const [status, setStatus] = useState<"error" | "idle" | "shared">("idle");

  function publicUrl() {
    return `${window.location.origin}/ideas/${ideaId}`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl());
      setStatus("shared");
    } catch {
      setStatus("error");
    }
  }

  async function share() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Inverge idea", url: publicUrl() });
        setStatus("shared");
        return;
      } catch {
        // A dismissed share sheet is not an error worth announcing.
        return;
      }
    }

    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(publicUrl())}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  const actions = [
    {
      icon: LinkSquare02Icon,
      label: "Open public page",
      href: ideaViewHref(ideaId, "internal"),
    },
  ] as const;

  return (
    <section
      aria-labelledby="quick-actions"
      className="rounded-2xl border border-border bg-surface p-4"
    >
      <h2 id="quick-actions" className="text-sm font-bold text-ink">
        Quick actions
      </h2>
      <ul className="mt-2 space-y-1">
        {actions.map(({ href, icon, label }) => (
          <li key={label}>
            <Link
              href={href}
              className="flex min-h-10 items-center gap-2.5 rounded-lg px-1.5 text-sm text-ink-soft transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <HugeiconsIcon
                icon={icon}
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
                className="text-muted"
              />
              <span className="flex-1">{label}</span>
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
                className="text-muted"
              />
            </Link>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={copyLink}
            className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-1.5 text-left text-sm text-ink-soft transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <HugeiconsIcon
              icon={status === "shared" ? CheckmarkCircle02Icon : Copy01Icon}
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
              className={
                status === "shared" ? "text-brand-strong" : "text-muted"
              }
            />
            <span className="flex-1">
              {status === "shared" ? "Link copied" : "Copy link"}
            </span>
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={share}
            className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-1.5 text-left text-sm text-ink-soft transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <HugeiconsIcon
              icon={Share01Icon}
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
              className="text-muted"
            />
            <span className="flex-1">Share idea</span>
          </button>
        </li>
        <li>
          <Link
            href="/d/creator/ideas"
            className="flex min-h-10 items-center gap-2.5 rounded-lg px-1.5 text-sm text-ink-soft transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
              className="text-muted"
            />
            <span className="flex-1">Manage ideas</span>
          </Link>
        </li>
      </ul>
      <p className="sr-only" aria-live="polite">
        {status === "shared"
          ? "Link copied to the clipboard."
          : status === "error"
            ? "Could not copy the link. Copy it from the public page address bar."
            : ""}
      </p>
      {status === "error" ? (
        <p className="mt-2 text-xs text-danger">
          Could not copy. Open the public page and copy its address.
        </p>
      ) : null}
    </section>
  );
}
