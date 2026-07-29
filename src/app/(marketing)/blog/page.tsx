import React from 'react';
import { pageMetadata } from '@/lib/metadata';
import Link from 'next/link';
import { PageHeader } from '@/components/marketing/page-header';
import { Container } from '@/components/ui/container';
import { POSTS, type Post } from '@/lib/content/posts';

export const metadata = pageMetadata({
  title: 'Blog',
  description:
    'Product thinking, builder stories, and insights on backing early-stage builders across Africa.',
  path: '/blog',
});

function CategoryTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-accent-700">
      {children}
    </span>
  );
}

function PostMeta({ post }: { post: Post }) {
  return (
    <p className="text-xs text-ink-muted">
      <time dateTime={post.date}>{post.dateLabel}</time>
      <span aria-hidden="true"> · </span>
      {post.readingTime}
    </p>
  );
}

export default function BlogPage() {
  const [featured, ...rest] = POSTS;

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Notes from the build"
        lede="Product thinking, builder stories, and what we’re learning about backing early-stage builders across Africa."
      />

      <Container className="pb-16 md:pb-24">
        {/* Featured post */}
        <Link
          href={`/blog/${featured.slug}`}
          className="group block overflow-hidden rounded-3xl border border-border bg-surface shadow-lift transition-shadow hover:shadow-lift-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          data-reveal
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div
              aria-hidden="true"
              className="relative min-h-[200px] bg-gradient-to-br from-accent-500 to-forest lg:min-h-[340px]"
            >
              <span className="absolute bottom-4 left-5 font-display text-sm font-semibold uppercase tracking-widest text-white/80">
                Featured
              </span>
            </div>
            <div className="flex flex-col gap-4 p-6 sm:p-8 lg:p-10">
              <CategoryTag>{featured.category}</CategoryTag>
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink text-balance group-hover:text-accent-700 sm:text-3xl">
                {featured.title}
              </h2>
              <p className="leading-relaxed text-ink-muted text-pretty">{featured.excerpt}</p>
              <div className="mt-auto flex items-center justify-between pt-2">
                <PostMeta post={featured} />
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700">
                  Read
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Grid of remaining posts */}
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-stagger>
          {rest.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
              >
                <div
                  aria-hidden="true"
                  className="h-32 bg-gradient-to-br from-accent-100 to-accent-500/40"
                />
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <CategoryTag>{post.category}</CategoryTag>
                  <h3 className="font-display text-lg font-semibold text-ink text-balance group-hover:text-accent-700">
                    {post.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-muted line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto pt-2">
                    <PostMeta post={post} />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
