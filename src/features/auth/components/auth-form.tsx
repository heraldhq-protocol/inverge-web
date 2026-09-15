"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { inputClass } from "@/components/ui/input";
import type { AuthMode } from "@/features/auth/types";

const fieldClass = inputClass;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function PrivyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="size-4 shrink-0"
      aria-hidden="true"
    >
      <rect width="24" height="24" rx="6" fill="#1F1F1E" />
      <path
        d="M8.5 7.5H13.5C15.1569 7.5 16.5 8.84315 16.5 10.5C16.5 12.1569 15.1569 13.5 13.5 13.5H11V16.5H8.5V7.5ZM11 11.5H13.5C14.0523 11.5 14.5 11.0523 14.5 10.5C14.5 9.94772 14.0523 9.5 13.5 9.5H11V11.5Z"
        fill="white"
      />
    </svg>
  );
}

function ProviderButton({
  provider,
  onSelect,
}: {
  provider: "Privy" | "Google";
  onSelect: (provider: "Privy" | "Google") => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(provider)}
      aria-label={`Continue with ${provider}`}
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand sm:min-h-12"
    >
      {provider === "Privy" ? <PrivyIcon /> : <GoogleIcon />}
      <span>
        <span className="hidden sm:inline">Continue with </span>
        {provider}
      </span>
    </button>
  );
}

function PasswordField({
  id,
  label,
  name,
  autoComplete,
  describedBy,
}: {
  id: string;
  label: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  describedBy?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={isVisible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          aria-describedby={describedBy}
          className={`${fieldClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          className="absolute inset-y-0 right-1 inline-flex min-w-11 items-center justify-center rounded-lg text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
          aria-label={`${isVisible ? "Hide" : "Show"} ${label.toLowerCase()}`}
        >
          {isVisible ? (
            <EyeOff className="size-4.5" aria-hidden="true" />
          ) : (
            <Eye className="size-4.5" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const isSignUp = mode === "sign-up";
  const router = useRouter();
  const [status, setStatus] = useState("");

  function handleProvider(provider: "Privy" | "Google") {
    setStatus(
      `${provider} authentication will be connected in the integration step.`,
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSignUp) {
      const data = new FormData(event.currentTarget);
      if (data.get("password") !== data.get("confirmPassword")) {
        setStatus(
          "Your passwords do not match. Please check them and try again.",
        );
        return;
      }
    }

    setStatus("");
    router.push(`/verify-email?flow=${mode}`);
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <ProviderButton provider="Privy" onSelect={handleProvider} />
        <ProviderButton provider="Google" onSelect={handleProvider} />
      </div>

      <div className="my-4 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
          or continue with email
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
        {isSignUp ? (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="first-name"
                className="block text-sm font-semibold text-ink"
              >
                First name
              </label>
              <input
                id="first-name"
                name="firstName"
                required
                autoComplete="given-name"
                placeholder="Ada"
                className={fieldClass}
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="last-name"
                className="block text-sm font-semibold text-ink"
              >
                Last name
              </label>
              <input
                id="last-name"
                name="lastName"
                required
                autoComplete="family-name"
                placeholder="Okafor"
                className={fieldClass}
              />
            </div>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-ink"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            className={fieldClass}
          />
        </div>

        <PasswordField
          id="password"
          name="password"
          label="Password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          {...(isSignUp ? { describedBy: "password-hint" } : {})}
        />

        {isSignUp ? (
          <>
            <p
              id="password-hint"
              className="-mt-2 text-xs leading-normal text-muted"
            >
              Use a strong password that you do not use elsewhere.
            </p>
            <PasswordField
              id="confirm-password"
              name="confirmPassword"
              label="Confirm password"
              autoComplete="new-password"
            />
          </>
        ) : null}

        <button
          type="submit"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand sm:min-h-12"
        >
          {isSignUp ? "Create account" : "Sign in"}
        </button>

        <p
          aria-live="polite"
          className="min-h-5 text-center text-xs leading-5 text-muted"
        >
          {status}
        </p>
      </form>

      <p className="mt-3.5 text-center text-sm text-muted sm:mt-4">
        {isSignUp ? "Already have an account?" : "New to Inverge?"}{" "}
        <Link
          href={isSignUp ? "/sign-in" : "/sign-up"}
          className="font-semibold text-brand-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand"
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>

      {isSignUp ? (
        <p className="mt-4 text-center text-xs leading-5 text-muted sm:mt-5">
          By creating an account, you agree to Inverge&apos;s{" "}
          <Link
            href="/terms"
            className="font-medium text-ink underline underline-offset-3"
          >
            Terms of Use
          </Link>{" "}
          and acknowledge the{" "}
          <Link
            href="/privacy"
            className="font-medium text-ink underline underline-offset-3"
          >
            Privacy Policy
          </Link>
          .
        </p>
      ) : null}
    </>
  );
}
