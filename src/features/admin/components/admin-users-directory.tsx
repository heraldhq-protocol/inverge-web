import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Eyebrow } from "@/components/ui/eyebrow";
import { Pill } from "@/components/ui/pill";
import { AdminUserRow } from "@/features/admin/components/admin-user-row";
import {
  ADMIN_USERS_PAGE_SIZE,
  adminUsersHref,
  type AdminUser,
  type AdminUserRole,
} from "@/features/admin/lib/users";

const ROLE_FILTERS: readonly { value?: AdminUserRole; label: string }[] = [
  { label: "All users" },
  { value: "ADMIN", label: "Administrators" },
  { value: "COMPLIANCE_REVIEWER", label: "Compliance" },
  { value: "USER", label: "Members" },
];

function AdminUsersHeader({ preview }: { preview: boolean }) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <Eyebrow>Access control</Eyebrow>
        <h1 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-ink sm:text-3xl">
          Users &amp; roles
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
          Review platform accounts and manage administrator access.
        </p>
      </div>
      {preview ? (
        <Pill tone="warning" size="sm" className="self-start">
          Preview data
        </Pill>
      ) : null}
    </header>
  );
}

function PreviewNotice() {
  return (
    <div className="mt-5 flex items-start gap-2.5 rounded-lg bg-warning/[0.07] px-3 py-2.5 text-xs leading-5 text-ink-soft">
      <HugeiconsIcon
        icon={Alert02Icon}
        size={16}
        strokeWidth={1.5}
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-warning-strong"
      />
      <p>
        <span className="font-semibold text-ink">Sample accounts.</span> Search
        and filters work. Role changes apply to this preview only.
      </p>
    </div>
  );
}

const pagerLink =
  "inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:border-border-strong hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong";

const pagerDisabled =
  "inline-flex min-h-11 items-center gap-2 rounded-lg border border-border/60 px-3 text-xs font-semibold text-muted/50";

