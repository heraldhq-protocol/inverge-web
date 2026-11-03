import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/ui/pill";
import { AdminUserRow } from "@/features/admin/components/admin-user-row";
import {
  ADMIN_USERS_PAGE_SIZE,
  adminUsersHref,
  type AdminUser,
  type AdminUserRole,
} from "@/features/admin/lib/users";

const ROLE_FILTERS: readonly { value?: AdminUserRole; label: string }[] = [
  { label: "All" },
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
          Grant or revoke administrator access. The API remains the authority: a
          role change is attributed to you and written to the platform audit
          trail.
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
    <div className="mt-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/[0.07] p-3 text-xs leading-5 text-muted">
      <HugeiconsIcon
        icon={Alert02Icon}
        size={15}
        strokeWidth={1.8}
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-warning-strong"
      />
      <p>
        <span className="font-semibold text-ink">Preview mode.</span> These are
        sample accounts. Search and filters work, but a role change is shown on
        this screen only and is never sent to the API.
      </p>
    </div>
  );
}

const pagerLink =
  "inline-flex min-h-9 items-center rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:border-brand/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const pagerDisabled =
  "inline-flex min-h-9 items-center rounded-lg border border-border/60 px-3 text-xs font-semibold text-muted/50";

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
        className="mt-5 rounded-2xl border border-border bg-surface"
      >
        <h2 id="admin-users-heading" className="sr-only">
          Accounts
        </h2>

        <div className="flex flex-col gap-3 border-b border-border p-4 xl:flex-row xl:items-center xl:justify-between">
          <form
            action="/admin/users"
            method="get"
            role="search"
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <label htmlFor="admin-user-search" className="sr-only">
              Search accounts by email or provider ID
            </label>
            <Input
              id="admin-user-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Email or provider ID"
              autoComplete="off"
              spellCheck={false}
              className="sm:w-72"
            />
            {role ? <input type="hidden" name="role" value={role} /> : null}
            <Button type="submit" variant="secondary" size="sm">
              Search
            </Button>
            {filtered ? (
              <Link
                href="/admin/users"
                className="inline-flex min-h-11 items-center px-1 text-xs font-semibold text-muted underline-offset-4 hover:text-ink hover:underline"
              >
                Clear
              </Link>
            ) : null}
          </form>

          <nav aria-label="Filter by role" className="flex flex-wrap gap-1.5">
            {ROLE_FILTERS.map((option) => {
              const active = role === option.value;
              return (
                <Link
                  key={option.label}
                  href={adminUsersHref({ query, role: option.value })}
                  aria-current={active ? "true" : undefined}
                  className={`inline-flex min-h-9 items-center rounded-lg border px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    active
                      ? "border-brand/35 bg-brand-soft text-brand-strong"
                      : "border-border bg-surface text-muted hover:border-brand/30 hover:text-ink"
                  }`}
                >
                  {option.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {users.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-ink">
              No accounts match this search.
            </p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Try a different address or provider ID, or clear the filters.
            </p>
            <Link
              href="/admin/users"
              className="mt-3 inline-flex min-h-9 items-center rounded-lg border border-border px-3 text-xs font-semibold text-ink hover:border-brand/45"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border">
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

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3">
          <p className="text-xs text-muted">
            {users.length === 0
              ? "No accounts on this page."
              : `${users.length} ${users.length === 1 ? "account" : "accounts"}${
                  hasMore ? " on this page" : ""
                }`}
          </p>
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
                Newer
              </Link>
            ) : (
              <span aria-disabled="true" className={pagerDisabled}>
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
              </Link>
            ) : (
              <span aria-disabled="true" className={pagerDisabled}>
                Older
              </span>
            )}
          </nav>
        </div>
      </section>

      <p className="mt-3 text-[11px] leading-5 text-muted">
        Role changes take effect on the next request. A demotion does not sign
        the account out. KYC status is shown for context; it is decided by the
        verification workflow, not here.
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
        className="mt-5 rounded-2xl border border-danger/25 bg-danger/[0.06] p-4"
      >
        <p className="text-sm font-semibold text-ink">
          The directory is unavailable.
        </p>
        <p className="mt-1 text-sm leading-6 text-muted">{reason}</p>
        <Link
          href={adminUsersHref({ query, role, offset })}
          className="mt-3 inline-flex min-h-9 items-center rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink hover:border-brand/45"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
