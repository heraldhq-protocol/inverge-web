import Link from "next/link";

import { Cover } from "@/components/ui/cover";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { CampaignBreadcrumbs } from "@/features/campaigns/components/campaign-breadcrumbs";
import {
  campaignCategoryHref,
  campaignTaxonomyText,
} from "@/features/campaigns/lib/filters";
import type { Campaign } from "@/features/campaigns/types";

/**
 * Context for the recommendations page.
 *
 * The page is an extension of the source campaign, not a generic "for you"
 * surface. It names the campaign being continued and states the deterministic
 * rule, so a reader can tell why these campaigns and not others.
 */
export function CampaignRecommendationsHeader({
  source,
}: {
  source: Campaign;
}) {
  const categoryHref = campaignCategoryHref(source);

  return (
    <section className="border-b border-border/80 bg-canvas">
      <Container className="pb-7 pt-8 sm:pb-9 sm:pt-11">
        <CampaignBreadcrumbs
          trail={[
            { href: "/", label: "Home" },
            { href: "/campaigns", label: "Campaigns" },
            ...(categoryHref
              ? [
                  {
                    href: categoryHref,
                    label: campaignTaxonomyText(source),
                  },
                ]
              : []),
            { href: `/campaigns/${source.slug}`, label: source.title },
            { label: "Recommended" },
          ]}
        />

        <Eyebrow>Recommended</Eyebrow>
        <h1 className="mt-3 max-w-3xl text-balance text-3xl font-bold tracking-[-0.045em] text-ink sm:text-4xl">
          More campaigns you might like
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Suggestions for backers of {source.title}, ordered by shared
          subcategory, then shared category, then editorially featured. This is
          a deterministic rule, not a behavioural score or a paid placement.
        </p>

        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 sm:max-w-xl">
          <div className="w-20 shrink-0 overflow-hidden rounded-xl">
            <Cover
              seed={source.slug}
              label={campaignTaxonomyText(source)}
              src={source.cover}
              ratio="thumbnail"
              size="lane"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted">
              Because you’re viewing
            </p>
            <Link
              href={`/campaigns/${source.slug}`}
              className="mt-0.5 block truncate rounded font-semibold text-ink hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {source.title}
            </Link>
            <p className="mt-0.5 truncate text-xs text-muted">
              {campaignTaxonomyText(source)}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
