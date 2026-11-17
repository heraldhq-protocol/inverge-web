import type { Metadata } from "next";

import {
  AdminPageHeader,
  AdminUnavailable,
} from "@/features/admin/components/admin-workspace-ui";
import {
  AmlHistorySection,
  readAmlSearchParams,
} from "@/features/admin/components/aml-history";
import { AmlScreening } from "@/features/admin/components/aml-screening";
import { requireAdminApiSession } from "@/features/admin/server/admin-api";
import { listAmlScreenings } from "@/features/admin/server/aml";

export const metadata: Metadata = {
  title: "AML screening",
  description:
    "Screen an individual or business subject against sanctions and watchlist datasets and review the recorded history.",
  robots: { index: false, follow: false },
};

export default async function AdminAmlPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { subject, kind } = readAmlSearchParams(params);
  const session = await requireAdminApiSession();

  if (!session.ok) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <AdminPageHeader
          title="AML screening"
          description="Screen an individual or business subject against sanctions and watchlist datasets and review the recorded history."
        />
        <div className="mt-6">
          <AdminUnavailable message={session.message} />
        </div>
      </div>
    );
  }

  // The history read happens on the server only when a subject is requested,
  // so the common screening flow makes no extra request.
  const history = subject
    ? await listAmlScreenings({ userId: subject, kind })
    : null;

  return (
    <div className="mx-auto w-full max-w-7xl">
      <AdminPageHeader
        title="AML screening"
        description="Screen an individual or business subject against sanctions and watchlist datasets and review the recorded history."
      />
      <AmlScreening />
      <AmlHistorySection subject={subject} kind={kind} read={history} />
    </div>
  );
}
