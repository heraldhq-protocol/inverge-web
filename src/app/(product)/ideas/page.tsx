import type { Metadata } from "next";

import { IdeasDashboard } from "@/features/ideas/components/ideas-dashboard";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";

export const metadata: Metadata = {
  title: "Discover ideas | Inverge",
  description:
    "Explore early-stage ideas gathering support, feedback, and pre-pledge intent on Inverge.",
};

export default function IdeasPage() {
  return <IdeasDashboard data={ideasPreviewData} />;
}
