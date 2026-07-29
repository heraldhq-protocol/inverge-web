import type { Metadata } from 'next';
import { SITE } from './site';

type ArticleMeta = { publishedTime?: string; authors?: string[]; section?: string };

/**
 * Per-page metadata builder. Sets the title (the root `title.template` appends the brand),
 * and mirrors title/description into OpenGraph and Twitter so every route has a correct
 * social card. The OG *image* is supplied separately by the nearest `opengraph-image` file
 * convention — Next injects it into `openGraph.images`/`twitter.images` automatically, so it
 * must not be set here. Pass `article` on long-form pages to emit `og:type="article"`.
 */
export function pageMetadata({
  title,
  description,
  path,
  article,
}: {
  title: string;
  description: string;
  /** Route path for canonical + og:url, e.g. "/about". */
  path: string;
  article?: ArticleMeta;
}): Metadata {
  const socialTitle = `${title} — ${SITE.name}`;

  const openGraph: Metadata['openGraph'] = article
    ? {
        type: 'article',
        siteName: SITE.name,
        locale: SITE.locale,
        url: path,
        title: socialTitle,
        description,
        publishedTime: article.publishedTime,
        authors: article.authors,
        section: article.section,
      }
    : {
        type: 'website',
        siteName: SITE.name,
        locale: SITE.locale,
        url: path,
        title: socialTitle,
        description,
      };

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
    },
  };
}
