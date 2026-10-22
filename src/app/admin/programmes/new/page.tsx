import type { Metadata } from "next";

import { ProgrammeWizard } from "@/features/programmes/components/programme-wizard";
import {
  getPreviewProgramme,
  previewProgrammes,
} from "@/features/programmes/content/preview-programmes";

export const metadata: Metadata = {
  title: "Create a programme admin",
  description:
    "Configure identity, schedule, submissions, prizes, judging, and modules for a new programme.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewProgrammePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const from = Array.isArray(params.from) ? params.from[0] : params.from;
  const source =
    from === "latest"
      ? previewProgrammes[0]
      : from
        ? getPreviewProgramme(from)
        : undefined;

  return <ProgrammeWizard duplicateFrom={source} />;
}
