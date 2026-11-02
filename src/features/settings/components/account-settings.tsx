"use client";

import { Download, LogOut, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/features/settings/components/confirm-dialog";
import { SettingsRow } from "@/features/settings/components/settings-row";
import { SettingsCard } from "@/features/settings/components/settings-section";
import type { SettingsData, SettingsRequest } from "@/features/settings/types";
import { sendJson } from "@/lib/api/client";

type RequestResponse = {
  alreadyPending: boolean;
  request: {
    createdAt: string;
    id: string;
    status: string;
    type: SettingsRequest["type"];
  };
};

const actionLinkClass =
  "inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-brand-strong transition-colors hover:bg-brand/[0.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export function AccountSettings({
  requests,
  source,
}: {
  requests: SettingsRequest[];
  source: SettingsData["source"];
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState<"delete" | "export" | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const readOnly = source !== "api";
  const pendingExport = requests.find(
    (request) =>
      request.type === "DATA_EXPORT" &&
      (request.status === "PENDING" || request.status === "PROCESSING"),
  );
  const pendingDeletion = requests.find(
    (request) =>
      request.type === "ACCOUNT_DELETION" &&
      (request.status === "PENDING" || request.status === "PROCESSING"),
  );

  async function createRequest(type: SettingsRequest["type"]) {
    setError("");
    setNotice("");
    setBusy(type === "ACCOUNT_DELETION" ? "delete" : "export");
    const result = await sendJson<RequestResponse>("/api/settings/requests", {
      body: { type },
      method: "POST",
    });
    setBusy(null);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setNotice(
      result.data.alreadyPending
        ? `A request is already pending. Reference ${result.data.request.id.slice(-8)}.`
        : type === "ACCOUNT_DELETION"
          ? `Deletion request received. Reference ${result.data.request.id.slice(-8)}. Support will review it against any active obligations.`
          : `Data request received. Reference ${result.data.request.id.slice(-8)}. We will contact you when it is ready.`,
    );
    if (type === "ACCOUNT_DELETION") setDeleteOpen(false);
    router.refresh();
  }

  return (
    <>
      <SettingsCard>
        <SettingsRow
          icon={Download}
          title="Your data"
          description="Request a copy of your Inverge account information, including activity and preference records."
          action={
            pendingExport ? (
              <span className="text-xs font-medium text-muted">
                Request pending
              </span>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={readOnly || busy !== null}
                onClick={() => createRequest("DATA_EXPORT")}
              >
                {busy === "export" ? "Requesting…" : "Request data"}
              </Button>
            )
          }
        />
        <SettingsRow
          icon={LogOut}
          title="Sign out"
          description="Sign out of Inverge on this device, including the wallet sign-in."
          action={
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                router.push("/sign-out");
              }}
            >
              Sign out
            </Button>
          }
        />
        <SettingsRow
          icon={Trash2}
          title="Delete account"
          description="Request deletion of your profile and personal account data. This opens a confirmation before anything is requested."
          tone="danger"
          action={
            <Button
              type="button"
              size="sm"
              variant="destructive"
              aria-haspopup="dialog"
              aria-expanded={deleteOpen}
              disabled={readOnly || Boolean(pendingDeletion)}
              onClick={() => {
                setError("");
                setNotice("");
                setDeleteOpen(true);
              }}
            >
              {pendingDeletion ? "Request pending" : "Delete account"}
            </Button>
          }
        />
      </SettingsCard>

      <p
        aria-live="polite"
        className={`min-h-5 px-4 py-2.5 text-xs leading-5 sm:px-5 ${
          error ? "text-danger" : "text-muted"
        }`}
      >
        {error || notice}
      </p>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => {
          if (busy !== "delete") setDeleteOpen(false);
        }}
        title="Request account deletion?"
        description={
          <>
            <p className="text-sm leading-6 text-muted">
              Inverge can remove eligible off-chain personal data, subject to
              legal retention requirements. Public blockchain records cannot be
              edited or deleted, and Inverge does not store raw identity
              documents.
            </p>
            <div className="rounded-xl border border-warning/25 bg-warning/[0.05] p-3 text-xs leading-5 text-muted">
              Deleting your account does not cancel an active contribution,
              refund, or campaign obligation. Contact support so those records
              are handled correctly.
            </div>
            {error ? (
              <p
                role="alert"
                className="rounded-xl border border-danger/25 bg-danger/[0.05] px-3 py-2 text-xs leading-5 text-danger"
              >
                {error}
              </p>
            ) : null}
          </>
        }
      >
        <Button
          type="button"
          size="md"
          variant="secondary"
          disabled={busy === "delete"}
          onClick={() => setDeleteOpen(false)}
        >
          Cancel
        </Button>
        <Link href="/contact" className={actionLinkClass}>
          Contact support
        </Link>
        <Button
          type="button"
          size="md"
          variant="destructive"
          disabled={readOnly || busy === "delete"}
          onClick={() => createRequest("ACCOUNT_DELETION")}
        >
          {busy === "delete" ? "Requesting…" : "Request deletion"}
        </Button>
      </ConfirmDialog>
    </>
  );
}
