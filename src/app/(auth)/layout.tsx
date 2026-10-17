import type { Metadata } from "next";

import { PRIVATE_ROBOTS } from "@/lib/seo/metadata";

/**
 * Account and onboarding routes are reachable only through a session, so they
 * are excluded from search. The server gate remains the real protection;
 * `noindex` is a second, independent signal.
 */
export const metadata: Metadata = { robots: PRIVATE_ROBOTS };

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
