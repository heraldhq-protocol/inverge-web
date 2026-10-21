import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import {
  campaignCategoryPath,
  type CampaignCategoryNode,
  type CampaignSubcategoryNode,
} from "@/features/campaigns/lib/taxonomy";

/**
 * The heading above one category or subcategory.
 *
 * It states the count from the same public set the grid below filters, so the
 * number in the heading and the number of cards on screen cannot disagree. The
 * category page also lists its children, which keeps every taxonomy page one
 * click from discovery instead of hiding 154 subcategories in a select.
 */
export function CampaignCategoryHeader({
  category,
  count,
  subcategory = null,
  subcategoryCounts = {},
}: {
  category: CampaignCategoryNode;
  count: number;
  subcategory?: CampaignSubcategoryNode | null;
  subcategoryCounts?: Readonly<Record<string, number>>;
}) {
  const label = subcategory?.label ?? category.label;
  const countLabel =
    count === 1
      ? "1 public campaign is listed here."
      : `${count} public campaigns are listed here.`;

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
            <li className="flex items-center gap-1.5">
              {subcategory ? (
                <>
                  <Link
                    href={campaignCategoryPath(category.slug)}
                    className="rounded font-medium text-brand-strong hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    {category.label}
                  </Link>
                  <span aria-hidden="true">/</span>
                </>
              ) : null}
            </li>
            <li>
              <span aria-current="page" className="truncate text-ink">
                {label}
              </span>
            </li>
          </ol>
        </nav>

        <Eyebrow>{category.label}</Eyebrow>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.045em] text-ink sm:text-4xl">
          {label} campaigns
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          {countLabel}
          {subcategory
            ? ` Part of ${category.label}.`
            : " Browse every subcategory or search within the category."}
        </p>

        {!subcategory && category.subcategories.length > 0 ? (
          <nav aria-label={`${category.label} subcategories`} className="mt-5">
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link
                  href={campaignCategoryPath(category.slug)}
                  aria-current="page"
                  className="inline-flex min-h-10 items-center rounded-full border border-brand bg-brand/10 px-3.5 text-sm font-semibold text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  All {category.label}
                </Link>
              </li>
              {category.subcategories.map((child) => (
                <li key={child.id}>
                  <Link
                    href={campaignCategoryPath(category.slug, child.slug)}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 text-sm font-medium text-ink transition-colors hover:border-brand/45 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    {child.label}
                    <span className="text-xs text-muted">
                      {subcategoryCounts[child.slug] ?? 0}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </Container>
    </section>
  );
}
