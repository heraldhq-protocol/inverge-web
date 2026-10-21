"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  HandCoinsIcon,
  HelpCircleIcon,
  Notification01Icon,
  Search01Icon,
  Settings01Icon,
  UserCircleIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Menu, MenuItem } from "@/components/ui/menu";
import type { ShellData } from "@/features/app-shell/types";

export function NotificationMenu({
  notifications,
  unreadCount,
}: {
  notifications: ShellData["notifications"];
  unreadCount: number;
}) {
  return (
    <Menu
      triggerLabel={
        unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : "Notifications"
      }
      label="Recent notifications"
      triggerClassName="relative grid size-11 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
      panelClassName="w-[22rem]"
      trigger={
        <>
          <HugeiconsIcon
            icon={Notification01Icon}
            size={20}
            strokeWidth={1.8}
            aria-hidden="true"
          />
          {unreadCount > 0 ? (
            <span
              aria-hidden="true"
              className="absolute right-2.5 top-2.5 size-2 rounded-full bg-brand ring-2 ring-canvas"
            />
          ) : null}
        </>
      }
    >
      {() => (
        <>
          <p className="border-b border-border px-3.5 py-2.5 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-muted">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're up to date"}
          </p>
          {notifications.length > 0 ? (
            <ul>
              {notifications.map((item) => (
                <li key={item.id} className="border-b border-border/70">
                  <Link
                    href={item.href}
                    role="menuitem"
                    className="block px-3.5 py-3 transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
                  >
                    <span className="flex items-start gap-2">
                      {!item.isRead ? (
                        <span
                          aria-hidden="true"
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="mt-1.5 size-1.5 shrink-0"
                        />
                      )}
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold leading-5 text-ink">
                          {item.title}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-muted">
                          {item.message}
                        </span>
                        <span className="mt-1 block text-[0.6875rem] text-muted">
                          {item.timeLabel}
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3.5 py-6 text-sm text-muted">
              Updates about ideas you follow will appear here.
            </p>
          )}
          <MenuItem href="/d/notifications">
            <span className="flex-1">Open notification centre</span>
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </MenuItem>
        </>
      )}
    </Menu>
  );
}

export function AccountMenu({ viewer }: { viewer: ShellData["viewer"] }) {
  const displayName = viewer.displayName ?? "Your account";

  return (
    <Menu
      triggerLabel="Account menu"
      label="Account"
      triggerClassName="flex min-h-11 items-center gap-2 rounded-full pl-0.5 pr-2 transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand"
      trigger={
        <>
          <Avatar name={viewer.displayName} size={32} />
          <span className="sr-only">{displayName}</span>
          <span
            aria-hidden="true"
            className="hidden text-xs font-semibold text-ink-soft xl:inline"
          >
            {displayName.split(" ")[0]}
          </span>
        </>
      }
    >
      {() => (
        <>
          <div className="border-b border-border px-3.5 py-3">
            <p className="truncate text-sm font-semibold text-ink">
              {displayName}
            </p>
            <p className="truncate text-xs text-muted">
              {viewer.authenticated && viewer.dataSource === "preview"
                ? "Preview account"
                : viewer.handle
                  ? `@${viewer.handle}`
                  : viewer.authenticated
                    ? "Signed in"
                    : "Preview data"}
            </p>
          </div>
          <div className="py-1">
            <MenuItem href="/d/backing">
              <HugeiconsIcon
                icon={HandCoinsIcon}
                size={18}
                strokeWidth={1.7}
                aria-hidden="true"
                className="text-muted"
              />
              Campaigns you back
            </MenuItem>
            <MenuItem href="/d/wallet">
              <HugeiconsIcon
                icon={Wallet01Icon}
                size={18}
                strokeWidth={1.7}
                aria-hidden="true"
                className="text-muted"
              />
              Wallet
            </MenuItem>
            <MenuItem href="/d/profile">
              <HugeiconsIcon
                icon={UserCircleIcon}
                size={18}
                strokeWidth={1.7}
                aria-hidden="true"
                className="text-muted"
              />
              Your profile
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
            <MenuItem href="/help">
              <HugeiconsIcon
                icon={HelpCircleIcon}
                size={18}
                strokeWidth={1.7}
                aria-hidden="true"
                className="text-muted"
              />
              Help and guides
            </MenuItem>
          </div>
          {/*
           * Sign out exists for every session, including the local preview
           * identity: it ends the provider session and clears the local cookie.
           * The signed-out preview identity has nothing to end, so it invites a
           * sign-in instead of rendering a control that would do nothing.
           * Wallet addresses never appear here (D-008 keeps provider detail in
           * account settings).
           */}
          {viewer.authenticated ? (
            <div className="border-t border-border py-1">
              {viewer.dataSource === "preview" ? (
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
          ) : (
            <p className="border-t border-border px-3.5 py-3 text-[0.6875rem] leading-4 text-muted">
              You are viewing preview data.{" "}
              <Link
                className="font-medium text-ink underline underline-offset-3"
                href="/auth"
              >
                Sign in
              </Link>{" "}
              to use your Inverge account.
            </p>
          )}
        </>
      )}
    </Menu>
  );
}

/**
 * The desktop topbar.
 *
 * Search is a real form posting to discovery, which is the only search the app
 * implements. There is deliberately no `⌘K` hint: no shortcut is bound, and a
 * keyboard affordance that does nothing is worse than none.
 */
export function ProductTopbar({ data }: { data: ShellData }) {
  return (
    <header className="sticky top-0 z-30 hidden border-b border-border/70 bg-canvas/88 backdrop-blur lg:block">
      <div className="flex min-h-16 items-center gap-4 px-6 xl:px-8">
        <form
          action="/d/discover"
          role="search"
          className="relative min-w-0 max-w-xl flex-1"
        >
          <label htmlFor="shell-search" className="sr-only">
            Search ideas, creators, and topics
          </label>
          <HugeiconsIcon
            icon={Search01Icon}
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            id="shell-search"
            name="q"
            type="search"
            placeholder="Search ideas, creators, or topics..."
            className="min-h-11 w-full rounded-xl border border-border bg-surface py-2 pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-muted/70 hover:border-muted/45 focus:border-brand focus:ring-3 focus:ring-brand/12"
          />
        </form>

        <div className="ml-auto flex items-center gap-1.5">
          <NotificationMenu
            notifications={data.notifications}
            unreadCount={data.unreadCount}
          />
          <span aria-hidden="true" className="h-6 w-px bg-border" />
          <AccountMenu viewer={data.viewer} />
        </div>
      </div>
    </header>
  );
}
