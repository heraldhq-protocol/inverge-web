import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";

import { campaignCategoryRoutes } from "@/features/campaigns/lib/taxonomy";
import { allPublicCampaigns } from "@/features/campaigns/server/campaigns";
import { getLiveCampaignsForSitemap } from "@/features/campaigns/server/campaign-surfaces";
import { campaignHref } from "@/features/campaigns/server/live-campaigns";
import { previewTopics } from "@/features/ideas/content/topics";
import { ideasPreviewData } from "@/features/ideas/content/preview-data";
import { allPublicIdeas } from "@/features/ideas/lib/catalog";
import {
  getLiveIdeasWindow,
  toDiscoveryIdea,
} from "@/features/ideas/server/live-ideas";
import { guides, journalEntries } from "@/features/marketing/content/editorial";
import { isApiConfigured } from "@/lib/api/server";
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

/**
 * The number of dynamic records a sitemap may read.
 *
 * Bounded on purpose: a catalogue of tens of thousands of ideas should be split
 * into multiple sitemaps before the cap is raised, not fetched in one request.
 */
const DYNAMIC_LIMIT = 500;

const STATIC_ROUTES: readonly SitemapEntry[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/ideas", changeFrequency: "daily", priority: 0.9 },
  { path: "/campaigns", changeFrequency: "daily", priority: 0.9 },
  { path: "/waitlist", changeFrequency: "weekly", priority: 0.8 },
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

function staticEntries(): MetadataRoute.Sitemap {
  return STATIC_ROUTES.map(({ changeFrequency, path, priority }) => ({
    changeFrequency,
    priority,
    url: absoluteUrl(path),
  }));
}

function editorialEntries(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

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

  return entries;
}

/**
 * The sitemap for a deployment with no API.
 *
 * Fixtures are the only catalogue in that mode, so they are the only honest
 * source. This is the repository's original behaviour, kept for local preview.
 */
function previewEntries(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    ...staticEntries(),
    ...editorialEntries(),
  ];

  const publicIdeas = allPublicIdeas(ideasPreviewData).filter(
    (idea) => idea.visibility === "public",
  );
  const publicIdeaIds = new Set(publicIdeas.map((idea) => idea.id));

  for (const idea of publicIdeas) {
    entries.push({
      changeFrequency: "weekly",
      priority: 0.8,
      url: absoluteUrl(`/ideas/${idea.id}`),
    });
  }

  for (const topic of previewTopics) {
    if (!topic.ideaIds.some((id) => publicIdeaIds.has(id))) continue;

    entries.push({
      changeFrequency: "weekly",
      priority: 0.6,
      url: absoluteUrl(`/topics/${topic.slug}`),
    });
  }

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

/**
 * The sitemap for an API-backed deployment.
 *
 * Only records a visitor can actually reach are listed: ideas the discovery
 * list returns, campaigns with a public status, and the category pages those
 * campaigns populate. An API failure returns the static and editorial pages
 * rather than advertising fixtures that no longer exist in production.
 */
async function liveEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    ...staticEntries(),
    ...editorialEntries(),
  ];

  try {
    const [ideaLinks, campaigns] = await Promise.all([
      getLiveIdeasWindow({ max: DYNAMIC_LIMIT }),
      getLiveCampaignsForSitemap(DYNAMIC_LIMIT),
    ]);

    for (const idea of ideaLinks.ideas.map(toDiscoveryIdea)) {
      if (idea.visibility !== "public") continue;
      entries.push({
        changeFrequency: "weekly",
        priority: 0.8,
        url: absoluteUrl(`/ideas/${idea.id}`),
      });
    }

    const categories = new Set<string>();
    const subcategories = new Set<string>();

    for (const campaign of campaigns) {
      const href = campaignHref(campaign);
      entries.push({
        changeFrequency: "weekly",
        priority: 0.8,
        url: absoluteUrl(href),
      });
      entries.push({
        changeFrequency: "weekly",
        priority: 0.5,
        url: absoluteUrl(`${href}/recommended`),
      });

      if (campaign.taxonomyCategory) {
        categories.add(campaign.taxonomyCategory);
        if (campaign.taxonomySubcategory) {
          subcategories.add(
            `${campaign.taxonomyCategory}/${campaign.taxonomySubcategory}`,
          );
        }
      }
    }

    for (const route of campaignCategoryRoutes) {
      if (!categories.has(route.categorySlug)) continue;
      if (
        route.subcategorySlug &&
        !subcategories.has(`${route.categorySlug}/${route.subcategorySlug}`)
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
  } catch {
    // Keep the static surface indexable. Dynamic pages are omitted rather than
    // replaced with fixture URLs that would 404 on the live deployment.
  }

  return entries;
}

/**
 * The sitemap is a public read with no per-user data. The Next.js data cache
 * holds the dynamic half for an hour, so a crawler cannot turn every request
 * into two API list reads. New records appear within that window; there is no
 * editorial invalidation trigger to wire because the catalogue is written by
 * creators.
 */
const cachedLiveEntries = unstable_cache(liveEntries, ["marketing-sitemap"], {
  revalidate: 3600,
  tags: ["marketing-sitemap"],
});

/**
 * The indexable public routes.
 *
 * An idea is listed only when its visibility is `public`: an unlisted idea is
 * still readable by anyone holding the link, but must not be discoverable
 * through search. The same rule drives the detail page's `noindex`, so a page
 * and its sitemap entry can never disagree.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = isApiConfigured()
    ? await cachedLiveEntries()
    : previewEntries();

  // A URL should appear once even when a fixture or taxonomy route is reachable
  // through more than one source.
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
