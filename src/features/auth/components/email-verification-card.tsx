"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  maskEmail,
  type EmailVerificationStatus,
} from "@/features/auth/lib/email-verification";
import {
  postAuthPath,
  type OnboardingIntent,
} from "@/features/auth/lib/onboarding";

type Phase = "email" | "code" | "verifying" | "verified";

type ApiError = {
  error?: unknown;
  retryAfterSeconds?: unknown;
};

const ERROR_COPY: Record<string, string> = {
  EMAIL_CODE_EXPIRED: "That code has expired. Request a new one and try again.",
  EMAIL_CODE_INVALID:
    "That code isn't valid. Check the six digits and try again.",
  EMAIL_DELIVERY_FAILED:
    "We couldn't send that email just now. Wait a moment and try again.",
  EMAIL_INVALID: "Enter a complete email address, like name@example.com.",
  EMAIL_NO_ACTIVE_CODE: "Request a new code to continue.",
  EMAIL_RATE_LIMITED:
    "Too many codes requested. Try again later, or sign in with the method you used originally.",
  EMAIL_RESEND_COOLDOWN:
    "A code was just sent. Wait a moment before resending.",
  EMAIL_TOO_MANY_ATTEMPTS:
    "Too many incorrect attempts. Request a new code to continue.",
  EMAIL_UNAVAILABLE:
    "That address can't be used for this account. Try another address, or sign in the way you originally did.",
  invalid_body: "Check the address and code, then try again.",
  api_unreachable: "We couldn't reach Inverge just now. Please try again.",
  session_expired: "Your session ended. Sign in again to continue.",
};

const FALLBACK_ERROR = "Something went wrong. Please try again.";

function secondsUntil(value: string | null, now: number): number {
  if (!value) return 0;
  const target = Date.parse(value);
  if (Number.isNaN(target)) return 0;
  return Math.max(0, Math.ceil((target - now) / 1000));
}

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

