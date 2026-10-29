import type { Metadata } from "next";

import { WaitlistView } from "@/features/marketing/components/waitlist/waitlist-view";
import type { WaitlistLaneId } from "@/features/marketing/content/waitlist";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  description:
    "Join the Inverge launch list to back milestone-escrowed campaigns or bring your own idea. One email when your lane opens.",
  og: { eyebrow: "Launch list", template: "marketing" },
  path: "/waitlist",
  title: "Join the launch list",
});

type WaitlistPageProps = {
  searchParams: Promise<{ lane?: string | string[] }>;
};

export default async function WaitlistPage({
  searchParams,
}: WaitlistPageProps) {
  const { lane } = await searchParams;
  const initialLane: WaitlistLaneId = lane === "builder" ? "builder" : "backer";

  return <WaitlistView initialLane={initialLane} />;
}
