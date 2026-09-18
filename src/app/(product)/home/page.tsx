import type { Metadata } from "next";

import { HomeDashboard } from "@/features/home/components/home-dashboard";
import { homePreviewData } from "@/features/home/content/preview-data";

export const metadata: Metadata = {
  title: "Home | Inverge",
  description: "Discover ideas and continue your activity on Inverge.",
};

type HomePageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.slice(0, 120) : "";

  return <HomeDashboard data={homePreviewData} query={query} />;
}
