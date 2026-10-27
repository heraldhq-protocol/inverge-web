"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ResolveRiskForm({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/verification/admin/cases/${encodeURIComponent(caseId)}/resolve`,
        {
          body: JSON.stringify({
            decision: form.get("decision"),
            reason: String(form.get("reason") ?? "").trim(),
            reasonCode: String(form.get("reasonCode") ?? "").trim(),
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
      );
      const payload = (await response.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      if (!response.ok) {
        setError(
          payload?.error?.message ?? "The review could not be recorded.",
        );
        return;
      }
      setDone(true);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const field =
    "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      className="mt-4 rounded-xl border border-border bg-canvas p-4"
    >
      <h2 className="text-sm font-bold text-ink">Record a review outcome</h2>
      <p className="mt-1 text-xs leading-5 text-muted">
        A human decision is required. Confirming a match flags the account for
        funds and keeps the identity outcome unchanged; clearing it lifts the
        screening block.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-ink">
          Decision
          <select
            name="decision"
            required
            className={field}
            defaultValue="CLEAR"
          >
            <option value="CLEAR">False positive — clear screening</option>
            <option value="CONFIRM_MATCH">Confirmed match — block funds</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-ink">
          Reason code
          <select
            name="reasonCode"
            required
            className={field}
            defaultValue="FALSE_POSITIVE"
          >
            <option value="FALSE_POSITIVE">False positive</option>
            <option value="CONFIRMED_MATCH">Confirmed match</option>
            <option value="INSUFFICIENT_EVIDENCE">Insufficient evidence</option>
            <option value="CUSTOMER_CLARIFICATION">
              Customer clarification
            </option>
            <option value="OTHER">Other (explain below)</option>
          </select>
        </label>
      </div>
      <label className="mt-3 block text-xs font-semibold text-ink">
        Reasoning
        <textarea
          name="reason"
          required
          minLength={5}
          maxLength={500}
          rows={3}
          className={field}
          placeholder="What did you review, and why is this the outcome?"
        />
      </label>
      {error ? (
        <p role="alert" className="mt-3 text-xs font-semibold text-rose-700">
          {error}
        </p>
      ) : null}
      {done ? (
        <p
          role="status"
          className="mt-3 text-xs font-semibold text-emerald-800"
        >
          Outcome recorded and audited.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Recording…" : "Record outcome"}
      </button>
    </form>
  );
}
