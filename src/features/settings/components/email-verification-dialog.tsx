"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/features/settings/components/confirm-dialog";
import type {
  EmailVerificationChallenge,
  SettingsAccount,
  SettingsData,
} from "@/features/settings/types";
import { sendJson } from "@/lib/api/client";

type Step = "email" | "code" | "done";

type RequestCodeResponse =
  | { status: "already_verified"; email: string }
  | {
      status: "code_sent";
      email: string;
      expiresAt: string;
      resendAvailableAt: string;
    };

type VerifyCodeResponse =
  | { status: "already_verified"; email: string }
  | { status: "verified"; email: string; verifiedAt: string };

export function EmailVerificationDialog({
  account,
  challenge,
  onClose,
  open,
  pendingEmail,
  source,
}: {
  account: SettingsAccount;
  challenge: EmailVerificationChallenge | null;
  onClose: () => void;
  open: boolean;
  pendingEmail: string | null;
  source: SettingsData["source"];
}) {
  const router = useRouter();
  const formId = useId();
  const initialEmail = challenge?.email ?? pendingEmail ?? account.email ?? "";
  const [step, setStep] = useState<Step>(challenge ? "code" : "email");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [sentTo, setSentTo] = useState(initialEmail);
  const [busy, setBusy] = useState<"request" | "verify" | "resend" | null>(
    null,
  );
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const readOnly = source !== "api";

  async function requestCode(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (readOnly) {
      setError(
        "Email verification needs a live account. This preview is read-only.",
      );
      return;
    }
    const target = email.trim();
    if (!target) {
      setError("Enter the email address you want to use.");
      return;
    }

    setBusy("request");
    setError("");
    setNotice("");
    const result = await sendJson<RequestCodeResponse>(
      "/api/settings/email/request",
      { body: { email: target }, method: "POST" },
    );

    if (!result.ok) {
      setBusy(null);
      setError(result.message);
      return;
    }

    setBusy(null);
    if (result.data.status === "already_verified") {
      setNotice("That address is already verified.");
      setStep("done");
      router.refresh();
      return;
    }

    setSentTo(result.data.email);
    setStep("code");
    setNotice("Enter the six-digit code from the email.");
    router.refresh();
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (readOnly) return;
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the six-digit code from the email.");
      return;
    }

    setBusy("verify");
    setError("");
    const result = await sendJson<VerifyCodeResponse>(
      "/api/settings/email/verify",
      { body: { code: code.trim(), email: sentTo }, method: "POST" },
    );

    if (!result.ok) {
      setBusy(null);
      setError(result.message);
      return;
    }

    setBusy(null);
    setNotice(
      result.data.status === "already_verified"
        ? "That address is already verified."
        : "Email verified.",
    );
    setStep("done");
    router.refresh();
  }

  async function resend() {
    if (readOnly) return;
    setBusy("resend");
    setError("");
    setNotice("");
    const result = await sendJson<RequestCodeResponse>(
      "/api/settings/email/resend",
      { method: "POST" },
    );

    if (!result.ok) {
      setBusy(null);
      setError(result.message);
      return;
    }

    setBusy(null);
    if (result.data.status === "code_sent") {
      setNotice("A new code is on its way.");
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title={step === "done" ? "Email updated" : "Verify your email"}
      description={
        <>
          <p className="text-sm leading-6 text-muted">
            {step === "done"
              ? "Your account now reflects the verified address."
              : challenge
                ? `Enter the code sent to ${challenge.email}. Codes expire after a short window and can be used once.`
                : "We will send a six-digit code to this address. The current address stays in place until the new one is confirmed."}
          </p>

          {step !== "done" ? (
            <form
              id={formId}
              onSubmit={step === "email" ? requestCode : verifyCode}
              className="space-y-3"
            >
              {step === "code" ? (
                <>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="settings-email-code"
                      className="text-sm font-semibold text-ink"
                    >
                      Verification code
                    </label>
                    <Input
                      id="settings-email-code"
                      name="code"
                      value={code}
                      onChange={(event) =>
                        setCode(event.target.value.replace(/\D/g, ""))
                      }
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="\d{6}"
                      maxLength={6}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={busy !== null || readOnly}
                      onClick={resend}
                    >
                      {busy === "resend" ? "Sending…" : "Resend code"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={busy !== null || readOnly}
                      onClick={() => {
                        setStep("email");
                        setCode("");
                        setError("");
                        setNotice("");
                      }}
                    >
                      Use a different address
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <label
                    htmlFor="settings-email-address"
                    className="text-sm font-semibold text-ink"
                  >
                    Email address
                  </label>
                  <Input
                    id="settings-email-address"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    maxLength={254}
                    required
                    autoFocus
                  />
                  <p className="text-xs leading-5 text-muted">
                    Changing this address requires confirmation from the new
                    inbox.
                  </p>
                </div>
              )}
            </form>
          ) : null}

          {notice ? (
            <p
              role="status"
              className="rounded-xl border border-brand/20 bg-brand/[0.06] px-3 py-2 text-xs leading-5 text-brand-strong"
            >
              {notice}
            </p>
          ) : null}
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
      {step === "done" ? (
        <Button type="button" size="md" onClick={onClose}>
          Done
        </Button>
      ) : (
        <>
          <Button
            type="button"
            size="md"
            variant="secondary"
            onClick={onClose}
            disabled={busy !== null}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="md"
            form={formId}
            disabled={busy !== null || readOnly}
          >
            {busy === "request" || busy === "verify" ? (
              <Loader2
                className="mr-1.5 size-4 motion-safe:animate-spin"
                aria-hidden="true"
              />
            ) : null}
            {step === "email" ? "Send code" : "Verify email"}
          </Button>
        </>
      )}
    </ConfirmDialog>
  );
}