export function EmailVerificationCard({
  changing,
  initialEmail,
  initialStatus,
  intent,
  returnPath,
}: {
  changing: boolean;
  initialEmail: string;
  initialStatus: EmailVerificationStatus | null;
  intent: OnboardingIntent;
  returnPath: string;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(() =>
    initialStatus?.challenge ? "code" : "email",
  );
  const [email, setEmail] = useState(
    initialStatus?.challenge?.email ?? initialStatus?.email ?? initialEmail,
  );
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [expiresAt, setExpiresAt] = useState(
    initialStatus?.challenge?.expiresAt ?? null,
  );
  const [resendAvailableAt, setResendAvailableAt] = useState(
    initialStatus?.challenge?.resendAvailableAt ?? null,
  );

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const expiresIn = secondsUntil(expiresAt, now);
  const resendIn = secondsUntil(resendAvailableAt, now);
  const masked = useMemo(() => maskEmail(email), [email]);
  const destination = masked ?? "your address";

  const finish = useCallback(
    (requiresOnboarding: boolean) => {
      setPhase("verified");
      router.replace(
        postAuthPath({
          intent,
          requiresOnboarding,
          returnPath,
        }),
      );
    },
    [intent, returnPath, router],
  );

  const readError = useCallback((status: number, body: ApiError | null) => {
    if (typeof body?.retryAfterSeconds === "number") {
      setResendAvailableAt(
        new Date(Date.now() + body.retryAfterSeconds * 1000).toISOString(),
      );
      setNow(Date.now());
    }
    const codeValue = typeof body?.error === "string" ? body.error : "";
    if (status === 401) {
      setError(ERROR_COPY.session_expired ?? FALLBACK_ERROR);
      return;
    }
    setError(ERROR_COPY[codeValue] ?? FALLBACK_ERROR);
  }, []);

  const post = useCallback(
    async (body: Record<string, unknown>): Promise<Response> =>
      fetch("/api/auth/email", {
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
    [],
  );

  async function sendCode(target: string) {
    setBusy(true);
    setError("");
    try {
      const response = await post({ action: "request", email: target });
      const body = (await response.json().catch(() => null)) as
        | {
            email?: unknown;
            expiresAt?: unknown;
            resendAvailableAt?: unknown;
            status?: unknown;
          }
        | ApiError
        | null;

      if (!response.ok) {
        readError(response.status, body as ApiError | null);
        return;
      }

      if ((body as { status?: unknown })?.status === "already_verified") {
        if (changing) {
          setError(
            "That is already your confirmed address. Enter a different one to change it.",
          );
          return;
        }
        finish(true);
        return;
      }

      const sent = body as {
        email?: unknown;
        expiresAt?: unknown;
        resendAvailableAt?: unknown;
      };
      if (typeof sent.email === "string") setEmail(sent.email);
      setExpiresAt(typeof sent.expiresAt === "string" ? sent.expiresAt : null);
      setResendAvailableAt(
        typeof sent.resendAvailableAt === "string"
          ? sent.resendAvailableAt
          : null,
      );
      setCode("");
      setNow(Date.now());
      setPhase("code");
    } catch {
      setError(ERROR_COPY.api_unreachable ?? FALLBACK_ERROR);
    } finally {
      setBusy(false);
    }
  }

  async function resendCode() {
    setBusy(true);
    setError("");
    try {
      const response = await post({ action: "resend" });
      const body = (await response.json().catch(() => null)) as
        | {
            email?: unknown;
            expiresAt?: unknown;
            resendAvailableAt?: unknown;
          }
        | ApiError
        | null;

      if (!response.ok) {
        readError(response.status, body as ApiError | null);
        return;
      }

      if (typeof (body as { email?: unknown })?.email === "string") {
        setEmail((body as { email: string }).email);
      }
      setExpiresAt(
        typeof (body as { expiresAt?: unknown }).expiresAt === "string"
          ? (body as { expiresAt: string }).expiresAt
          : null,
      );
      setResendAvailableAt(
        typeof (body as { resendAvailableAt?: unknown }).resendAvailableAt ===
          "string"
          ? (body as { resendAvailableAt: string }).resendAvailableAt
          : null,
      );
      setCode("");
      setNow(Date.now());
    } catch {
      setError(ERROR_COPY.api_unreachable ?? FALLBACK_ERROR);
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(value: string) {
    setBusy(true);
    setPhase("verifying");
    setError("");
    try {
      const response = await post({ action: "verify", code: value, email });
      const body = (await response.json().catch(() => null)) as
        { requiresOnboarding?: unknown } | ApiError | null;

      if (!response.ok) {
        readError(response.status, body as ApiError | null);
        setPhase("code");
        return;
      }

      finish(
        (body as { requiresOnboarding?: unknown })?.requiresOnboarding !==
          false,
      );
    } catch {
      setError(ERROR_COPY.api_unreachable ?? FALLBACK_ERROR);
      setPhase("code");
    } finally {
      setBusy(false);
    }
  }

  async function cancelPending() {
    setBusy(true);
    setError("");
    await post({ action: "cancel" }).catch(() => undefined);
    setBusy(false);
    setPhase("email");
    setCode("");
    setExpiresAt(null);
    setResendAvailableAt(null);
  }

  if (phase === "email") {
    return (
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!busy) void sendCode(email);
        }}
      >
        <div>
          <label
            htmlFor="email-verification-address"
            className="text-sm font-semibold text-ink"
          >
            Email address
          </label>
          <p className="mt-1 text-sm leading-6 text-muted">
            {changing
              ? "We'll send a six-digit code to the new address. Your current address stays in place until you enter it."
              : "We'll send a six-digit code. Use an address you can open now."}
          </p>
          <Input
            id="email-verification-address"
            autoComplete="email"
            className="mt-3"
            inputMode="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            required
            type="email"
            value={email}
          />
        </div>

        <Button
          className="w-full"
          disabled={busy || resendIn > 0}
          type="submit"
        >
          {resendIn > 0
            ? `Try again in ${formatCountdown(resendIn)}`
            : busy
              ? "Sending code."
              : "Send code"}
        </Button>

        <p aria-live="polite" className="min-h-5 text-xs leading-5 text-danger">
          {error}
        </p>

        <p className="text-xs leading-5 text-muted">
          If that address can receive mail, a code is on its way. Entering a
          code proves you control the address; it is not identity verification.
        </p>
      </form>
    );
  }

  if (phase === "verified") {
    return (
      <p className="text-sm leading-6 text-muted" role="status">
        Email confirmed. Taking you to the next step.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-canvas p-4">
        <p className="text-sm leading-6 text-ink">
          {expiresIn > 0
            ? `We sent a six-digit code to ${destination}.`
            : `The code sent to ${destination} has expired.`}
        </p>
        {expiresIn > 0 ? (
          <p className="mt-1 text-xs text-muted">
            Expires in {formatCountdown(expiresIn)}. It can be used once.
          </p>
        ) : null}
      </div>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!busy && code.length === 6) void verifyCode(code);
        }}
      >
        <div>
          <label
            htmlFor="email-verification-code"
            className="text-sm font-semibold text-ink"
          >
            Six-digit code
          </label>
          <Input
            id="email-verification-code"
            aria-describedby="email-verification-help"
            autoComplete="one-time-code"
            autoFocus
            className="mt-2 h-14 text-center font-mono text-2xl tracking-[0.45em]"
            inputMode="numeric"
            maxLength={6}
            name="code"
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            pattern="[0-9]{6}"
            placeholder="000000"
            required
            type="text"
            value={code}
          />
          <p id="email-verification-help" className="mt-2 text-xs text-muted">
            Paste the six digits from the email. Spaces are ignored.
          </p>
        </div>

        <Button
          className="w-full"
          disabled={busy || code.length !== 6}
          type="submit"
        >
          {phase === "verifying" ? "Confirming." : "Confirm email"}
        </Button>
      </form>

      <p aria-live="polite" className="min-h-5 text-xs leading-5 text-danger">
        {error}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          disabled={busy || resendIn > 0}
          onClick={() => void resendCode()}
          size="sm"
          type="button"
          variant="secondary"
        >
          {resendIn > 0
            ? `Resend in ${formatCountdown(resendIn)}`
            : "Resend code"}
        </Button>
        <Button
          disabled={busy}
          onClick={() => void cancelPending()}
          size="sm"
          type="button"
          variant="ghost"
        >
          Use a different email
        </Button>
      </div>

      <p className="text-xs leading-5 text-muted">
        Didn&apos;t get it? Check the spam folder and confirm the address is
        spelled correctly. A code expires after 10 minutes.
      </p>
    </div>
  );
}
