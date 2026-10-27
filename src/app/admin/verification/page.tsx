import type { Metadata } from "next";
import Link from "next/link";

import {
  getAdminQueues,
  listAdminCases,
} from "@/features/verification/server/api";
import type { AdminCaseSummary } from "@/features/verification/types";

export const metadata: Metadata = {
  title: "Verification review",
  description: "Review identity, business and AML verification cases.",
  robots: { follow: false, index: false },
};

function tone(status: string): string {
  if (status === "APPROVED")
    return "bg-emerald-50 text-emerald-900 border-emerald-300";
  if (status === "ERROR" || status === "DECLINED")
    return "bg-rose-50 text-rose-900 border-rose-300";
  if (status === "IN_REVIEW" || status === "ACTION_REQUIRED")
    return "bg-amber-50 text-amber-900 border-amber-300";
  return "bg-canvas text-ink border-border";
}

function CaseTable({ rows }: { rows: AdminCaseSummary[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-canvas p-4 text-xs text-muted">
        No verification cases match this filter.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-left text-xs">
        <thead className="bg-canvas text-muted">
          <tr>
            <th scope="col" className="px-3 py-2 font-semibold">
              Account
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Type
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Status
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Risk
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Updated
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-3 py-2">
                <p className="font-semibold text-ink">
                  {row.businessName ?? row.user.email ?? row.user.id}
                </p>
                <p className="text-[11px] text-muted">
                  {row.user.email ?? row.id}
                </p>
              </td>
              <td className="px-3 py-2 text-muted">
                {row.type === "BUSINESS" ? "Business" : "Individual"}
              </td>
              <td className="px-3 py-2">
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tone(row.status)}`}
                >
                  {row.status}
                </span>
              </td>
              <td className="px-3 py-2 text-muted">{row.risk}</td>
              <td className="px-3 py-2 text-muted">
                {new Date(row.updatedAt).toLocaleString()}
              </td>
              <td className="px-3 py-2 text-right">
                <Link
                  href={`/admin/verification/${row.id}`}
                  className="inline-flex min-h-8 items-center rounded-lg border border-border px-3 font-semibold text-ink hover:border-brand/45"
                >
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminVerificationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : undefined;
  const risk = typeof params.risk === "string" ? params.risk : undefined;
  const requiresReview = params.review === "1" ? "true" : undefined;

  const [queues, cases] = await Promise.all([
    getAdminQueues(),
    listAdminCases({ status, risk, requiresReview, limit: "50" }),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header>
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-brand-strong">
          Compliance
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-ink sm:text-3xl">
          Verification review
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Identity, business and AML cases. Reviewing a screening outcome never
          changes the identity decision, and nothing here moves money or
          publishes a campaign.
        </p>
      </header>

      {!queues.ok ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-950"
        >
          {queues.message}
        </p>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {[
            { label: "Open reviews", value: queues.data.counts.reviewOpen },
            {
              label: "Provider errors",
              value: queues.data.counts.providerErrors,
            },
            {
              label: "Reconcile escalated",
              value: queues.data.counts.escalated,
            },
            { label: "Policy", value: queues.data.policyVersion },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted">
                {card.label}
              </p>
              <p className="mt-1 text-lg font-bold text-ink">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      <nav aria-label="Case filters" className="mt-5 flex flex-wrap gap-2">
        {[
          { href: "/admin/verification", label: "All" },
          { href: "/admin/verification?review=1", label: "Open reviews" },
          {
            href: "/admin/verification?status=ERROR",
            label: "Provider errors",
          },
          { href: "/admin/verification?status=IN_REVIEW", label: "In review" },
          {
            href: "/admin/verification?status=ACTION_REQUIRED",
            label: "Action required",
          },
        ].map((filter) => (
          <Link
            key={filter.href}
            href={filter.href}
            className="inline-flex min-h-9 items-center rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink hover:border-brand/45"
          >
            {filter.label}
          </Link>
        ))}
      </nav>

      <section aria-labelledby="cases-heading" className="mt-4">
        <h2 id="cases-heading" className="text-sm font-bold text-ink">
          Cases
        </h2>
        <div className="mt-2">
          {cases.ok ? (
            <CaseTable rows={cases.data.items} />
          ) : (
            <p
              role="alert"
              className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-950"
            >
              {cases.message}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
