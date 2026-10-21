"use client";

import { Building2, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authHref } from "@/features/auth/lib/auth-routes";
import {
  type AccountType,
  PROFILE_ONBOARDING_PATH,
} from "@/features/auth/lib/onboarding";

type Availability = "idle" | "checking" | "available" | "taken" | "unreachable";

type Phase = "idle" | "saving" | "error";

type InvalidField = "accountType" | "contact" | "name" | "username" | null;

const ACCOUNT_TYPE_OPTIONS = {
  individual: {
    description: "For your own ideas, feedback, and backing.",
    icon: UserRound,
    label: "Just me",
  },
  business: {
    description: "For a company, studio, or organisation.",
    icon: Building2,
    label: "A business",
  },
} as const;

const ERROR_COPY: Record<string, string> = {
  api_not_configured:
    "Saving your profile is not connected to the Inverge service in this environment.",
  api_unreachable:
    "Inverge could not be reached. Check your connection and try again.",
  invalid_body: "Check the account details and username, then try again.",
  profile_rejected:
    "Those details could not be saved. Check the account details and username.",
  username_taken: "That username is already taken. Try another.",
};

type ProfileOnboardingFormProps = {
  initialAccountType?: AccountType | null;
  initialContactName?: string;
  initialDisplayName: string;
  initialUsername: string;
  /**
   * Preview mode can store an account type and business contact locally. Live
   * mode cannot: the API has no field for either yet, so it keeps the original
   * shared name/username form rather than collecting data it would discard.
   */
  preview?: boolean;
};

