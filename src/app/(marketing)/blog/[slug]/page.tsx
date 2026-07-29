import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Prose } from '@/components/marketing/prose';
import { CtaBand } from '@/components/marketing/cta-band';
import { POSTS, getPost } from '@/lib/content/posts';

// Next 16: params is a Promise (conventions §2.1).
type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'Post not found — Inverge' };
  return {
    title: `${post.title} — Inverge Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <article>
        <header className="bg-paper pt-14 pb-10 md:pt-20 md:pb-12">
          <Container className="max-w-3xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-accent-700"
            >
              <span aria-hidden="true">←</span> All posts
            </Link>

            <div className="mt-6 flex flex-col gap-5">
              <Eyebrow>{post.category}</Eyebrow>
              <h1 className="font-display text-3xl font-bold tracking-tight text-ink text-balance sm:text-4xl md:text-5xl">
                {post.title}
              </h1>
              <p className="text-sm text-ink-muted">
                By {post.author}
                <span aria-hidden="true"> · </span>
                <time dateTime={post.date}>{post.dateLabel}</time>
                <span aria-hidden="true"> · </span>
                {post.readingTime}
              </p>
            </div>
          </Container>
        </header>

        <Container className="max-w-3xl pb-16 md:pb-24">
          <div
            aria-hidden="true"
            className="mb-10 h-40 rounded-3xl bg-gradient-to-br from-accent-500 to-forest sm:h-56"
          />
          <Prose className="text-base">{post.body}</Prose>
        </Container>
      </article>

      <CtaBand
        title="Back a builder you believe in"
        body="Every idea on Inverge is raising in milestones, with proof at every stage."
        primary={{ label: 'Explore ideas', href: '/ideas' }}
        secondary={{ label: 'Start an idea', href: '/ideas/new' }}
      />
    </>
  );
}
