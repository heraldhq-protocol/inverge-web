import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { CompetitionHero } from "@/features/ideathon/components/competition-hero";
import { CompetitionNav } from "@/features/ideathon/components/competition-nav";
import { competitionFromProgramme } from "@/features/ideathon/content/from-programme";
import { getPreviewActiveIdeathon } from "@/features/programmes/content/preview-programmes";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  description:
    "Explore the ideas competing in Inverge's current programme, see how the community is responding, and support the builders behind them.",
  og: { eyebrow: "Ideathon", template: "ideathon" },
  path: "/ideathon",
  title: "Monthly ideathon",
});

export default function IdeathonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const programme = getPreviewActiveIdeathon();
  const competition = competitionFromProgramme(programme);

  return (
    <>
      <CompetitionHero competition={competition} programme={programme} />
      <Container>
        <CompetitionNav />
        <div className="py-6 sm:py-7">{children}</div>
      </Container>
    </>
  );
}
