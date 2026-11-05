import type { Metadata } from "next";

import {
  AdminPageHeader,
  AdminUnavailable,
} from "@/features/admin/components/admin-workspace-ui";
import { ModerationScreening } from "@/features/admin/components/moderation-screening";
import { requireAdminApiSession } from "@/features/admin/server/admin-api";

export const metadata: Metadata = {
  title: "Moderation screening",
  description:
    "Screen idea and campaign text for policy findings before review.",
  robots: { index: false, follow: false },
};

export default async function ModerationPage() {
  const session = await requireAdminApiSession();
  return (
    <div className="mx-auto w-full max-w-7xl">
      <AdminPageHeader
        title="Moderation screening"
        description="Check idea or campaign text for policy findings and review the service's advisory explanation."
      />
      {session.ok ? (
        <ModerationScreening actorId={session.actorId} />
      ) : (
        <AdminUnavailable message={session.message} />
      )}
    </div>
  );
}
