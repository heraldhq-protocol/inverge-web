"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import {
  ADMIN_KYC_LABELS,
  ADMIN_KYC_TONES,
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
    <li className="px-4 py-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar name={displayName} size={40} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">
              {user.email ?? "No email on file"}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted">{displayName}</p>
            <p
              className="mt-0.5 truncate text-[11px] text-muted"
              title={user.providerUserId}
            >
              {user.providerUserId}
            </p>
            <p className="mt-0.5 text-[11px] text-muted">
              Joined {formatAdminUserDate(user.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:max-w-72 sm:justify-end">
          <Pill tone={ADMIN_USER_ROLE_TONES[currentRole]} size="xs">
            {ADMIN_USER_ROLE_LABELS[currentRole]}
          </Pill>
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
          <Pill tone={ADMIN_KYC_TONES[user.kycStatus]} size="xs">
            {ADMIN_KYC_LABELS[user.kycStatus]}
          </Pill>
          {canManage ? (
            <Button
              ref={triggerRef}
              type="button"
              variant="secondary"
              size="sm"
              className="ml-auto sm:ml-0"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={openEditor}
            >
              Change role
            </Button>
          ) : null}
        </div>
      </div>

      {open ? (
        <div
          id={panelId}
          className="mt-3 rounded-xl border border-border bg-canvas p-3.5"
        >
          <fieldset disabled={busy}>
            <legend className="text-xs font-bold text-ink">
              Change role for {user.email ?? "this account"}
            </legend>
            <p className="mt-1 text-[11px] leading-4 text-muted">
              A role change is attributed to you and written to the platform
              audit trail.
            </p>
            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
              {ASSIGNABLE_ROLES.map((option) => {
                const selected = draft === option;
                const blocked = option === "USER" && cannotDemoteSelf;
                return (
                  <label
                    key={option}
                    className={`flex items-start gap-2 rounded-lg border bg-surface p-2.5 text-xs transition-colors ${
                      selected
                        ? "border-brand/50 ring-1 ring-brand/15"
                        : "border-border hover:border-muted/40"
                    } ${blocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
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
                      <span className="block font-semibold text-ink">
                        {ADMIN_USER_ROLE_LABELS[option]}
                      </span>
                      <span className="mt-0.5 block leading-4 text-muted">
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
              onClick={() => void saveRole()}
              disabled={busy || draft === currentRole}
            >
              {busy ? "Saving..." : "Save role"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
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
          className="mt-2 text-xs font-semibold text-brand-strong"
        >
          {notice}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-2 text-xs font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </li>
  );
}
