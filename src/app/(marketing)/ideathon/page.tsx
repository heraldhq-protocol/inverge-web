import type { Metadata } from "next";

import { NextIdeathonBanner } from "@/features/ideathon/components/next-ideathon-banner";
import { CompetitionSidebar } from "@/features/ideathon/components/competition-sidebar";
import { StandingsTable } from "@/features/ideathon/components/standings-table";
import { previewCompetition } from "@/features/ideathon/content/preview-competition";
import {
  categoryBreakdown,
  competitionTotals,
} from "@/features/ideathon/lib/standings";

export const metadata: Metadata = {
  title: "Ideathon standings | Inverge",
  description:
    "Community standings for the current Inverge monthly ideathon, ranked by verified support.",
};

export default function IdeathonStandingsPage() {
  const categories = categoryBreakdown(previewCompetition.entries);
  const totals = competitionTotals(previewCompetition.entries);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-8">
        <StandingsTable
          categories={categories}
          entries={previewCompetition.entries}
          updatedAt={previewCompetition.updatedAt}
        />
        <CompetitionSidebar
          categories={categories}
          competition={previewCompetition}
          totals={totals}
        />
      </div>

      <div className="mt-8">
        <NextIdeathonBanner />
      </div>
    </>
  );
}
