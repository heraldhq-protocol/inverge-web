"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Analytics01Icon,
  ArrowRight02Icon,
  Home01Icon,
  Settings01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Menu, MenuItem } from "@/components/ui/menu";

/**
 * The serialisable identity the marketing header receives from the server.
 *
 * It is intentionally narrower than the session: no email, role, wallet, or
 * provider detail reaches the browser. `mode` only changes the label so a local
 * preview identity is never presented as a live Inverge account.
 */
export type SiteViewer = {
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  mode: "live" | "preview";
};

export function profileHrefFor(viewer: SiteViewer): string {
  return viewer.username
    ? `/u/${encodeURIComponent(viewer.username)}`
    : "/d/profile";
}

function viewerLabel(viewer: SiteViewer): string {
  if (viewer.mode === "preview") return "Preview account";
  return viewer.username ? `@${viewer.username}` : "Signed in";
}

function AccountIdentity({ viewer }: { viewer: SiteViewer }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-ink">
        {viewer.displayName ?? "Your account"}
      </p>
      <p className="truncate text-xs text-muted">{viewerLabel(viewer)}</p>
    </div>
  );
}

/** Desktop account popover. */
export function SiteAccountMenu({ viewer }: { viewer: SiteViewer }) {
  const firstName = viewer.displayName?.split(/\s+/)[0] ?? "Account";

  return (
    <Menu
      triggerLabel="Account menu"
      label="Account"
      triggerClassName="flex min-h-11 items-center gap-2 rounded-full pl-0.5 pr-2 text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      trigger={
        <>
          <Avatar name={viewer.displayName} size={32} src={viewer.avatarUrl} />
          <span className="sr-only">{viewer.displayName ?? "Account"}</span>
          <span
            aria-hidden="true"
            className="hidden max-w-24 truncate text-xs font-semibold text-ink-soft xl:inline"
          >
            {firstName}
          </span>
        </>
      }
    >
      {() => (
        <>
          <div className="border-b border-border px-3.5 py-3">
            <AccountIdentity viewer={viewer} />
          </div>
          <div className="py-1">
            <MenuItem href="/d">
              <HugeiconsIcon
                icon={Home01Icon}
                size={18}
                strokeWidth={1.7}
                aria-hidden="true"
                className="text-muted"
              />
              Dashboard
            </MenuItem>
            <MenuItem href="/d/creator">
              <HugeiconsIcon
                icon={Analytics01Icon}
                size={18}
                strokeWidth={1.7}
                aria-hidden="true"
                className="text-muted"
              />
              Creator Studio
            </MenuItem>
            <MenuItem href={profileHrefFor(viewer)}>
              <HugeiconsIcon
                icon={UserCircleIcon}
                size={18}
                strokeWidth={1.7}
                aria-hidden="true"
                className="text-muted"
              />
              {viewer.username ? "Public profile" : "Your profile"}
            </MenuItem>
            <MenuItem href="/d/settings">
              <HugeiconsIcon
                icon={Settings01Icon}
                size={18}
                strokeWidth={1.7}
                aria-hidden="true"
                className="text-muted"
              />
              Settings
            </MenuItem>
          </div>
          <div className="border-t border-border py-1">
            {viewer.mode === "preview" ? (
              <p className="px-3.5 py-2 text-[0.6875rem] leading-4 text-muted">
                Preview mode. This account is local to this browser and is not
                connected to Inverge services.
              </p>
            ) : null}
            <MenuItem href="/sign-out">
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={18}
                strokeWidth={1.7}
                aria-hidden="true"
                className="text-muted"
              />
              Sign out
            </MenuItem>
          </div>
        </>
      )}
    </Menu>
  );
}

/** Inline account block for the mobile navigation panel. */
export function SiteAccountPanel({
  onNavigate,
  viewer,
}: {
  onNavigate: () => void;
  viewer: SiteViewer;
}) {
  const links = [
    { href: "/d", label: "Dashboard" },
    { href: "/d/creator", label: "Creator Studio" },
    {
      href: profileHrefFor(viewer),
      label: viewer.username ? "Public profile" : "Your profile",
    },
    { href: "/d/settings", label: "Settings" },
  ] as const;

  return (
    <div className="border-b border-border/70 pb-4">
      <div className="flex items-center gap-3">
        <Avatar name={viewer.displayName} size={40} src={viewer.avatarUrl} />
        <AccountIdentity viewer={viewer} />
      </div>

      {viewer.mode === "preview" ? (
        <p className="mt-3 rounded-xl bg-canvas px-3 py-2 text-[0.6875rem] leading-4 text-muted">
          Preview mode. This account is local to this browser and is not
          connected to Inverge services.
        </p>
      ) : null}

      <div className="mt-3 grid grid-cols-2 gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface px-3 text-center text-sm font-semibold text-ink transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <Link
        href="/sign-out"
        onClick={onNavigate}
        className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-ink-soft transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <HugeiconsIcon
          icon={ArrowRight02Icon}
          size={17}
          strokeWidth={1.7}
          aria-hidden="true"
        />
        Sign out
      </Link>
    </div>
  );
}
