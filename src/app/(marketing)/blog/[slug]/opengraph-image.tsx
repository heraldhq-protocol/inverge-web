import { ogImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
import { POSTS, getPost } from '@/lib/content/posts';
import { SITE } from '@/lib/site';

export const alt = `${SITE.name} blog`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Prerender one card per post, matching the page's static params.
export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  return ogImageResponse({
    eyebrow: post?.category ?? 'Blog',
    title: post?.title ?? 'Inverge Blog',
  });
}