export function ProfileOnboardingForm({
  initialAccountType,
  initialContactName = "",
  initialDisplayName,
  initialUsername,
  preview = false,
}: ProfileOnboardingFormProps) {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType | null>(
    preview ? (initialAccountType ?? null) : "individual",
  );
  const [individualName, setIndividualName] = useState(
    initialAccountType === "business" ? initialContactName : initialDisplayName,
  );
  const [businessName, setBusinessName] = useState(
    initialAccountType === "business" ? initialDisplayName : "",
  );
  const [contactName, setContactName] = useState(initialContactName);
  const [username, setUsername] = useState(initialUsername);
  const [availability, setAvailability] = useState<Availability>("idle");
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [invalidField, setInvalidField] = useState<InvalidField>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  const publicName = accountType === "business" ? businessName : individualName;

  function clearError() {
    if (phase === "error") {
      setErrorMessage("");
      setInvalidField(null);
      setSessionExpired(false);
      setPhase("idle");
    }
  }

  function chooseAccountType(value: AccountType) {
    setAccountType(value);
    clearError();
  }

  function handleUsernameChange(value: string) {
    setUsername(value);
    setAvailability("idle");
    clearError();
  }

  async function checkUsername() {
    const candidate = username.trim().toLowerCase();

    if (
      candidate.length < 3 ||
      !/^[a-z0-9_-]+$/.test(candidate) ||
      candidate === initialUsername.toLowerCase()
    ) {
      setAvailability("idle");
      return;
    }

    setAvailability("checking");

    try {
      const response = await fetch(
        `/api/auth/username-available?username=${encodeURIComponent(candidate)}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        setAvailability("unreachable");
        return;
      }

      const body = (await response.json().catch(() => null)) as {
        available?: unknown;
      } | null;

      setAvailability(
        body?.available === true
          ? "available"
          : body?.available === false
            ? "taken"
            : "unreachable",
      );
    } catch {
      setAvailability("unreachable");
    }
  }

  function showError(message: string, field: InvalidField = null) {
    setSessionExpired(false);
    setInvalidField(field);
    setErrorMessage(message);
    setPhase("error");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanPublicName = publicName.trim();
    const cleanContactName = contactName.trim();
    const cleanUsername = username.trim().toLowerCase();

    if (preview && !accountType) {
      showError(
        "Choose whether this account is for you or a business.",
        "accountType",
      );
      return;
    }

    if (cleanPublicName.length === 0) {
      showError(
        accountType === "business"
          ? "Add your business name."
          : "Add your name.",
        "name",
      );
      return;
    }

    if (
      preview &&
      accountType === "business" &&
      cleanContactName.length === 0
    ) {
      showError("Add the name of the person managing this account.", "contact");
      return;
    }

    if (!/^[a-z0-9_-]{3,30}$/.test(cleanUsername)) {
      showError(
        "Choose a username of at least 3 characters using letters, numbers, hyphens, or underscores.",
        "username",
      );
      return;
    }

    setPhase("saving");
    setErrorMessage("");
    setSessionExpired(false);

    try {
      const response = await fetch("/api/auth/profile", {
        body: JSON.stringify({
          ...(preview && accountType
            ? {
                accountType,
                ...(accountType === "business"
                  ? { contactName: cleanContactName }
                  : {}),
              }
            : {}),
          displayName: cleanPublicName,
          username: cleanUsername,
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });

      const body = (await response.json().catch(() => null)) as {
        error?: unknown;
        nextPath?: unknown;
      } | null;

      if (!response.ok) {
        const code = typeof body?.error === "string" ? body.error : "";
        setSessionExpired(code === "session_expired");
        setInvalidField(code === "username_taken" ? "username" : null);
        setErrorMessage(
          code === "session_expired"
            ? "Your session has expired. Sign in again to finish setting up your profile."
            : (ERROR_COPY[code] ??
                "Your profile could not be saved. Try again."),
        );
        setPhase("error");
        return;
      }

      // Only a same-site path returned by this app is followed.
      const nextPath =
        typeof body?.nextPath === "string" && body.nextPath.startsWith("/")
          ? body.nextPath
          : "/d";

      router.replace(nextPath);
      router.refresh();
    } catch {
      setInvalidField(null);
      setErrorMessage(
        ERROR_COPY.api_unreachable ??
          "Inverge could not be reached. Check your connection and try again.",
      );
      setPhase("error");
    }
  }

  const saving = phase === "saving";
  const NameIcon = accountType === "business" ? Building2 : UserRound;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="flex items-center gap-4">
        <div
          className="grid size-16 shrink-0 place-items-center rounded-full bg-canvas text-muted sm:size-20"
          aria-hidden="true"
        >
          <NameIcon className="size-8 sm:size-9" strokeWidth={1.5} />
        </div>
        <p className="max-w-64 text-xs leading-5 text-muted">
          A profile photo or logo can be added later in account settings.
        </p>
      </div>

      {preview ? (
        <fieldset
          className="space-y-2"
          aria-describedby={
            phase === "error" && invalidField === "accountType"
              ? "profile-error"
              : undefined
          }
        >
          <legend className="text-sm font-semibold text-ink">
            Who is this account for?
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(ACCOUNT_TYPE_OPTIONS) as AccountType[]).map(
              (value) => {
                const option = ACCOUNT_TYPE_OPTIONS[value];
                const Icon = option.icon;

                return (
                  <label key={value} className="group relative flex h-full">
                    <input
                      type="radio"
                      name="accountType"
                      value={value}
                      checked={accountType === value}
                      onChange={() => chooseAccountType(value)}
                      className="peer sr-only"
                    />
                    <span className="flex h-full min-h-11 cursor-pointer items-start gap-2.5 rounded-xl border border-border bg-surface p-3.5 transition-colors hover:border-brand/45 peer-checked:border-brand peer-checked:bg-brand/[0.035] peer-checked:ring-1 peer-checked:ring-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-brand">
                      <Icon
                        className="mt-0.5 size-4 shrink-0 text-brand-strong"
                        aria-hidden="true"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-ink">
                          {option.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-normal text-muted">
                          {option.description}
                        </span>
                      </span>
                    </span>
                  </label>
                );
              },
            )}
          </div>
        </fieldset>
      ) : null}

      {accountType === "business" ? (
        <>
          <div className="space-y-1.5">
            <label
              htmlFor="business-name"
              className="block text-sm font-semibold text-ink"
            >
              Business name
            </label>
            <Input
              id="business-name"
              name="businessName"
              required
              autoComplete="organization"
              placeholder="Amara Studio"
              value={businessName}
              maxLength={50}
              aria-invalid={invalidField === "name"}
              onChange={(event) => {
                setBusinessName(event.target.value);
                clearError();
              }}
            />
            <p className="text-xs leading-normal text-muted">
              This is the name supporters will see on your campaigns and
              profile.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="contact-name"
              className="block text-sm font-semibold text-ink"
            >
              Your name
            </label>
            <Input
              id="contact-name"
              name="contactName"
              required
              autoComplete="name"
              placeholder="Amara Okonkwo"
              value={contactName}
              maxLength={50}
              aria-invalid={invalidField === "contact"}
              onChange={(event) => {
                setContactName(event.target.value);
                clearError();
              }}
            />
            <p className="text-xs leading-normal text-muted">
              For your account details. This is not shown publicly.
            </p>
          </div>
        </>
      ) : accountType === "individual" ? (
        <div className="space-y-1.5">
          <label
            htmlFor="display-name"
            className="block text-sm font-semibold text-ink"
          >
            {preview ? "Your name" : "Display name"}
          </label>
          <Input
            id="display-name"
            name="displayName"
            required
            autoComplete="name"
            placeholder="Amara Okonkwo"
            value={individualName}
            maxLength={50}
            aria-invalid={invalidField === "name"}
            onChange={(event) => {
              setIndividualName(event.target.value);
              clearError();
            }}
          />
          <p className="text-xs leading-normal text-muted">
            This is the name people will see on your ideas, feedback, and
            profile.
          </p>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label
          htmlFor="username"
          className="block text-sm font-semibold text-ink"
        >
          Username
        </label>
        <Input
          id="username"
          name="username"
          required
          autoComplete="username"
          minLength={3}
          maxLength={30}
          pattern="[a-z0-9_-]+"
          placeholder="amara-okonkwo"
          value={username}
          aria-describedby="username-hint username-status"
          aria-invalid={availability === "taken" || invalidField === "username"}
          onChange={(event) =>
            handleUsernameChange(event.target.value.toLowerCase())
          }
          onBlur={() => void checkUsername()}
        />
        <p id="username-hint" className="text-xs leading-normal text-muted">
          Use lowercase letters, numbers, hyphens, or underscores for your
          public profile.
        </p>
        <p
          id="username-status"
          role="status"
          aria-live="polite"
          className="min-h-5 text-xs leading-normal text-muted"
        >
          {availability === "checking"
            ? "Checking availability…"
            : availability === "available"
              ? "That username is available."
              : availability === "taken"
                ? "That username is already taken. Try another."
                : availability === "unreachable"
                  ? "Availability could not be checked. You can still continue."
                  : ""}
        </p>
      </div>

      <div className="min-h-5">
        {phase === "error" ? (
          <p
            id="profile-error"
            role="alert"
            className="text-xs leading-5 text-danger"
          >
            {errorMessage}{" "}
            {sessionExpired ? (
              <Link
                href={authHref(PROFILE_ONBOARDING_PATH)}
                className="font-semibold text-ink underline underline-offset-3"
              >
                Sign in
              </Link>
            ) : null}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={saving}
        aria-busy={saving}
      >
        {saving ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
