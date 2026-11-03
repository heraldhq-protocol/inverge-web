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
    <li className="px-4 py-3.5 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar name={displayName} size={40} />
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <p
                className="min-w-0 truncate text-sm font-semibold text-ink"
                title={user.providerUserId}
              >
                {user.email ?? "No email on file"}
              </p>
              {isSelf ? (
                <Pill size="xs" tone="promoted">
                  You
                </Pill>
              ) : null}
              {user.bannedAt ? (
                <Pill size="xs" tone="danger">
                  Banned
                </Pill>
              ) : null}
            </div>
            <p className="mt-1 truncate text-xs text-muted">
              {displayName} · Joined {formatAdminUserDate(user.createdAt)} ·{" "}
              {ADMIN_KYC_LABELS[user.kycStatus]}
            </p>
            {user.email ? null : (
              <p className="mt-0.5 truncate text-[11px] text-muted/85">
                {user.providerUserId}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
          <Pill tone={ADMIN_USER_ROLE_TONES[currentRole]} size="sm">
            {ADMIN_USER_ROLE_LABELS[currentRole]}
          </Pill>
          {canManage ? (
            <Button
              ref={triggerRef}
              type="button"
              variant="outline"
              size="sm"
              className="min-h-10 gap-1 rounded-lg px-2.5 text-xs sm:min-h-9"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={open ? closeEditor : openEditor}
            >
              Change role
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={13}
                strokeWidth={2}
                aria-hidden="true"
                className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </Button>
          ) : null}
        </div>
      </div>

      {open ? (
        <div
          id={panelId}
          className={`mt-3 rounded-xl bg-canvas p-3.5 sm:p-4 ${INDENT}`}
        >
          <fieldset disabled={busy} aria-busy={busy}>
            <legend className="text-xs font-semibold text-ink">
              Role for {user.email ?? "this account"}
            </legend>
            <p className="mt-1 text-[11px] leading-4 text-muted">
              A role change is attributed to you and written to the platform
              audit trail.
            </p>
            <div className="mt-2 space-y-1">
              {ASSIGNABLE_ROLES.map((option) => {
                const selected = draft === option;
                const blocked = option === "USER" && cannotDemoteSelf;
                return (
                  <label
                    key={option}
                    className={`flex items-start gap-2.5 rounded-lg border p-2.5 transition-colors ${
                      selected
                        ? "border-brand/35 bg-surface"
                        : "border-transparent hover:bg-surface/70"
                    } ${blocked ? "cursor-not-allowed opacity-55" : "cursor-pointer"}`}
                  >
                    <input
                      type="radio"
                      name={groupName}
                      value={option}
                      checked={selected}
                      disabled={blocked}
                      onChange={() => setDraft(option)}
                      className="mt-0.5 size-4 shrink-0 accent-brand"
                    />
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-ink">
                        {ADMIN_USER_ROLE_LABELS[option]}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-4 text-muted">
                        {ADMIN_USER_ROLE_DESCRIPTIONS[option]}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {cannotDemoteSelf ? (
            <p className="mt-2 text-[11px] leading-4 text-muted">
              You cannot remove your own admin access. Ask another
              administrator.
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="min-h-9 rounded-lg px-3 text-xs"
              onClick={() => void saveRole()}
              disabled={busy || draft === currentRole}
            >
              {busy ? "Saving..." : "Save role"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="min-h-9 rounded-lg px-3 text-xs"
              onClick={closeEditor}
              disabled={busy}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {notice ? (
        <p
          role="status"
          className={`mt-2 text-xs font-semibold text-brand-strong ${INDENT}`}
        >
          {notice}
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className={`mt-2 text-xs font-semibold text-danger ${INDENT}`}
        >
          {error}
        </p>
      ) : null}
    </li>
  );
}
