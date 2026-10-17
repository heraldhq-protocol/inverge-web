import type { Metadata } from "next";

import { ProgrammeDashboard } from "@/features/programmes/components/programme-dashboard";
import { previewProgrammes } from "@/features/programmes/content/preview-programmes";

export const metadata: Metadata = {
  title: "Programmes | Inverge admin",
  description: "Run ideathons, challenges, showcases, and workshops.",
};

export default function AdminProgrammesPage() {
  return <ProgrammeDashboard initialProgrammes={previewProgrammes} />;
}
