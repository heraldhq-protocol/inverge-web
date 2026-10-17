import type { Metadata } from "next";

import { AppShell } from "@/features/app-shell/components/app-shell";
import { PRIVATE_ROBOTS } from "@/lib/seo/metadata";

/**
 * The signed-in dashboard holds a creator's own analytics, pre-pledges, and
 * settings. None of it belongs in an index, and none of it is protected by
 * this line: the routes are gated on the server.
 */
export const metadata: Metadata = { robots: PRIVATE_ROBOTS };

export default function ProductLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}
