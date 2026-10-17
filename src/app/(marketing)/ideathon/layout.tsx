import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { CompetitionHero } from "@/features/ideathon/components/competition-hero";
import { CompetitionNav } from "@/features/ideathon/components/competition-nav";
import { previewCompetition } from "@/features/ideathon/content/preview-competition";

export const metadata: Metadata = {
  title: "Monthly ideathon | Inverge",
  description:
    "Explore the ideas competing in Inverge's monthly ideathon, see how the community is responding, and support the builders behind them.",
};

export default function IdeathonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CompetitionHero competition={previewCompetition} />
      <Container>
        <CompetitionNav />
        <div className="py-6 sm:py-7">{children}</div>
      </Container>
    </>
  );
}
