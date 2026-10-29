import type { Metadata } from "next";

import { AdminAdvertising } from "@/features/advertising/components/admin-advertising";
import { getProgrammeAdminAccess } from "@/features/programmes/server/access";

export const metadata: Metadata = {
  title: "Advertising inventory",
  description:
    "Create, approve, schedule, pause, and end labelled paid placements in the Inverge preview workspace.",
  robots: { follow: false, index: false },
};

/**
 * Advertising inventory workspace.
 *
 * The page repeats the layout's access check rather than relying on it, so the
 * route cannot render a client editor if the layout changes. The component
 * still checks every action's permission; hiding this page is not
 * authorization, and the API remains the authority.
 */
export default async function AdminAdvertisingPage() {
  const access = await getProgrammeAdminAccess();
  if (!access.allowed) return null;

  return (
    <AdminAdvertising actor={access.actor} nowIso={new Date().toISOString()} />
  );
}