export function AdminUsersDirectory({
  users,
  actorId,
  canManage,
  preview,
  query,
  role,
  offset,
  hasMore,
}: {
  users: AdminUser[];
  actorId: string;
  canManage: boolean;
  preview: boolean;
  query: string;
  role?: AdminUserRole | undefined;
  offset: number;
  hasMore: boolean;
}) {
  const filtered = Boolean(query || role);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <AdminUsersHeader preview={preview} />
      {preview ? <PreviewNotice /> : null}

      <section
        aria-labelledby="admin-users-heading"
        className="mt-6 rounded-2xl border border-border bg-surface"
      >
        <h2 id="admin-users-heading" className="sr-only">
          Accounts
        </h2>

        <div className="flex flex-col gap-3 p-4 sm:px-5 xl:flex-row xl:items-center xl:justify-between xl:gap-6">
          <div className="min-w-0 xl:order-2">
            <form
              action="/admin/users"
              method="get"
              role="search"
              className="min-w-0 xl:w-80"
            >
              {role ? <input type="hidden" name="role" value={role} /> : null}
              {/* A fixed-height wrapper owns the sizing; the submit adds no
                  nested padding or minimum height to stretch the field. */}
              <div className="flex h-12 items-center gap-2.5 rounded-lg border border-border-strong bg-surface pl-3 transition-colors focus-within:border-brand-strong focus-within:ring-2 focus-within:ring-brand-strong/12">
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={16}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="shrink-0 text-muted"
                />
                <label htmlFor="admin-user-search" className="sr-only">
                  Search accounts by email or provider ID
                </label>
                <input
                  id="admin-user-search"
                  name="q"
                  type="search"
                  defaultValue={query}
                  placeholder="Email or provider ID"
                  autoComplete="off"
                  spellCheck={false}
                  className="h-full w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-muted sm:text-sm"
                />
                <button
                  type="submit"
                  className="inline-flex shrink-0 cursor-pointer items-center self-stretch rounded-r-lg border-l border-border px-3 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand-tint focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-brand-strong"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          <nav
            aria-label="Filter by role"
            className="grid grid-cols-2 gap-1 sm:flex sm:flex-wrap xl:order-1"
          >
            {ROLE_FILTERS.map((option) => {
              const active = role === option.value;
              return (
                <Link
                  key={option.label}
                  href={adminUsersHref({ query, role: option.value })}
                  aria-current={active ? "true" : undefined}
                  className={`inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong sm:justify-start sm:text-xs ${
                    active
                      ? "bg-brand-soft text-brand-strong"
                      : "text-muted hover:bg-canvas hover:text-ink"
                  }`}
                >
                  {option.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div
          aria-hidden="true"
          className={`hidden gap-4 border-y border-border bg-canvas/60 px-5 py-2.5 text-xs font-medium text-muted md:grid ${
            canManage
              ? "grid-cols-[minmax(0,1fr)_11rem_8.5rem]"
              : "grid-cols-[minmax(0,1fr)_11rem]"
          }`}
        >
          <span>Account</span>
          <span>Platform role</span>
          {canManage ? <span className="sr-only">Actions</span> : null}
        </div>

        {users.length === 0 ? (
          <div className="border-t border-border px-6 py-14 text-center md:border-t-0">
            <HugeiconsIcon
              icon={Search01Icon}
              size={24}
              strokeWidth={1.5}
              aria-hidden="true"
              className="mx-auto mb-3 text-muted"
            />
            <p className="text-sm font-semibold text-ink">
              {offset > 0
                ? "No accounts on this page"
                : filtered
                  ? "No matching accounts"
                  : "No accounts to display"}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-muted">
              {offset > 0
                ? "Return to the first page to see the latest results."
                : filtered
                  ? "Try a different email or provider ID, or clear your filters."
                  : "Accounts will appear here when they are available."}
            </p>
            {filtered || offset > 0 ? (
              <Link
                href={
                  offset > 0 ? adminUsersHref({ query, role }) : "/admin/users"
                }
                className={`mt-4 ${pagerLink}`}
              >
                {offset > 0 ? "Back to first page" : "Clear filters"}
              </Link>
            ) : null}
          </div>
        ) : (
          <ul className="divide-y divide-border border-t border-border md:border-t-0">
            {users.map((user) => (
              <AdminUserRow
                key={user.id}
                user={user}
                isSelf={user.id === actorId}
                canManage={canManage}
                preview={preview}
              />
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-x-4">
            <p className="text-xs text-muted">
              <span className="font-medium tabular-nums text-ink">
                {users.length}
              </span>{" "}
              {users.length === 1 ? "account" : "accounts"} on this page
            </p>
            {filtered && users.length > 0 ? (
              <Link
                href="/admin/users"
                className="inline-flex min-h-11 items-center text-xs font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
              >
                Clear filters
              </Link>
            ) : null}
          </div>
          <nav aria-label="Account pages" className="flex gap-2">
            {offset > 0 ? (
              <Link
                href={adminUsersHref({
                  query,
                  role,
                  offset: Math.max(offset - ADMIN_USERS_PAGE_SIZE, 0),
                })}
                className={pagerLink}
              >
                <HugeiconsIcon
                  icon={ArrowLeft01Icon}
                  size={14}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                Newer
              </Link>
            ) : (
              <span aria-disabled="true" className={pagerDisabled}>
                <HugeiconsIcon
                  icon={ArrowLeft01Icon}
                  size={14}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                Newer
              </span>
            )}
            {hasMore ? (
              <Link
                href={adminUsersHref({
                  query,
                  role,
                  offset: offset + ADMIN_USERS_PAGE_SIZE,
                })}
                className={pagerLink}
              >
                Older
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={14}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </Link>
            ) : (
              <span aria-disabled="true" className={pagerDisabled}>
                Older
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={14}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </span>
            )}
          </nav>
        </div>
      </section>

      <p className="mt-4 max-w-3xl text-xs leading-5 text-muted">
        Role changes take effect on the next request without signing the account
        out. Identity checks are managed in{" "}
        <Link
          href="/admin/verification"
          className="font-medium text-brand-strong underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
        >
          Verification
        </Link>
        .
      </p>
    </div>
  );
}

export function AdminUsersUnavailable({
  reason,
  query,
  role,
  offset,
}: {
  reason: string;
  query: string;
  role?: AdminUserRole | undefined;
  offset: number;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <AdminUsersHeader preview={false} />
      <div
        role="alert"
        className="mt-6 rounded-2xl border border-border bg-surface px-6 py-10"
      >
        <HugeiconsIcon
          icon={Alert02Icon}
          size={24}
          strokeWidth={1.5}
          aria-hidden="true"
          className="mb-3 text-warning-strong"
        />
        <p className="text-sm font-semibold text-ink">
          The directory is unavailable.
        </p>
        <p className="mt-1 text-sm leading-6 text-muted">{reason}</p>
        <Link
          href={adminUsersHref({ query, role, offset })}
          className={`mt-4 ${pagerLink}`}
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
