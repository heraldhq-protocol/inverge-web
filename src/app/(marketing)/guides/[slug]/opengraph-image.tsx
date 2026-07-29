import { ogImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
import { GUIDES, getGuide } from '@/lib/content/guides';
import { SITE } from '@/lib/site';

export const alt = `${SITE.name} guides`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Prerender one card per guide, matching the page's static params.
export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  return ogImageResponse({
    eyebrow: guide?.audience ?? 'Guide',
    title: guide?.title ?? 'Inverge Guides',
  });
}
