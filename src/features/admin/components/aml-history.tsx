import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { adminFieldClass } from "@/features/admin/components/admin-workspace-ui";
import {
  AML_KINDS,
  AML_KIND_LABELS,
  AML_SOURCE_LABELS,
  AML_STATUS_LABELS,
  AML_STATUS_TONES,
  isAmlKind,
  type AmlKind,
} from "@/features/admin/lib/aml";
import { formatAccessDate } from "@/features/admin/lib/access-requests";
import type { AmlHistoryRead } from "@/features/admin/server/aml";

/**
 * The screening history is read on the server for one subject. This lookup is
 * a plain GET form, so a subject search is a normal page navigation with the
 * result visible in the address bar.
 */
export function AmlHistorySection({
  subject,
  kind,
  read,
}: {
  subject: string;
  kind: AmlKind;
  read: AmlHistoryRead | null;
}) {
  return (
    <section
      aria-label="Screening history"
      className="mt-10 rounded-xl border border-border bg-surface p-5 sm:p-6"
    >
      <h2 className="text-lg font-semibold text-ink">Screening history</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
        Load the screenings the service has recorded for one account, newest
        first. Verification runs and standalone admin screenings are both
        listed.
      </p>
      <form
        method="get"
        action="/admin/aml"
        aria-label="Find screening history"
        className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end"
      >
        <div>
          <label htmlFor="aml-subject" className="text-sm font-medium text-ink">
            Account id
          </label>
          <input
            id="aml-subject"
            name="subject"
            defaultValue={subject}
            required
            maxLength={200}
            autoComplete="off"
            spellCheck={false}
            className={`mt-2 font-mono text-sm ${adminFieldClass}`}
          />
        </div>
        <div>
          <label htmlFor="aml-kind" className="text-sm font-medium text-ink">
            Subject type
          </label>
          <select
            id="aml-kind"
            name="kind"
            defaultValue={kind}
            className={`mt-2 sm:w-40 ${adminFieldClass}`}
          >
            {AML_KINDS.map((option) => (
              <option key={option} value={option}>
                {AML_KIND_LABELS[option]}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="md" className="cursor-pointer">
          Load history
        </Button>
      </form>
      <div className="mt-6">
        {read === null ? (
          <p className="rounded-xl border border-dashed border-border bg-canvas p-4 text-xs text-muted">
            Enter an account id to load its screening history.
          </p>
        ) : read.status === "unavailable" ? (
          <p className="rounded-xl border border-border bg-canvas p-4 text-sm leading-6 text-ink [overflow-wrap:anywhere]">
            {read.message}
          </p>
        ) : read.screenings.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-canvas p-4 text-xs text-muted">
            The service has no screenings recorded for this account.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-canvas text-muted">
                <tr>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Screened
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Result
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Matches
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Top score
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Datasets
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {read.screenings.map((record) => (
                  <tr key={record.id}>
                    <td className="px-3 py-2 text-muted">
                      {formatAccessDate(record.createdAt)}
                    </td>
                    <td className="px-3 py-2">
                      <Pill tone={AML_STATUS_TONES[record.status]} size="xs">
                        {AML_STATUS_LABELS[record.status]}
                      </Pill>
                    </td>
                    <td className="px-3 py-2 font-mono tabular-nums text-ink">
                      {record.totalHits}
                    </td>
                    <td className="px-3 py-2 font-mono tabular-nums text-ink">
                      {record.topRiskScore === null
                        ? "—"
                        : record.topRiskScore.toFixed(2)}
                    </td>
                    <td className="max-w-64 px-3 py-2 text-muted [overflow-wrap:anywhere]">
                      {record.datasets.length
                        ? record.datasets.join(", ")
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-muted">
                      {AML_SOURCE_LABELS[record.source]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export function readAmlSearchParams(
  params: Record<string, string | string[] | undefined>,
): { subject: string; kind: AmlKind } {
  return {
    subject:
      typeof params.subject === "string"
        ? params.subject.trim().slice(0, 200)
        : "",
    kind: isAmlKind(params.kind) ? params.kind : "individual",
  };
}
