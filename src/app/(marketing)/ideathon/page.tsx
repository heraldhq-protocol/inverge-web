import type { Metadata } from "next";

import { NextIdeathonBanner } from "@/features/ideathon/components/next-ideathon-banner";
import { CompetitionSidebar } from "@/features/ideathon/components/competition-sidebar";
import { ProgrammePublicSections } from "@/features/ideathon/components/programme-public-sections";
import { StandingsTable } from "@/features/ideathon/components/standings-table";
import { competitionFromProgramme } from "@/features/ideathon/content/from-programme";
import { getPreviewActiveIdeathon } from "@/features/programmes/content/preview-programmes";
import {
  categoryBreakdown,
  competitionTotals,
} from "@/features/ideathon/lib/standings";

export const metadata: Metadata = {
  title: "Ideathon standings | Inverge",
  description:
    "Community standings for the current Inverge programme, ranked by verified support.",
};

export default function IdeathonStandingsPage() {
  const programme = getPreviewActiveIdeathon();
  const competition = competitionFromProgramme(programme);
  const categories = categoryBreakdown(competition.entries);
  const totals = competitionTotals(competition.entries);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-8">
        <StandingsTable
          categories={categories}
          entries={competition.entries}
          updatedAt={competition.updatedAt}
        />
        <CompetitionSidebar
          categories={categories}
          competition={competition}
          programme={programme}
          totals={totals}
        />
      </div>

      <ProgrammePublicSections competition={competition} programme={programme} />

      <div className="mt-8">
        <NextIdeathonBanner />
      </div>
    </>
  );
}
