"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import {
  ADMIN_KYC_LABELS,
  ADMIN_USER_ROLE_DESCRIPTIONS,
  ADMIN_USER_ROLE_LABELS,
  ADMIN_USER_ROLE_TONES,
  ASSIGNABLE_ROLES,
  adminUserDisplayName,
  formatAdminUserDate,
  type AdminUser,
  type AdminUserRole,
  type AssignableAdminUserRole,
} from "@/features/admin/lib/users";
import { sendJson } from "@/lib/api/client";

/** Lines that sit under the account name, aligned with the identity text. */
const INDENT = "sm:ml-[3.25rem]";

function initialDraft(role: AdminUserRole): AssignableAdminUserRole {
  return role === "ADMIN" ? "ADMIN" : "USER";
}

export function AdminUserRow({
  user,
  isSelf,
  canManage,
  preview,
}: {
  user: AdminUser;
  isSelf: boolean;
  canManage: boolean;
  preview: boolean;
}) {
  const router = useRouter();
  const panelId = useId();
  const groupName = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [savedRole, setSavedRole] = useState<AdminUserRole | null>(null);
  const [draft, setDraft] = useState<AssignableAdminUserRole>("USER");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const currentRole = savedRole ?? user.role;
  const displayName = adminUserDisplayName(user);
  const cannotDemoteSelf = isSelf && currentRole === "ADMIN";

  function openEditor() {
    setDraft(initialDraft(currentRole));
    setError(null);
    setNotice(null);
    setOpen(true);
  }

  function closeEditor() {
    if (busy) return;
    setOpen(false);
    setError(null);
    triggerRef.current?.focus();
  }

  async function saveRole() {
    if (busy || draft === currentRole) return;

    setBusy(true);
    setError(null);
    setNotice(null);

    if (preview) {
      setSavedRole(draft);
      setOpen(false);
      setBusy(false);
      setNotice(
        "Preview only. This role is shown on this screen and was not sent to the API.",
      );
      triggerRef.current?.focus();
      return;
    }

    try {
      const response = await sendJson<AdminUser>(
        `/api/admin/users/${encodeURIComponent(user.id)}/role`,
        { method: "PATCH", body: { role: draft } },
      );

      if (!response.ok) {
        setError(response.message || "The role could not be changed.");
        return;
      }

      setSavedRole(response.data.role);
      setOpen(false);
      setNotice(
        `${displayName} is now ${ADMIN_USER_ROLE_LABELS[response.data.role].toLowerCase()}.`,
      );
      triggerRef.current?.focus();
      router.refresh();
    } catch {
      setError(
        "The role could not be changed. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <li
      className={`px-4 py-4 transition-colors sm:px-5 ${open ? "bg-brand-tint/60" : "hover:bg-canvas/50"}`}
    >
      <div
        className={`grid gap-3 md:items-center md:gap-4 ${canManage ? "md:grid-cols-[minmax(0,1fr)_11rem_8.5rem]" : "md:grid-cols-[minmax(0,1fr)_11rem]"}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={displayName} size={40} />
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <p className="min-w-0 text-sm font-semibold leading-5 text-ink [overflow-wrap:anywhere]">
                {user.email ?? "No email on file"}
              </p>
              {isSelf ? (
                <Pill size="xs" tone="neutral">
                  <span className="text-ink-soft">You</span>
                </Pill>
              ) : null}
              {user.bannedAt ? (
                <Pill size="xs" tone="danger">
                  <span className="text-ink-soft">Banned</span>
                </Pill>
              ) : null}
            </div>
            {/* Keep verification readable as the account column narrows. */}
            <p className="mt-1 flex flex-wrap gap-x-2 text-xs leading-5 text-muted">
              <span>{ADMIN_KYC_LABELS[user.kycStatus]}</span>
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="text-border-strong">
                  /
                </span>
                Joined {formatAdminUserDate(user.createdAt)}
              </span>
            </p>
            {user.email ? null : (
              <p className="mt-0.5 text-xs leading-5 text-muted [overflow-wrap:anywhere]">
                {user.providerUserId}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 md:contents">
          <div className="flex items-center">
            <Pill tone={ADMIN_USER_ROLE_TONES[currentRole]} size="sm">
              <span
                className={currentRole === "USER" ? "text-ink-soft" : undefined}
              >
                {ADMIN_USER_ROLE_LABELS[currentRole]}
              </span>
            </Pill>
          </div>
          {canManage ? (
            <Button
              ref={triggerRef}
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer gap-1.5 rounded-lg focus-visible:outline-brand-strong aria-expanded:border-brand/35 aria-expanded:bg-brand-soft aria-expanded:text-brand-strong md:justify-self-end"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={open ? closeEditor : openEditor}
            >
              Change role
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={16}
                strokeWidth={2}
                aria-hidden="true"
                className={`shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
              />
            </Button>
          ) : null}
        </div>
      </div>

      {open ? (
        <form
          id={panelId}
          aria-labelledby={`${panelId}-label`}
          className={`mt-4 rounded-xl border border-border bg-canvas p-4 ${INDENT}`}
          onSubmit={(event) => {
            event.preventDefault();
            void saveRole();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && !busy) {
              event.preventDefault();
              event.stopPropagation();
              closeEditor();
            }
          }}
        >
          <fieldset disabled={busy} aria-busy={busy} className="min-w-0">
            <legend
              id={`${panelId}-label`}
              className="max-w-full text-sm font-semibold text-ink [overflow-wrap:anywhere]"
            >
              Role for {user.email ?? "this account"}
            </legend>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {ASSIGNABLE_ROLES.map((option) => {
                const selected = draft === option;
                const blocked = option === "USER" && cannotDemoteSelf;
                return (
                  <label
                    key={option}
                    className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                      selected
                        ? "border-brand/50 bg-brand-tint"
                        : "border-border bg-surface hover:border-border-strong"
                    } ${blocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                  >
                    <input
                      type="radio"
                      name={groupName}
                      value={option}
                      checked={selected}
                      disabled={blocked}
                      onChange={() => setDraft(option)}
                      className="mt-0.5 size-4 shrink-0 accent-brand-strong focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-strong"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">
                        {ADMIN_USER_ROLE_LABELS[option]}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-muted">
                        {ADMIN_USER_ROLE_DESCRIPTIONS[option]}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {cannotDemoteSelf ? (
            <p className="mt-3 text-xs leading-5 text-muted">
              You cannot remove your own admin access. Ask another
              administrator.
            </p>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 xl:flex-row xl:items-center xl:justify-between">
            <p className="max-w-sm text-xs leading-5 text-muted">
              {preview
                ? "This change applies to the preview only."
                : "Changes are attributed to you in the audit trail."}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                size="sm"
                className="cursor-pointer rounded-lg bg-brand-strong hover:bg-contrast focus-visible:outline-brand-strong"
                disabled={busy || draft === currentRole}
              >
                {busy ? "Saving..." : "Save role"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="cursor-pointer rounded-lg focus-visible:outline-brand-strong"
                onClick={closeEditor}
                disabled={busy}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      ) : null}

      {notice ? (
        <p
          role="status"
          className={`mt-2 text-xs font-semibold leading-5 text-brand-strong [overflow-wrap:anywhere] ${INDENT}`}
        >
          {notice}
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className={`mt-3 rounded-lg border border-danger/25 bg-danger/[0.06] px-3 py-2.5 text-sm leading-6 text-ink [overflow-wrap:anywhere] ${INDENT}`}
        >
          {error}
        </p>
      ) : null}
    </li>
  );
}
