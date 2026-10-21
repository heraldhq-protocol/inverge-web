"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft02Icon,
  ArrowUpRight01Icon,
  CheckmarkCircle02Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { COMMUNITY_DESTINATION_META } from "@/features/feedback/types";
import type { CommunityInvite } from "@/features/feedback/types";
import {
  enabledDestinations,
  primaryDestination,
} from "@/features/feedback/lib/feedback";

/**
 * Optional community invitation.
 *
 * It renders only enabled, validated destinations. An external link opens in a
 * new tab with a safe rel; the copy never claims the reader joined, and joining
 * is never required to finish feedback.
 */
export function CommunityInvite({
  invite,
  variant = "full",
}: {
  invite: CommunityInvite;
  variant?: "compact" | "full";
}) {
  const destinations = enabledDestinations(invite);
  if (!invite.enabled || destinations.length === 0) return null;

  const primary = primaryDestination(invite);
  const secondary = destinations.filter(
    (destination) => destination.id !== primary?.id,
  );

  return (
    <section
      aria-labelledby="community-invite-title"
      className="rounded-2xl border border-brand/20 bg-brand-tint p-4"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/12 text-brand-strong">
          <HugeiconsIcon
            icon={UserAdd01Icon}
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
        <div className="min-w-0">
          <h2
            id="community-invite-title"
            className="text-base font-bold tracking-[-0.02em] text-ink"
          >
            {invite.title}
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            {invite.description}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        {primary ? (
          <a
            href={primary.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {primary.kind === "whatsapp"
              ? "Join WhatsApp community"
              : primary.kind === "telegram"
                ? "Join Telegram community"
                : primary.kind === "discord"
                  ? "Join Discord server"
                  : primary.kind === "newsletter"
                    ? "Subscribe to updates"
                    : primary.kind === "profile"
                      ? "View creator profile"
                      : "Join community"}
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              size={14}
              strokeWidth={1.9}
              aria-hidden="true"
            />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : null}

        {variant === "full" && secondary.length > 0 ? (
          <div className="flex flex-1 flex-wrap gap-2">
            {secondary.map((destination) => (
              <a
                key={destination.id}
                href={destination.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:border-brand/35 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {destination.label ||
                  COMMUNITY_DESTINATION_META[destination.kind].label}
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ))}
          </div>
        ) : null}
      </div>

      <p className="mt-2 text-[0.6875rem] leading-4 text-muted">
        Optional. You are not signed up to anything by clicking, and Inverge
        does not pass your feedback to the community.
      </p>
    </section>
  );
}

/**
 * Follow is an account action, and there is no follow service yet. Rather than
 * faking a successful follow in the browser, the button explains what is
 * missing. When the backend lands, this component swaps its handler for the
 * returned follow state.
 */
export function FollowCreatorButton({
  creatorName,
  signedIn,
  returnTo,
  compact = false,
}: {
  creatorName: string;
  signedIn: boolean;
  returnTo: string;
  compact?: boolean;
}) {
  if (!signedIn) {
    return (
      <Link
        href={`/auth?next=${encodeURIComponent(returnTo)}`}
        className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/35 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          compact ? "w-full" : ""
        }`}
      >
        <HugeiconsIcon
          icon={UserAdd01Icon}
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
        />
        Follow creator
        <span className="text-xs font-normal text-muted">(sign in)</span>
      </Link>
    );
  }

  return (
    <div className={compact ? "w-full" : undefined}>
      <Button
        type="button"
        variant="secondary"
        size="md"
        className="w-full"
        aria-describedby="follow-unavailable"
        onClick={() => {
          const notice = document.getElementById("follow-unavailable");
          notice?.focus();
        }}
      >
        <HugeiconsIcon
          icon={UserAdd01Icon}
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
        />
        Follow {creatorName.split(" ")[0]}
      </Button>
      <p
        id="follow-unavailable"
        tabIndex={-1}
        className="mt-1.5 text-[0.6875rem] leading-4 text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Following is not connected yet. It will become available with accounts.
      </p>
    </div>
  );
}

/** Success confirmation icon block, reused by the post-feedback state. */
export function FeedbackThanks({
  title = "Thanks for sharing your thoughts.",
  body = "Your feedback helps this idea become better.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <div className="text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-soft text-brand-strong">
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          size={28}
          strokeWidth={1.7}
          aria-hidden="true"
        />
      </span>
      <h2 className="mt-3 text-xl font-bold tracking-[-0.035em] text-ink">
        {title}
      </h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-muted">
        {body}
      </p>
    </div>
  );
}

/** A quiet, real next step back to the idea or into related ideas. */
export function ExploreIdeasLink({ href = "/ideas" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-brand-strong transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <HugeiconsIcon
        icon={ArrowLeft02Icon}
        size={15}
        strokeWidth={1.9}
        aria-hidden="true"
      />
      Continue exploring ideas
    </Link>
  );
}
