import type { Metadata } from "next";

import { ProgrammeWorkspaceLoader } from "@/features/programmes/components/programme-workspace-loader";
import { getPreviewProgramme } from "@/features/programmes/content/preview-programmes";

export const metadata: Metadata = {
  title: "Programme workspace | Inverge admin",
  description:
    "Manage participants, submissions, judging, rewards, sponsors, and settings for one programme.",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProgrammeWorkspacePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const tab = Array.isArray(query.tab) ? query.tab[0] : query.tab;

  return (
    <ProgrammeWorkspaceLoader
      initialProgramme={getPreviewProgramme(id) ?? null}
      programmeId={id}
      initialTab={tab}
    />
  );
}
