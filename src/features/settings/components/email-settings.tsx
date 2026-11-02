"use client";

import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmailVerificationDialog } from "@/features/settings/components/email-verification-dialog";
import { SettingsRow } from "@/features/settings/components/settings-row";
import { SettingsCard } from "@/features/settings/components/settings-section";
import type {
  EmailVerificationChallenge,
  SettingsAccount,
  SettingsData,
} from "@/features/settings/types";
import { sendJson } from "@/lib/api/client";

export function EmailSettings({
  account,
  challenge,
  fallbackEmail,
  pendingEmail,
  source,
}: {
  account: SettingsAccount;
  challenge: EmailVerificationChallenge | null;
  fallbackEmail: string;
  pendingEmail: string | null;
  source: SettingsData["source"];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const email = account.email ?? fallbackEmail;
  const verified = account.emailVerified;
  const hasEmail = email.length > 0;

  async function cancelPending() {
    setCancelling(true);
    setNotice("");
    setError("");
    const result = await sendJson<{ pendingEmail: null }>(
      "/api/settings/email/pending",
      { method: "DELETE" },
    );
    setCancelling(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setNotice("Pending email change cancelled.");
    router.refresh();
  }

  return (
    <>
      <SettingsCard>
        <SettingsRow
          icon={Mail}
          title="Account email"
          description={
            hasEmail
              ? `${email} · Used for account notices, receipts and security alerts.`
              : "No email is stored on this account yet. Add one to receive account notices and receipts."
          }
          action={
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <StatusBadge
                variant={
                  verified ? "success" : hasEmail ? "warning" : "neutral"
                }
              >
                {verified ? "Verified" : hasEmail ? "Not verified" : "No email"}
              </StatusBadge>
              {pendingEmail ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={cancelling || source !== "api"}
                  onClick={cancelPending}
                >
                  {cancelling ? "Cancelling…" : "Cancel change"}
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setNotice("");
                  setError("");
                  setOpen(true);
                }}
              >
                {pendingEmail
                  ? "Finish change"
                  : challenge
                    ? "Enter code"
                    : verified
                      ? "Change email"
                      : hasEmail
                        ? "Verify email"
                        : "Add email"}
              </Button>
            </div>
          }
        />
      </SettingsCard>

      {pendingEmail ? (
        <p className="px-4 py-2.5 text-xs leading-5 text-warning-strong sm:px-5">
          Waiting for confirmation at {pendingEmail}. Your current address stays
          active until the new one is verified.
        </p>
      ) : (
        <p
          aria-live="polite"
          className="min-h-5 px-4 py-2.5 text-xs leading-5 text-muted sm:px-5"
        >
          {notice ||
            error ||
            "Changing your email requires a six-digit code from the new inbox before it becomes the account address."}
        </p>
      )}

      {open ? (
        <EmailVerificationDialog
          account={account}
          challenge={challenge}
          onClose={() => setOpen(false)}
          open={open}
          pendingEmail={pendingEmail}
          source={source}
        />
      ) : null}
    </>
  );
}
