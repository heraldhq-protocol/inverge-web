"use client";

import { Download, LogOut, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { SettingsCard } from "@/features/settings/components/settings-section";
import { SettingsRow } from "@/features/settings/components/settings-row";

const actionLinkClass =
  "inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand/[0.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export function AccountSettings() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [notice, setNotice] = useState("");

  return (
    <>
      <SettingsCard>
        <SettingsRow
          icon={Download}
          title="Your data"
          description="Request a copy of your Inverge account information."
          action={
            <Link href="/contact" className={actionLinkClass}>
              Request data
            </Link>
          }
        />
        <SettingsRow
          icon={LogOut}
          title="Sign out"
          description="Sign out of Inverge on this device."
          action={
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() =>
                setNotice(
                  "Sign out will be enabled when authentication is connected.",
                )
              }
            >
              Sign out
            </Button>
          }
        />
        <SettingsRow
          icon={Trash2}
          title="Delete account"
          description="Request deletion of your profile and personal account data."
          tone="danger"
          action={
            <Button
              type="button"
              size="sm"
              variant="destructive"
              aria-expanded={deleteOpen}
              onClick={() => setDeleteOpen((current) => !current)}
            >
              Delete account
            </Button>
          }
        />
      </SettingsCard>

      <p aria-live="polite" className="mt-2 min-h-5 text-xs text-muted">
        {notice}
      </p>

      {deleteOpen ? (
        <aside className="mt-3 rounded-2xl border border-danger/25 bg-danger/[0.035] p-4 sm:p-5">
          <h3 className="font-semibold text-ink">Request account deletion?</h3>
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted">
            Inverge can remove eligible off-chain personal data, subject to
            legal retention requirements. Public blockchain records cannot be
            edited or deleted, and Inverge does not store raw identity
            documents.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center rounded-xl bg-danger px-4 text-sm font-semibold text-white transition-colors hover:bg-danger/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
            >
              Contact support
            </Link>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
