import type { Metadata } from "next";

import { IdeasDashboard } from "@/features/ideas/components/ideas-dashboard";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";

export const metadata: Metadata = {
  title: "Discover ideas | Inverge",
  description:
    "Browse public validation signals for early-stage ideas from African builders.",
};

export default function DiscoverIdeasPage() {
  return <IdeasDashboard data={ideasPreviewData} viewer="visitor" />;
}
