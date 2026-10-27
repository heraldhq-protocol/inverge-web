import type { Metadata } from "next";
import Link from "next/link";

import { ResolveRiskForm } from "@/features/verification/components/resolve-risk-form";
import { getAdminCase } from "@/features/verification/server/api";

export const metadata: Metadata = {
  title: "Verification case",
  robots: { follow: false, index: false },
};

export default async function AdminVerificationCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getAdminCase(id);

  if (!result.ok) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/admin/verification"
          className="text-xs font-semibold text-muted hover:text-ink"
        >
          ← Verification review
        </Link>
        <p
          role="alert"
          className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-950"
        >
          {result.message}
        </p>
      </div>
    );
  }

  const { business, case: record, events, user } = result.data;
  const openReview =
    record.requiresHumanReview ||
    record.riskOutcome === "REVIEW" ||
    record.riskOutcome === "FLAGGED";

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Link
        href="/admin/verification"
        className="text-xs font-semibold text-muted hover:text-ink"
      >
        ← Verification review
      </Link>
      <header className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-brand-strong">
            Case {record.id}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-ink">
            {business?.legalName ?? user.email ?? user.id}
          </h1>
          <p className="mt-1 text-xs text-muted">
            {record.type === "BUSINESS" ? "Business (KYB)" : "Individual (KYC)"}{" "}
            · {new Date(record.createdAt).toLocaleString()} · attempt{" "}
            {record.attempt}
          </p>
        </div>
        <span className="inline-flex rounded-full border border-border bg-canvas px-3 py-1 text-xs font-semibold text-ink">
          {record.status}
        </span>
      </header>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Risk", value: record.riskOutcome },
          { label: "Provider status", value: record.providerStatus ?? "—" },
          {
            label: "Last sync",
            value: record.lastProviderSyncAt
              ? new Date(record.lastProviderSyncAt).toLocaleString()
              : "Never",
          },
          {
            label: "Reconcile",
            value: `${record.reconcileAttempts} attempt(s)`,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted">
              {card.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">{card.value}</p>
          </div>
        ))}
      </div>

      <section
        aria-labelledby="subject"
        className="mt-5 rounded-xl border border-border bg-surface p-4"
      >
        <h2 id="subject" className="text-sm font-bold text-ink">
          Subject
        </h2>
        <dl className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-muted">Account</dt>
            <dd className="text-ink">{user.email ?? user.id}</dd>
          </div>
          <div>
            <dt className="font-semibold text-muted">Role</dt>
            <dd className="text-ink">{user.role}</dd>
          </div>
          <div>
            <dt className="font-semibold text-muted">Legacy KYC</dt>
            <dd className="text-ink">{user.kycStatus}</dd>
          </div>
          <div>
            <dt className="font-semibold text-muted">Legacy AML</dt>
            <dd className="text-ink">{user.amlStatus}</dd>
          </div>
          {business ? (
            <>
              <div>
                <dt className="font-semibold text-muted">Registration</dt>
                <dd className="text-ink">
                  {business.registrationNumber ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-muted">Country</dt>
                <dd className="text-ink">{business.country ?? "—"}</dd>
              </div>
            </>
          ) : null}
        </dl>
        <p className="mt-3 rounded-lg bg-canvas p-3 text-[11px] leading-5 text-muted">
          No identity document, selfie or provider report is stored in Inverge.
          Provider session{" "}
          <span className="font-mono">{record.providerSessionId}</span> is a
          reference only.
        </p>
        {record.lastErrorCode ? (
          <p className="mt-2 text-[11px] leading-5 text-muted">
            Error code <span className="font-mono">{record.lastErrorCode}</span>
            {record.lastErrorMessage ? ` — ${record.lastErrorMessage}` : ""}
          </p>
        ) : null}
      </section>

      {openReview ? (
        <ResolveRiskForm caseId={record.id} />
      ) : (
        <p className="mt-4 rounded-xl border border-border bg-canvas p-4 text-xs text-muted">
          This case has no open risk review. Screening outcomes are resolved by
          an authorised reviewer only.
        </p>
      )}

      <section aria-labelledby="history" className="mt-5">
        <h2 id="history" className="text-sm font-bold text-ink">
          History
        </h2>
        <div className="mt-2 overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-canvas text-muted">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">
                  When
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Event
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Transition
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Source
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Reason
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="px-3 py-2 text-muted">
                    {new Date(event.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-ink">
                    {event.eventType}
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {event.previousStatus ?? "—"} → {event.newStatus ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-muted">{event.source}</td>
                  <td className="px-3 py-2 text-muted">
                    {event.reasonCode ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
