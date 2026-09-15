"use client";

import { LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  useRef,
  useState,
} from "react";

import type { AuthMode } from "@/features/auth/types";

const codeLength = 6;

export function EmailVerificationForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [digits, setDigits] = useState(() =>
    Array<string>(codeLength).fill(""),
  );
  const [status, setStatus] = useState("");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const returnPath = mode === "sign-up" ? "/sign-up" : "/sign-in";

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);

    setDigits((current) =>
      current.map((currentDigit, currentIndex) =>
        currentIndex === index ? digit : currentDigit,
      ),
    );
    setStatus("");

    if (digit && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < codeLength - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLFormElement>) {
    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, codeLength)
      .split("");

    if (pastedDigits.length === 0) {
      return;
    }

    event.preventDefault();
    setDigits(
      Array.from(
        { length: codeLength },
        (_, index) => pastedDigits[index] ?? "",
      ),
    );
    setStatus("");
    inputRefs.current[Math.min(pastedDigits.length, codeLength) - 1]?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (digits.some((digit) => digit === "")) {
      setStatus("Enter all six digits from your verification email.");
      return;
    }

    setStatus("");
    router.push("/onboarding/profile");
  }

  function handleResend() {
    setStatus("A new code will be requested when authentication is connected.");
  }

  return (
    <form onSubmit={handleSubmit} onPaste={handlePaste}>
      <fieldset>
        <legend className="sr-only">Six-digit verification code</legend>
        <div className="grid grid-cols-6 gap-2 sm:gap-3">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              value={digit}
              onChange={(event) => updateDigit(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              type="text"
              name={`code-${index + 1}`}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${index + 1} of ${codeLength}`}
              className="h-12 min-w-0 rounded-xl border border-border bg-surface text-center font-mono text-xl font-semibold text-ink outline-none transition-colors placeholder:text-muted/40 hover:border-muted/45 focus:border-brand focus:ring-3 focus:ring-brand/12 sm:h-14 sm:text-2xl"
            />
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand sm:min-h-12"
      >
        Verify email
      </button>

      <p
        aria-live="polite"
        className="mt-2 min-h-5 text-center text-xs leading-5 text-muted"
      >
        {status}
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-center text-sm text-muted">
        <p>
          Didn&apos;t get a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            className="font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
          >
            Resend code
          </button>
        </p>
        <span className="hidden text-border sm:inline" aria-hidden="true">
          •
        </span>
        <Link
          href={returnPath}
          className="inline-flex min-h-9 items-center font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
        >
          Use a different email
        </Link>
      </div>

      <div className="my-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted sm:my-5">
        <LockKeyhole
          className="size-3.5 shrink-0 text-muted/70"
          aria-hidden="true"
        />
        <span>Verification codes expire after a short time.</span>
      </div>

      <p className="text-center text-sm text-muted">
        Having trouble?{" "}
        <Link
          href="/contact"
          className="font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
        >
          Contact support
        </Link>
      </p>
    </form>
  );
}
