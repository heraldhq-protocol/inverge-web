import type { Metadata } from "next";

import { HomeDashboard } from "@/features/home/components/home-dashboard";
import { homePreviewData } from "@/features/home/content/preview-data";
import {
  isDiscoveryCategory,
  type DiscoveryCategory,
} from "@/features/home/discovery-categories";

export const metadata: Metadata = {
  title: "Home | Inverge",
  description: "Discover ideas and continue your activity on Inverge.",
};

type HomePageProps = {
  searchParams: Promise<{
    category?: string | string[];
    q?: string | string[];
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { category, q } = await searchParams;
  const query = typeof q === "string" ? q.slice(0, 120) : "";
  const selectedCategory: DiscoveryCategory =
    typeof category === "string" && isDiscoveryCategory(category)
      ? category
      : "technology";

  return (
    <HomeDashboard
      data={homePreviewData}
      query={query}
      selectedCategory={selectedCategory}
    />
  );
}
