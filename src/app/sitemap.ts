import type { MetadataRoute } from "next";

import { campaignCategoryRoutes } from "@/features/campaigns/lib/taxonomy";
import { allPublicCampaigns } from "@/features/campaigns/server/campaigns";
import { previewTopics } from "@/features/ideas/content/topics";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import { allPublicIdeas } from "@/features/ideas/lib/catalog";
import { guides, journalEntries } from "@/features/marketing/content/editorial";
import { absoluteUrl } from "@/lib/seo/site";

/**
 * A page whose only purpose is navigation, and which no one needs to land on
 * from a search result.
 */
type SitemapEntry = {
  changeFrequency: "daily" | "monthly" | "weekly" | "yearly";
  path: string;
  priority: number;
};

const STATIC_ROUTES: readonly SitemapEntry[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/ideas", changeFrequency: "daily", priority: 0.9 },
  { path: "/campaigns", changeFrequency: "daily", priority: 0.9 },
  { path: "/ideathon", changeFrequency: "weekly", priority: 0.8 },
  { path: "/ideathon/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/ideathon/rules", changeFrequency: "monthly", priority: 0.5 },
  { path: "/ideathon/past", changeFrequency: "monthly", priority: 0.4 },
  { path: "/guides", changeFrequency: "monthly", priority: 0.7 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/about", changeFrequency: "yearly", priority: 0.5 },
  { path: "/careers", changeFrequency: "monthly", priority: 0.3 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.3 },
  { path: "/help", changeFrequency: "monthly", priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
];

/**
 * The indexable public routes.
 *
 * An idea is listed only when its visibility is `public`: an unlisted idea is
 * still readable by anyone holding the link, but must not be discoverable
 * through search. The same rule drives the detail page's `noindex`, so a page
 * and its sitemap entry can never disagree.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const publicIdeas = allPublicIdeas(ideasPreviewData).filter(
    (idea) => idea.visibility === "public",
  );

  const publicIdeaIds = new Set(publicIdeas.map((idea) => idea.id));

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ changeFrequency, path, priority }) => ({
      changeFrequency,
      priority,
      url: absoluteUrl(path),
    }),
  );

  for (const idea of publicIdeas) {
    entries.push({
      changeFrequency: "weekly",
      priority: 0.8,
      url: absoluteUrl(`/ideas/${idea.id}`),
    });
  }

  // A topic with no public idea would be an empty landing page, so it is
  // withheld rather than published with a count that says nothing.
  for (const topic of previewTopics) {
    if (!topic.ideaIds.some((id) => publicIdeaIds.has(id))) continue;

    entries.push({
      changeFrequency: "weekly",
      priority: 0.6,
      url: absoluteUrl(`/topics/${topic.slug}`),
    });
  }

  for (const guide of guides) {
    entries.push({
      changeFrequency: "monthly",
      priority: 0.6,
      url: absoluteUrl(`/guides/${guide.slug}`),
    });
  }

  for (const entry of journalEntries) {
    entries.push({
      changeFrequency: "monthly",
      priority: 0.6,
      url: absoluteUrl(`/blog/${entry.slug}`),
    });
  }

  // A campaign is listed only while it is publicly readable, using the same
  // check its detail page applies, so a sitemap entry and a reachable page can
  // never disagree.
  const publicCampaigns = allPublicCampaigns();

  for (const campaign of publicCampaigns) {
    entries.push({
      changeFrequency: "weekly",
      priority: 0.8,
      url: absoluteUrl(`/campaigns/${campaign.slug}`),
    });
    entries.push({
      changeFrequency: "weekly",
      priority: 0.5,
      url: absoluteUrl(`/campaigns/${campaign.slug}/recommended`),
    });
  }

  // A category or subcategory with no public campaign would be an empty landing
  // page, so it is withheld rather than published with a count that says
  // nothing. The route still accepts every taxonomy slug and renders an honest
  // empty state; it simply is not advertised to crawlers.
  const populatedCategories = new Set(
    publicCampaigns.flatMap((campaign) =>
      campaign.taxonomy ? [campaign.taxonomy.category] : [],
    ),
  );
  const populatedSubcategories = new Set(
    publicCampaigns.flatMap((campaign) =>
      campaign.taxonomy?.subcategory
        ? [`${campaign.taxonomy.category}/${campaign.taxonomy.subcategory}`]
        : [],
    ),
  );

  for (const route of campaignCategoryRoutes) {
    if (!populatedCategories.has(route.categorySlug)) continue;
    if (
      route.subcategorySlug &&
      !populatedSubcategories.has(
        `${route.categorySlug}/${route.subcategorySlug}`,
      )
    ) {
      continue;
    }

    entries.push({
      changeFrequency: "weekly",
      priority: route.subcategorySlug ? 0.5 : 0.6,
      url: absoluteUrl(
        route.subcategorySlug
          ? `/campaigns/categories/${route.categorySlug}/${route.subcategorySlug}`
          : `/campaigns/categories/${route.categorySlug}`,
      ),
    });
  }

  return entries;
}
