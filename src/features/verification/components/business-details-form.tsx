"use client";

import { useState } from "react";

export function BusinessDetailsForm({
  disabled,
  onStarted,
}: {
  disabled: boolean;
  onStarted: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/verification/business", {
        body: JSON.stringify({
          country: String(form.get("country") ?? "").trim() || undefined,
          legalName: String(form.get("legalName") ?? "").trim(),
          registrationNumber:
            String(form.get("registrationNumber") ?? "").trim() || undefined,
          representativeName:
            String(form.get("representativeName") ?? "").trim() || undefined,
          representativeRole:
            String(form.get("representativeRole") ?? "").trim() || undefined,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as {
        verificationUrl?: string;
        error?: { message?: string };
      } | null;
      if (!response.ok || !payload?.verificationUrl) {
        setError(
          payload?.error?.message ??
            "Business verification could not be started.",
        );
        return;
      }
      onStarted(payload.verificationUrl);
    } finally {
      setBusy(false);
    }
  }

  const field =
    "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-normal text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

  return (
    <form
      id="business-details"
      onSubmit={(event) => void onSubmit(event)}
      className="mt-6 rounded-xl border border-border bg-canvas p-4"
    >
      <h3 className="text-sm font-bold text-ink">Business details</h3>
      <p className="mt-1 text-xs leading-5 text-muted">
        Use the registered legal name. The provider checks the registry,
        documents, directors and beneficial owners.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-ink">
          Legal name
          <input
            name="legalName"
            required
            minLength={2}
            maxLength={200}
            className={field}
          />
        </label>
        <label className="text-xs font-semibold text-ink">
          Registration number
          <input name="registrationNumber" maxLength={100} className={field} />
        </label>
        <label className="text-xs font-semibold text-ink">
          Country of registration
          <input
            name="country"
            maxLength={3}
            placeholder="NG"
            className={`${field} uppercase`}
          />
        </label>
        <label className="text-xs font-semibold text-ink">
          Representative name
          <input name="representativeName" maxLength={200} className={field} />
        </label>
        <label className="text-xs font-semibold text-ink">
          Representative role
          <input
            name="representativeRole"
            maxLength={120}
            placeholder="Director"
            className={field}
          />
        </label>
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-xs font-semibold text-rose-700">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={disabled || busy}
        className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Starting…" : "Save and start business verification"}
      </button>
    </form>
  );
}
