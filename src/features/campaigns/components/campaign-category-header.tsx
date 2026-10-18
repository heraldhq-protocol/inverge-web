import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { DiscoveryCategory } from "@/features/home/discovery-categories";
import { categoryLabel } from "@/features/campaigns/lib/filters";

/**
 * The heading above one category's campaigns.
 *
 * It states the count from the same source the grid below filters, so the number
 * in the heading and the number of cards on screen cannot disagree.
 */
export function CampaignCategoryHeader({
  category,
  count,
}: {
  category: DiscoveryCategory;
  count: number;
}) {
  const label = categoryLabel(category);

  return (
    <section className="border-b border-border/80 bg-canvas">
      <Container className="pb-7 pt-8 sm:pb-9 sm:pt-11">
        <nav aria-label="Breadcrumb" className="text-xs text-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li className="flex items-center gap-1.5">
              <Link
                href="/campaigns"
                className="rounded font-medium text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Campaigns
              </Link>
              <span aria-hidden="true">/</span>
            </li>
            <li>
              <span className="truncate text-ink">{label}</span>
            </li>
          </ol>
        </nav>

        <Eyebrow>{label}</Eyebrow>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.045em] text-ink sm:text-4xl">
          {label} campaigns
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          {count === 1
            ? "1 campaign is raising in this category."
            : `${count} campaigns are raising in this category.`}{" "}
          Each one has published a milestone plan and set its evidence before
          funding opened.
        </p>
      </Container>
    </section>
  );
}
